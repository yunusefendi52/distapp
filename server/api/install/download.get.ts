import { getStorageKeys, s3BucketName } from "~/server/utils/utils"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { GetObjectCommand } from "@aws-sdk/client-s3"
import { organizations, organizationsPeople } from "~/server/db/schema"
import { and, eq } from "drizzle-orm"
import { S3AppClient } from "~/server/services/S3AppClient"
import { getArtifactFromPublicId } from './get-data.get'
import type { EventHandlerRequest, H3Event } from "h3"

export const getArtifactLinkFromPublicIdAndReleaseId = async (
    event: H3Event<EventHandlerRequest>,
    publicId: string,
    releaseId: number,
) => {
    const db = event.context.drizzle
    const { app, artifactGroup, org } = await getArtifactFromPublicId(event, publicId)
    const detailArtifact = await db.query.artifacts.findMany({
        where(fields, operators) {
            return operators.and(
                operators.eq(fields.appsId, app.id),
                operators.eq(fields.releaseId, releaseId),
            )
        },
    }).then(takeUniqueOrThrow)
    const { assets } = getStorageKeys(org.id, app.id, detailArtifact.fileObjectKey)
    const s3 = new S3AppClient()
    const signedUrl = await s3.getSignedUrlGetObject(event, assets, 1800, `attachment; filename ="${app.name}${detailArtifact.extension ? `.${detailArtifact.extension}` : ''}"`)
    return {
        signedUrl,
        app,
        org,
        artifactGroup,
        detailArtifact,
    }
}

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const publicId = query.publicId?.toString()
    const releaseIdStr = query.releaseId?.toString()
    if (!publicId || !releaseIdStr) {
        setResponseStatus(event, 401)
        return
    }
    const releaseId = parseInt(releaseIdStr!)
    const { signedUrl } = await getArtifactLinkFromPublicIdAndReleaseId(event, publicId, releaseId)
    await sendRedirect(event, signedUrl)
})
