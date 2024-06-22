import { and, eq } from "drizzle-orm"
import { artifacts, organizations, organizationsPeople } from "~/server/db/schema"
import { getStorageKeys, s3BucketName } from "~/server/utils/utils"
import { CopyObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
import { S3AppClient } from "~/server/services/S3AppClient"
import { decryptText, verifyToken } from "~/server/utils/token-utils"

export default defineEventHandler(async (event) => {
    const { token, appName, orgName, releaseNotes, packageMetadata, } = await readBody(event)
    const fileKey = (decryptText(event, token)).fileKey as string

    const userId = event.context.auth.userId
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
    const { temp, assets } = getStorageKeys(userOrg.organizationsId!, app.id, fileKey)
    const packageData = packageMetadata as {
        versionCode: number,
        versionName: string,
        packageName: string,
        extension: string,
    }
    if (!packageData) {
        setResponseStatus(event, 400, 'Cannot read package')
        return
    }

    const s3 = new S3AppClient()
    await s3.copyObject(event, new CopyObjectCommand({
        CopySource: `${s3BucketName}/${temp}`,
        Bucket: s3BucketName,
        Key: assets,
    }))
    await s3.deleteObject(event, new DeleteObjectCommand({
        Bucket: s3BucketName,
        Key: temp,
    }))

    // Inserting to db
    const lastArtifact = await db.query.artifacts.findFirst({
        orderBy(fields, operators) {
            return operators.desc(fields.releaseId)
        },
        where(fields, operators) {
            return operators.eq(fields.appsId, app.id)
        },
    })
    const newReleaseId = (lastArtifact?.releaseId ?? 0) + 1
    const now = new Date()
    const artifactsId = generateId()
    await db.insert(artifacts).values({
        id: artifactsId,
        createdAt: now,
        updatedAt: now,
        fileObjectKey: fileKey,
        versionCode2: packageData?.versionCode?.toString()!,
        versionName2: packageData?.versionName!,
        appsId: app.id,
        releaseNotes: releaseNotes,
        releaseId: newReleaseId,
        extension: packageData?.extension,
        packageName: packageData?.packageName,
    })

    return {
        artifactId: artifactsId,
    }
})
