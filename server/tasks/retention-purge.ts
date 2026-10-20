import { and, asc, eq, isNull, ne, or } from "drizzle-orm";
import type { EventHandlerRequest, H3Event } from "h3";
import db from "../db/db";
import { S3Fetch } from "../services/s3fetch";
import { executeRetention } from "../services/retention";

// Each run visits a slice of apps, least recently scheduled first.
const DEFAULT_APP_BATCH_SIZE = 16

function readPositiveInt(value: unknown, fallback: number) {
    const n = Number(value)
    return Number.isInteger(n) && n > 0 ? n : fallback
}

function readBoolean(value: unknown) {
    return value === true || value === 'true' || value === '1'
}

export default defineTask({
    meta: {
        name: "retention-purge",
        description: "Apply app retention rules and purge expired artifacts",
    },
    async run() {
        const result = await runRetentionPurge()
        return {
            result: {
                status: `retention purge ${new Date().toISOString()} deleted ${result.deleted} failed ${result.failed}`,
            },
        }
    },
});

export async function runRetentionPurge(event?: H3Event<EventHandlerRequest>) {
    console.log('Starting retention purge')

    const env = event?.context.cloudflare?.env || process.env

    if (readBoolean(env.NUXT_RETENTION_DISABLED)) {
        console.log('Retention purge is disabled (NUXT_RETENTION_DISABLED), skipping run')
        return {
            apps: 0,
            deleted: 0,
            failed: 0,
            errors: [],
        }
    }

    const drizzle = db({
        ...env,
        enableLogging: false,
    })

    const dateNow = new Date()
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
    let failed = 0
    const errors: string[] = []
    let processed = 0

    for (const { app, org } of candidates) {
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
            console.warn('app to be already scheduled by other scheduler')
            continue
        }
        processed++

        try {
            const result = await executeRetention(drizzle, org, app, s3)
            deleted += result.deleted
            failed += result.failed
            errors.push(...result.errors)
            if (result.deleted || result.failed) {
                console.log('Retention purge app', {
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
            console.error('Retention purge failed for app', app.id, message)
        }
    }

    console.log('Finished retention purge', {
        apps: processed,
        deleted,
        failed,
    })
    if (errors.length) {
        console.error('Retention purge errors', errors)
    }

    return {
        apps: processed,
        deleted,
        failed,
        errors,
    }
}
