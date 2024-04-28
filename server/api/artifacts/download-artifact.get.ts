import { createS3 } from "~/server/services/s3"
import { getStorageKeys, s3BucketName } from "~/server/utils/utils"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { GetObjectCommand } from "@aws-sdk/client-s3"
import { organizations, organizationsPeople } from "~/server/db/schema"
import { and, eq } from "drizzle-orm"
import { takeUniqueOrThrow } from "../detail-app.get"

export default defineEventHandler(async (event) => {
    const { appName, orgName, releaseId } = getQuery(event)
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
    const { assets } = getStorageKeys(event.context.auth, detailArtifact.fileObjectKey)
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
