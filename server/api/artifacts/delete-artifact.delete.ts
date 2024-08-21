import { S3Fetch } from "~/server/services/s3fetch"
import { getDetailArtifact } from "./detail-artifact.get"

export default defineEventHandler(async (event) => {
    const db = event.context.drizzle
    const { appName, orgName, releaseId } = getQuery(event)
    if (await roleEditNotAllowed(event, orgName!.toString())) {
        throw createError({
            message: 'Unauthorized delete artifact',
            statusCode: 401,
        })
    }
    const { userOrg, app, detailArtifact } = await getDetailArtifact(
        event,
        orgName!.toString(),
        appName!.toString(),
        parseInt(releaseId!.toString()),
    )
    const { assets } = getStorageKeys(userOrg.org!.id, app.id, detailArtifact.fileObjectKey)
    const s3 = new S3Fetch()
    await s3.deleteObject(assets)
    await db.batch([
        db.delete(tables.artifactsGroupsManager)
            .where(and(
                eq(tables.artifactsGroupsManager.artifactsId, detailArtifact.id),
            )),
        db.delete(tables.artifacts)
            .where(and(
                eq(tables.artifacts.id, detailArtifact.id),
                eq(tables.artifacts.appsId, app.id),
            )),
    ])
    return {
        deleted: new Date(),
    }
})
