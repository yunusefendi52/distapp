import { generateRandomPassword, getStorageKeys } from "~/server/utils/utils"
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
        s3.getHeadObject(event, assets),
        db.select()
            .from(tables.artifactsGroups)
            .leftJoin(tables.artifactsGroupsManager, eq(tables.artifactsGroupsManager.artifactsGroupsId, tables.artifactsGroups.id))
            .where(eq(tables.artifactsGroupsManager.artifactsId, detailArtifact.id))
    ])
    const response = {
        ...detailArtifact,
        fileObjectKey: undefined,
        fileMetadata: {
            md5: headObject.ETag,
            contentLength: headObject.ContentLength,
            contentType: headObject.ContentType,
        },
        groups,
    }
    delete response.fileObjectKey
    return response
})
