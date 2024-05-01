import { and, eq } from "drizzle-orm"
import { artifactsGroups, artifactsGroupsManager, organizations, organizationsPeople } from "~/server/db/schema"
import { generateRandomPassword, getStorageKeys } from "~/server/utils/utils"
import { takeUniqueOrThrow } from "../detail-app.get"
import { GetObjectAttributesCommand, GetObjectTaggingCommand, HeadObjectCommand, ObjectAttributes } from "@aws-sdk/client-s3"
import { S3AppClient, type AppHeadObjectCommandOutput } from "~/server/services/S3AppClient"
import type { EventHandlerRequest, H3Event } from "h3"

export const getDetailArtifact = async (
    event: H3Event<EventHandlerRequest>,
    userId: string,
    orgName: string,
    appName: string,
    releaseId: number | string) => {
    const db = event.context.drizzle
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
    return {
        userOrg,
        detailArtifact,
        app,
    }
}

export default defineEventHandler(async (event) => {
    const db = event.context.drizzle
    const userId = event.context.auth.userId
    const { appName, orgName, releaseId } = getQuery(event)
    const { userOrg, app, detailArtifact } = await getDetailArtifact(
        event,
        userId,
        orgName!.toString(),
        appName!.toString(),
        parseInt(releaseId!.toString()),
    )
    const s3 = new S3AppClient()
    const { assets } = getStorageKeys(userOrg.organizationsId!, app.id, detailArtifact.fileObjectKey)
    const [headObject, groups] = await Promise.all([
        s3.getHeadObject(event, new HeadObjectCommand({
            Bucket: s3BucketName,
            Key: assets,
        })).then(e => e as AppHeadObjectCommandOutput),
        db.select()
            .from(artifactsGroups)
            .leftJoin(artifactsGroupsManager, eq(artifactsGroupsManager.artifactsGroupsId, artifactsGroups.id))
            .where(eq(artifactsGroupsManager.artifactsId, detailArtifact.id))
    ])
    const response = {
        ...detailArtifact,
        fileObjectKey: undefined,
        fileMetadata: {
            md5: headObject.ETag,
            contentLength: parseInt(headObject.ContentLength),
            contentType: headObject.ContentType,
        },
        groups,
    }
    delete response.fileObjectKey
    return response
})
