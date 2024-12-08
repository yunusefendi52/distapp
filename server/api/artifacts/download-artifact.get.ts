import { getStorageKeys } from "~/server/utils/utils"
import type { EventHandlerRequest, H3Event } from "h3"
import { S3Fetch } from "~/server/services/s3fetch"

export const getArtifactFromInternal = async (
    event: H3Event<EventHandlerRequest>,
    orgName: string,
    appName: string,
    releaseId: string,
    publicId: string,
    hasApk: boolean,
) => {
    const { app, org } = publicId
        ? await getArtifactGroupFromPublicIdOrUser(event, orgName, appName, publicId)
        : await getUserApp(event, orgName, appName).then(e => ({ app: e.userApp, org: e.userOrg }))
    const db = event.context.drizzle
    const releaseIdInt = parseInt(releaseId)
    const detailArtifact = await db.query.artifacts.findMany({
        where(fields, operators) {
            return operators.and(
                operators.eq(fields.appsId, app.id),
                operators.eq(fields.releaseId, releaseIdInt),
            )
        },
    }).then(takeUniqueOrThrow)
    const actuallyHasApk = hasApk && (detailArtifact.fileObjectApkKey ? true : false)
    const { assets } = getStorageKeys(app.organizationsId!, app.id, actuallyHasApk ? detailArtifact.fileObjectApkKey! : detailArtifact.fileObjectKey)
    const s3 = new S3Fetch()
    const artifactExt = actuallyHasApk ? 'apk' : detailArtifact.extension
    const signedUrl = await s3.getSignedUrlGetObject(assets, 1800, `attachment; filename ="${app.name}${artifactExt ? `.${artifactExt}` : ''}"`)
    return {
        signedUrl,
        userOrg: org,
        app,
        detailArtifact,
    }
}

export default defineEventHandler(async (event) => {
    const { appName, orgName, releaseId, hasManifestPList, publicId, hasApk } = await getValidatedQuery(event, z.object({
        appName: z.string().min(1),
        orgName: z.string().min(1),
        releaseId: z.string().min(1),
        hasManifestPList: z.any(),
        publicId: z.string().nullable(),
        hasApk: z.string().transform(e => e === 'true'),
    }).parse)
    const { signedUrl, app, detailArtifact, } = await getArtifactFromInternal(
        event,
        orgName,
        appName,
        releaseId,
        publicId || '',
        hasApk)
    if (hasManifestPList) {
        return {
            signedUrl,
            packageName: detailArtifact.packageName,
            versionName: detailArtifact.versionName2,
            displayName: app.displayName,
        }
    }

    await sendRedirect(event, signedUrl)
})
