import { S3Fetch } from "~/server/services/s3fetch"
import { getDetailArtifact } from "./detail-artifact.get"

export default defineEventHandler(async (event) => {
    const db = event.context.drizzle
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
    const { assets } = getStorageKeys(userOrg.org!.id, app.id, detailArtifact.fileObjectKey)
    const s3 = new S3Fetch()
    await db.transaction(async t => {
        await s3.deleteObject(assets)
        await t.delete(tables.artifactsGroupsManager)
            .where(and(
                eq(tables.artifactsGroupsManager.artifactsId, detailArtifact.id),
            ))
        await t.delete(tables.artifacts)
            .where(and(
                eq(tables.artifacts.id, detailArtifact.id),
                eq(tables.artifacts.appsId, app.id),
            ))
    })

    return {
        deleted: new Date(),
    }
})
