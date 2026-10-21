import { eq, lt, notInArray } from 'drizzle-orm'
import type { LibSQLDatabase } from 'drizzle-orm/libsql'
import * as tables from '../db/schema'
import type { S3Fetch } from './s3fetch'
import { getStorageKeys } from '../utils/utils'

type Db = LibSQLDatabase<typeof tables>
type OrgRow = typeof tables.organizations.$inferSelect
type AppRow = typeof tables.apps.$inferSelect
type ArtifactRow = typeof tables.artifacts.$inferSelect

export type RetentionMode = 'latest' | 'days' | 'both'

export interface EffectiveRetentionSettings {
    enabled: boolean
    mode: RetentionMode
    keepLatest: number
    keepDays: number
}

export interface ArtifactForRetention {
    id: string
    fileObjectKey: string
    fileObjectApkKey: string | null
    versionName2: string
    versionCode2: string
    createdAt: Date | null
    releaseId: number
    fileContentLength: number | null
    fileApkContentLength: number | null
}

export interface RetentionPlan {
    appSettings: EffectiveRetentionSettings
    artifactsToDelete: ArtifactForRetention[]
}

export interface RetentionResult {
    deleted: number
    failed: number
    errors: string[]
}

const DEFAULT_KEEP_LATEST = 5
const DEFAULT_KEEP_DAYS = 30
const DEFAULT_ARTIFACTS_LIMIT = 32

const logger = createTaggedLogger('retention')

function readPositiveInt(value: unknown, fallback: number) {
    const n = Number(value)
    return Number.isInteger(n) && n > 0 ? n : fallback
}

function retentionArtifactsLimit() {
    return readPositiveInt(process.env.NUXT_RETENTION_MAX_ARTIFACTS_PER_APP, DEFAULT_ARTIFACTS_LIMIT)
}

/**
 * Resolve effective retention settings for an app (organization -> app cascade,
 * `inherit` follows the organization).
 */
export function getEffectiveSettings(
    org: OrgRow,
    app: AppRow,
): EffectiveRetentionSettings {
    const orgSettings: EffectiveRetentionSettings = {
        enabled: org.retentionEnabled ?? false,
        mode: org.retentionMode ?? 'both',
        keepLatest: org.retentionKeepLatest ?? DEFAULT_KEEP_LATEST,
        keepDays: org.retentionKeepDays ?? DEFAULT_KEEP_DAYS,
    }
    if (!app.retentionMode || app.retentionMode === 'inherit') {
        return orgSettings
    }
    return {
        enabled: app.retentionEnabled ?? false,
        mode: app.retentionMode,
        keepLatest: app.retentionKeepLatest ?? orgSettings.keepLatest,
        keepDays: app.retentionKeepDays ?? orgSettings.keepDays,
    }
}


/** Build the deletion plan for an app. */
export async function computeRetentionPlan(
    db: Db,
    org: OrgRow,
    app: AppRow,
): Promise<RetentionPlan> {
    const appSettings = getEffectiveSettings(org, app)
    
    if (!appSettings.enabled) {
        return {
            appSettings: appSettings,
            artifactsToDelete: [],
        }
    }

    if (appSettings.mode === 'days') {
        const nDaysAgo = new Date()
        nDaysAgo.setDate(nDaysAgo.getDate() - appSettings.keepDays)

        const artifactsToRemove = await db.select()
            .from(tables.artifacts)
            .orderBy(asc(tables.artifacts.createdAt))
            .where(and(
                eq(tables.artifacts.appsId, app.id),
                eq(tables.artifacts.organizationId, org.id),
                lt(tables.artifacts.createdAt, nDaysAgo),
            ))
            .limit(retentionArtifactsLimit())

        return {
            appSettings,
            artifactsToDelete: toArtifactForRetention(artifactsToRemove),
        }
    } else if (appSettings.mode === 'latest') {
        // TODO: is it possible without subquery? we can use approximate
        // and just assume if it's equal to batch size, exclude the latest n within that batch size
        const keepLatestN = appSettings.keepLatest

        const latestArtifacts = db.select({ id: tables.artifacts.id })
            .from(tables.artifacts)
            .where(and(
                eq(tables.artifacts.appsId, app.id),
                eq(tables.artifacts.organizationId, org.id),
            ))
            .orderBy(desc(tables.artifacts.createdAt))
            .limit(keepLatestN)

        const artifactsToRemove = await db.select()
            .from(tables.artifacts)
            .where(and(
                eq(tables.artifacts.appsId, app.id),
                eq(tables.artifacts.organizationId, org.id),
                notInArray(tables.artifacts.id, latestArtifacts),
            ))
            .orderBy(asc(tables.artifacts.createdAt))
            .limit(retentionArtifactsLimit())

        return {
            appSettings,
            artifactsToDelete: toArtifactForRetention(artifactsToRemove),
        }
    } else {
        throw 'retention both currently not suppported'
    }

}

export async function previewRetention(
    db: Db,
    org: OrgRow,
    app: AppRow,
): Promise<RetentionPlan> {
    return computeRetentionPlan(db, org, app)
}

/**
 * Delete planned artifacts: DB rows first, then S3 best-effort per artifact.
 */
export async function executeRetention(
    db: Db,
    org: OrgRow,
    app: AppRow,
    s3: S3Fetch,
): Promise<RetentionResult> {
    const plan = await computeRetentionPlan(db, org, app)
    const result: RetentionResult = {
        deleted: 0,
        failed: 0,
        errors: [],
    }
    if (!plan.appSettings.enabled) {
        return result
    }
    const orgId = app.organizationsId || org.id
    if (!orgId) {
        return result
    }

    logger.log('Retention plan', {
        appId: app.id,
        orgId,
        mode: plan.appSettings.mode,
        keepLatest: plan.appSettings.keepLatest,
        keepDays: plan.appSettings.keepDays,
        queued: plan.artifactsToDelete.length,
    })

    const outcomes = await Promise.allSettled(plan.artifactsToDelete.map(async (artifact) => {
        await db.transaction(async (tx) => {
            await deleteStorageObject(s3, getStorageKeys(orgId, app.id, artifact.fileObjectKey).assets)
            if (artifact.fileObjectApkKey) {
                await deleteStorageObject(s3, getStorageKeys(orgId, app.id, artifact.fileObjectApkKey).assets)
            }
            await tx.delete(tables.artifactsGroupsManager)
                .where(eq(tables.artifactsGroupsManager.artifactsId, artifact.id))
            await tx.delete(tables.artifacts)
                .where(eq(tables.artifacts.id, artifact.id))
        })
    }))
    for (const [index, outcome] of outcomes.entries()) {
        if (outcome.status === 'fulfilled') {
            result.deleted++
        } else {
            result.failed++
            const artifact = plan.artifactsToDelete[index]!
            const message = outcome.reason instanceof Error ? outcome.reason.message : String(outcome.reason)
            result.errors.push(`artifact ${artifact.id} (${artifact.versionName2}): ${message}`)
        }
    }
    return result
}

/** Delete a storage object, tolerating "already gone". */
async function deleteStorageObject(s3: S3Fetch, key: string) {
    try {
        await s3.deleteObject(key)
    } catch (e) {
        const status = (e as { statusCode?: number, status?: number, cause?: { statusCode?: number } })
        if (status?.statusCode === 404 || status?.status === 404 || status?.cause?.statusCode === 404) {
            return
        }
        throw e
    }
}

function toArtifactForRetention(artifacts: ArtifactRow[]): ArtifactForRetention[] {
    return artifacts.map(v => ({
        id: v.id,
        fileObjectKey: v.fileObjectKey,
        fileObjectApkKey: v.fileObjectApkKey,
        versionName2: v.versionName2,
        versionCode2: v.versionCode2,
        createdAt: v.createdAt,
        releaseId: v.releaseId,
        fileContentLength: v.fileContentLength,
        fileApkContentLength: v.fileApkContentLength,
    }))
}
