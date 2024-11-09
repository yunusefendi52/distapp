import { getStorageKeys } from "~/server/utils/utils"
import type { EventHandlerRequest, H3Event } from "h3"
import { S3Fetch } from "~/server/services/s3fetch"

export const getArtifactFromInternal = async (
    event: H3Event<EventHandlerRequest>,
    orgName: string,
    appName: string,
    releaseId: string,
    publicId: string,
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
    const { assets } = getStorageKeys(app.organizationsId!, app.id, detailArtifact.fileObjectKey)
    const s3 = new S3Fetch()
    const signedUrl = await s3.getSignedUrlGetObject(assets, 1800, `attachment; filename ="${app.name}${detailArtifact.extension ? `.${detailArtifact.extension}` : ''}"`)
    return {
        signedUrl,
        userOrg: org,
        app,
        detailArtifact,
    }
}

export default defineEventHandler(async (event) => {
    const { appName, orgName, releaseId, hasManifestPList, publicId } = await getValidatedQuery(event, z.object({
        appName: z.string().min(1),
        orgName: z.string().min(1),
        releaseId: z.string().min(1),
        hasManifestPList: z.any(),
        publicId: z.string().nullable(),
    }).parse)
    const { signedUrl, app, detailArtifact, } = await getArtifactFromInternal(
        event,
        orgName,
        appName,
        releaseId,
        publicId || '')
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
