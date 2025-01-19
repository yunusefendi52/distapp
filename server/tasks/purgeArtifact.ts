import { isNotNull, isNull, lt, ne } from "drizzle-orm";
import db from "../db/db";
import { S3Fetch } from "../services/s3fetch";
import type { EventHandlerRequest, H3Event } from "h3";

export default defineTask({
    meta: {
        name: "purgeArtifact",
        description: "Purge artifact",
    },
    async run({ payload, context }) {
        return await runPurgeArtifact()
    },
});

export async function runPurgeArtifact(event?: H3Event<EventHandlerRequest>) {
    console.log('Staring purge artifact')

    const env = event?.context.cloudflare?.env || process.env
    const drizzle = db({
        ...env,
        enableLogging: false,
    })

    const artifacts = await drizzle.select({
        key: tables.artifacts.fileObjectKey,
        apkKey: tables.artifacts.fileObjectApkKey,
        orgId: tables.artifacts.organizationId,
        appId: tables.artifacts.appsId,
    })
        .from(tables.artifacts)
        .leftJoin(tables.apps, eq(tables.apps.id, tables.artifacts.appsId))
        .where(and(
            isNull(tables.apps.id),
            isNotNull(tables.artifacts.organizationId),
            isNotNull(tables.artifacts.appsId),
        ))
        .limit(15)

    const s3 = new S3Fetch()
    const results = await Promise.allSettled(artifacts.map(async (el) => {
        const fileKey = getStorageKeys(el.orgId!, el.appId!, el.key)
        const fileApkKeyAssets = el.apkKey ? getStorageKeys(el.orgId!, el.appId!, el.apkKey) : undefined
        if (import.meta.dev) {
            console.log('asstes to delete', {
                fileKey,
                fileApkKeyAssets,
            })
        }
        await s3.deleteObject(fileKey.assets)
        if (fileApkKeyAssets) {
            await s3.deleteObject(fileApkKeyAssets.assets)
        }
        await drizzle.transaction(async tx => {
            await tx.delete(tables.artifacts)
                .where(and(
                    eq(tables.artifacts.fileObjectKey, el.key),
                    eq(tables.artifacts.organizationId, el.orgId!),
                    eq(tables.artifacts.appsId, el.appId!),
                ))
            if (el.apkKey) {
                await tx.delete(tables.artifacts)
                    .where(and(
                        eq(tables.artifacts.fileObjectApkKey, el.apkKey),
                        eq(tables.artifacts.organizationId, el.orgId!),
                        eq(tables.artifacts.appsId, el.appId!),
                    ))
            }
        })
    }))

    console.log('Finished purge artifact', results.length)

    return {
        result: {
            status: `purged ${new Date().toISOString()}`,
        },
    };
}