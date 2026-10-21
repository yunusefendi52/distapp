import { and, asc, eq, isNull, ne, or } from "drizzle-orm";
import type { EventHandlerRequest, H3Event } from "h3";
import db from "../db/db";
import { S3Fetch } from "../services/s3fetch";
import { executeRetention, computeRetentionPlan } from "../services/retention";
import { createTaggedLogger } from "../utils/logger-utils";

// Each run visits a slice of apps, least recently scheduled first.
const DEFAULT_APP_BATCH_SIZE = 16

function readPositiveInt(value: unknown, fallback: number) {
    const n = Number(value)
    return Number.isInteger(n) && n > 0 ? n : fallback
}

function readBoolean(value: unknown) {
    return value === true || value === 'true' || value === '1'
}

const logger = createTaggedLogger('retention')

export default defineTask({
    meta: {
        name: "retention-purge",
        description: "Apply app retention rules and purge expired artifacts",
    },
    async run() {
        const result = await runRetentionPurge()
        return {
            result: {
                status: `retention purge ${new Date().toISOString()} deleted ${result.deleted} failed ${result.failed}${result.dryRun ? ' (dry run)' : ''}`,
            },
        }
    },
});

export async function runRetentionPurge(event?: H3Event<EventHandlerRequest>, dryRunOverride?: boolean) {
    logger.log('Starting retention purge')

    const env = event?.context.cloudflare?.env || process.env

    if (readBoolean(env.NUXT_RETENTION_DISABLED)) {
        logger.log('Retention purge is disabled (NUXT_RETENTION_DISABLED), skipping run')
        return {
            apps: 0,
            dryRun: false,
            deleted: 0,
            wouldDelete: 0,
            failed: 0,
            errors: [],
        }
    }

    const drizzle = db({
        ...env,
        enableLogging: false,
    })

    const dateNow = new Date()
    const dryRun = dryRunOverride ?? readBoolean(env.NUXT_RETENTION_DRY_RUN)
    const batchSize = readPositiveInt(env.NUXT_RETENTION_APP_BATCH_SIZE, DEFAULT_APP_BATCH_SIZE)
    const s3 = new S3Fetch()

    // Apps worth visiting: enabled via the organization settings (inherit or a
    // custom enabled override), or via their own custom enabled settings.
    const eligible = or(
        and(
            eq(tables.organizations.retentionEnabled, true),
            or(
                // null counts as inherit
                isNull(tables.apps.retentionMode),
                eq(tables.apps.retentionMode, 'inherit'),
                eq(tables.apps.retentionEnabled, true),
            ),
        ),
        and(
            ne(tables.apps.retentionMode, 'inherit'),
            eq(tables.apps.retentionEnabled, true),
        ),
    )

    const candidates = await drizzle.select({
        app: tables.apps,
        org: tables.organizations,
    })
        .from(tables.apps)
        .innerJoin(tables.organizations, eq(tables.organizations.id, tables.apps.organizationsId))
        .where(eligible)
        .orderBy(asc(tables.apps.retentionLastScheduledAt))
        .limit(batchSize)

    let deleted = 0
    let wouldDelete = 0
    let failed = 0
    const errors: string[] = []
    let processed = 0

    for (const { app, org } of candidates) {
        if (dryRun) {
            try {
                const plan = await computeRetentionPlan(drizzle, org, app)
                wouldDelete += plan.artifactsToDelete.length
                logger.log('Retention dry run', {
                    appId: app.id,
                    orgId: app.organizationsId,
                    settings: plan.appSettings,
                    artifacts: plan.artifactsToDelete.map(v => `${v.versionName2} (${v.id})`),
                })
            } catch (e) {
                const message = e instanceof Error ? e.message : `${e}`
                errors.push(`app ${app.id}: ${message}`)
                logger.error('Retention dry run failed for app', app.id, message)
            }
            processed++
            continue
        }

        // Claim via the read value so overlapping runs skip this app.
        const claim = await drizzle.update(tables.apps)
            .set({
                retentionLastScheduledAt: dateNow,
            })
            .where(and(
                eq(tables.apps.id, app.id),
                app.retentionLastScheduledAt
                    ? eq(tables.apps.retentionLastScheduledAt, app.retentionLastScheduledAt)
                    : isNull(tables.apps.retentionLastScheduledAt),
            ))
        if (!claim.rowsAffected) {
            logger.warn('app to be already scheduled by other scheduler')
            continue
        }
        processed++

        logger.log('Retention purge processing app', {
            appId: app.id,
            orgId: app.organizationsId,
        })

        try {
            const result = await executeRetention(drizzle, org, app, s3)
            deleted += result.deleted
            failed += result.failed
            errors.push(...result.errors)
            if (result.deleted || result.failed) {
                logger.log('Retention purge app', {
                    appId: app.id,
                    orgId: app.organizationsId,
                    deleted: result.deleted,
                    failed: result.failed,
                })
            }
        } catch (e) {
            failed++
            const message = e instanceof Error ? e.message : `${e}`
            errors.push(`app ${app.id}: ${message}`)
            logger.error('Retention purge failed for app', app.id, message)
        }
    }

    logger.log('Finished retention purge', {
        apps: processed,
        dryRun,
        deleted,
        wouldDelete,
        failed,
    })
    if (errors.length) {
        logger.error('Retention purge errors', errors)
    }

    return {
        apps: processed,
        dryRun,
        deleted,
        wouldDelete,
        failed,
        errors,
    }
}
