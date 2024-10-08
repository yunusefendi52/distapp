import { getStorageKeys, s3BucketName } from "~/server/utils/utils"
import type { EventHandlerRequest, H3Event } from "h3"
import { S3Fetch } from "~/server/services/s3fetch"

export const getArtifactFromInternal = async (
    event: H3Event<EventHandlerRequest>,
    orgName: string,
    appName: string,
    releaseId: string,
) => {
    const db = event.context.drizzle
    const userId = event.context.auth.userId
    const userOrg = await db.select({
        organizationsId: tables.organizations.id,
    })
        .from(tables.organizationsPeople)
        .leftJoin(tables.organizations, eq(tables.organizations.id, tables.organizationsPeople.organizationId))
        .where(and(eq(tables.organizationsPeople.userId, userId), eq(tables.organizations.name, orgName!.toString())))
        .then(takeUniqueOrThrow)
    const app = await db.query.apps.findMany({
        where(fields, operators) {
            return operators.and(operators.eq(fields.organizationsId, userOrg.organizationsId!), operators.eq(fields.name, appName!.toString()))
        },
    }).then(takeUniqueOrThrow)
    const releaseIdInt = parseInt(releaseId!.toString())
    const detailArtifact = await db.query.artifacts.findMany({
        where(fields, operators) {
            return operators.and(
                operators.eq(fields.appsId, app.id),
                operators.eq(fields.releaseId, releaseIdInt),
            )
        },
    }).then(takeUniqueOrThrow)
    const { assets } = getStorageKeys(userOrg.organizationsId!, app.id, detailArtifact.fileObjectKey)
    const s3 = new S3Fetch()
    const signedUrl = await s3.getSignedUrlGetObject(assets, 1800, `attachment; filename ="${app.name}${detailArtifact.extension ? `.${detailArtifact.extension}` : ''}"`)
    return {
        signedUrl,
        userOrg,
        app,
        detailArtifact,
    }
}

export default defineEventHandler(async (event) => {
    const { appName, orgName, releaseId, manifestPlist } = getQuery(event)
    const { signedUrl, app, detailArtifact, } = await getArtifactFromInternal(
        event,
        orgName!.toString(),
        appName!.toString(),
        releaseId!.toString())
    if (manifestPlist) {
        return {
            signedUrl,
            packageName: detailArtifact.packageName,
            versionName: detailArtifact.versionName2,
            displayName: app.displayName,
        }
    }

    await sendRedirect(event, signedUrl)
})
