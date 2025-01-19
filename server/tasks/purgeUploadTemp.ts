
import { inArray, isNotNull, isNull, lt, ne } from "drizzle-orm";
import db from "../db/db";
import { S3Fetch } from "../services/s3fetch";
import type { UploadTempValue } from "../api/artifacts/upload-artifact.post";
import type { EventHandlerRequest, H3Event } from "h3";

export default defineTask({
    meta: {
        name: "purgeUploadTemp",
        description: "purge upload_temp and upload_temp_headless",
    },
    async run({ payload, context }) {
        return await runPurgeUploadTemp()
    },
});

export async function runPurgeUploadTemp(event?: H3Event<EventHandlerRequest>) {
    console.log('Starting purge upload temp')

    const env = event?.context.cloudflare?.env || process.env
    const drizzle = db({
        ...env,
        enableLogging: false,
    })

    const atLeast1Hour = new Date()
    atLeast1Hour.setHours(atLeast1Hour.getHours() - 1)
    const uploadTemps = await drizzle.select()
        .from(tables.keyValue)
        .where(and(
            or(
                eq(tables.keyValue.group, 'upload_temp'),
                eq(tables.keyValue.group, 'upload_temp_headless'),
            ),
            lt(tables.keyValue.createdAt, atLeast1Hour),
        ))
        .orderBy(desc(tables.keyValue.createdAt))
        .limit(15)

    const settles = await Promise.allSettled(uploadTemps.map(async uploadTemp => {
        const s3 = new S3Fetch()
        const uploadTempValue = uploadTemp.value as UploadTempValue
        {
            const { assets } = getStorageKeys(uploadTempValue.orgId, uploadTempValue.appId, uploadTempValue.fileKey)
            await s3.deleteObject(assets)
        }
        {
            if (uploadTempValue.apkFileKey) {
                const { assets } = getStorageKeys(uploadTempValue.orgId, uploadTempValue.appId, uploadTempValue.apkFileKey)
                await s3.deleteObject(assets)
            }
        }
        return uploadTemp.key
    }))

    const rejected = settles.filter(e => e.status === 'rejected')
    rejected.forEach(v => {
        console.log(`purge upload temp failed ${v.reason}`)
    })

    const fulfilled = settles.filter(e => e.status === 'fulfilled').map(e => e.value)
    await drizzle.delete(tables.keyValue)
        .where(inArray(tables.keyValue.key, fulfilled))

    console.log('✅ Finished purge upload temp', fulfilled.length)
    if (rejected.length) {
        console.log('❌ Failed purge upload temp', rejected.length)
    }

    return {
        result: {
            status: `purge upload temp ${new Date().toISOString()}`,
        },
    };
}