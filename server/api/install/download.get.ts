import { createS3 } from "~/server/services/s3"
import { getStorageKeys, s3BucketName } from "~/server/utils/utils"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { GetObjectCommand } from "@aws-sdk/client-s3"
import { organizations, organizationsPeople } from "~/server/db/schema"
import { and, eq } from "drizzle-orm"
import { takeUniqueOrThrow } from "../detail-app.get"

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const publicId = query.publicId?.toString()
    const releaseIdStr = query.releaseId?.toString()
    if (!publicId || !releaseIdStr) {
        setResponseStatus(event, 401)
        return
    }
    const releaseId = parseInt(releaseIdStr!)

    const db = event.context.drizzle
    const artifactGroup = await db.query.artifactsGroups.findMany({
        where(fields, operators) {
            return operators.eq(fields.publicId, publicId)
        },
    }).then(takeUniqueOrThrow)
    const app = await db.query.apps.findMany({
        where(fields, operators) {
            return operators.eq(fields.id, artifactGroup.appsId!)
        },
    }).then(takeUniqueOrThrow)
    const org = await db.query.organizations.findMany({
        where(fields, operators) {
            return operators.eq(fields.id, app.organizationsId!)
        },
    }).then(takeUniqueOrThrow)
    const orgPeople = await db.query.organizationsPeople.findMany({
        where(fields, operators) {
            return operators.eq(fields.organizationId, org.id)
        },
        limit: 1,
    }).then(takeUniqueOrThrow)
    const detailArtifact = await db.query.artifacts.findMany({
        where(fields, operators) {
            return operators.and(
                operators.eq(fields.appsId, app.id),
                operators.eq(fields.releaseId, releaseId),
            )
        },
    }).then(takeUniqueOrThrow)
    const { assets } = getStorageKeys(orgPeople.userId!, detailArtifact.fileObjectKey)
    const s3 = createS3(event)
    const signedUrl = await getSignedUrl(s3, new GetObjectCommand({
        Bucket: s3BucketName,
        Key: assets,
        ResponseContentDisposition: `attachment; filename ="${app.name}"`
    }), {
        expiresIn: 1800,
    })
    await sendRedirect(event, signedUrl)
})
