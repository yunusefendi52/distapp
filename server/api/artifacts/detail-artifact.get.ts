import { and, eq } from "drizzle-orm"
import { artifactsGroups, artifactsGroupsManager, organizations, organizationsPeople } from "~/server/db/schema"
import { getStorageKeys } from "~/server/utils/utils"
import { takeUniqueOrThrow } from "../detail-app.get"
import { createS3 } from "~/server/services/s3"
import { GetObjectAttributesCommand, GetObjectTaggingCommand, HeadObjectCommand, ObjectAttributes } from "@aws-sdk/client-s3"

export default defineEventHandler(async (event) => {
    const db = event.context.drizzle
    const userId = event.context.auth.userId
    const { appName, orgName, releaseId } = getQuery(event)
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
    const s3 = createS3(event)
    const { assets } = getStorageKeys(event.context.auth, detailArtifact.fileObjectKey)
    const [headObject, groups] = await Promise.all([
        s3.send(new HeadObjectCommand({
            Bucket: s3BucketName,
            Key: assets,
        })),
        db.select()
            .from(artifactsGroups)
            .leftJoin(artifactsGroupsManager, eq(artifactsGroupsManager.artifactsGroupsId, artifactsGroups.id))
            .where(eq(artifactsGroups.id, detailArtifact.id))
    ])
    return {
        ...detailArtifact,
        fileMetadata: {
            md5: headObject.ETag,
            contentLength: headObject.ContentLength,
            contentType: headObject.ContentType,
        },
        groups,
    }
})
