import { getStorageKeys, s3BucketName } from "~/server/utils/utils"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { GetObjectCommand } from "@aws-sdk/client-s3"
import { organizations, organizationsPeople } from "~/server/db/schema"
import { and, eq } from "drizzle-orm"
import { S3AppClient } from "~/server/services/S3AppClient"
import type { EventHandlerRequest, H3Event } from "h3"

export const getArtifactFromInternal = async (
    event: H3Event<EventHandlerRequest>,
    orgName: string,
    appName: string,
    releaseId: string,
) => {
    const db = event.context.drizzle
    const userId = event.context.auth.userId
    const userOrg = await db.select({
        organizationsId: organizations.id,
    })
        .from(organizationsPeople)
        .leftJoin(organizations, eq(organizations.id, organizationsPeople.organizationId))
        .where(and(eq(organizationsPeople.userId, userId), eq(organizations.name, orgName!.toString())))
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
    const s3 = new S3AppClient()
    const signedUrl = await s3.getSignedUrlGetObject(event, assets, 1800, `attachment; filename ="${app.name}${detailArtifact.extension ? `.${detailArtifact.extension}` : ''}"`)
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
