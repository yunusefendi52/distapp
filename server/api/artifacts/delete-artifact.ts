import { S3Fetch } from "~/server/services/s3fetch"
import { getDetailArtifact } from "./detail-artifact.get"
import type { EventHandlerRequest, H3Event } from "h3"

export default defineEventHandler(async (event) => {
    const { appName, orgName, releaseId } = await getValidatedQuery(event, z.object({
        appName: z.string().trim().min(1).max(128),
        orgName: z.string().trim().min(1).max(128),
        releaseId: z.string().transform(v => parseInt(v)),
    }).parse)
    if (await roleEditNotAllowed(event, orgName)) {
        throw createError({
            message: 'Unauthorized delete artifact',
            statusCode: 401,
        })
    }
    const { userOrg, app, detailArtifact } = await getDetailArtifact(
        event,
        orgName,
        appName,
        releaseId,
    )

    await deleteArtifact(event, detailArtifact.id, userOrg.org!.id, app.id, detailArtifact.fileObjectKey, detailArtifact.fileObjectApkKey)

    return {
        deleted: new Date(),
    }
})

export async function deleteArtifact(
    event: H3Event<EventHandlerRequest>,
    artifactId: string,
    orgId: string,
    appId: string,
    fileObjectKey: string,
    fileObjectApkKey: string | null,
) {
    const { assets } = getStorageKeys(orgId, appId, fileObjectKey)
    const assetsApkKey = fileObjectApkKey ? getStorageKeys(orgId, appId, fileObjectApkKey).assets : undefined
    const db = event.context.drizzle
    const s3 = new S3Fetch()
    await db.transaction(async t => {
        await s3.deleteObject(assets)
        if (assetsApkKey) {
            await s3.deleteObject(assetsApkKey)
        }
        await t.delete(tables.artifactsGroupsManager)
            .where(and(
                eq(tables.artifactsGroupsManager.artifactsId, artifactId),
            ))
        await t.delete(tables.artifacts)
            .where(and(
                eq(tables.artifacts.id, artifactId),
                eq(tables.artifacts.appsId, appId),
            ))
    })
}
