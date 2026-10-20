import { previewRetention } from "../../services/retention"
import type { ArtifactForRetention } from "../../services/retention"

export default defineEventHandler(async (event) => {
    const db = event.context.drizzle
    const { orgName, appName } = await getValidatedQuery(event, z.object({
        orgName: z.string().trim().min(1).max(128),
        appName: z.string().trim().min(1).max(128),
    }).parse)
    if (await roleEditNotAllowed(event, orgName)) {
        throw createError({
            message: 'Unauthorized preview retention',
            statusCode: 401,
        })
    }
    const { userApp } = await getUserApp(event, orgName, appName)
    const userOrg = await getUserOrg(event, orgName)
    const plan = await previewRetention(db, userOrg.org!, userApp)
    return {
        appSettings: plan.appSettings,
        artifactsToDelete: plan.artifactsToDelete.map(toPublicArtifact),
    }
})

function toPublicArtifact(artifact: ArtifactForRetention) {
    return {
        id: artifact.id,
        versionName: artifact.versionName2,
        versionCode: artifact.versionCode2,
        createdAt: artifact.createdAt,
        releaseId: artifact.releaseId,
        fileContentLength: artifact.fileContentLength,
        fileApkContentLength: artifact.fileApkContentLength,
    }
}
