import { v4 } from "uuid";
import { generateRandomPassword, getStorageKeys, s3BucketName } from "~/server/utils/utils";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { organizations, organizationsPeople } from "~/server/db/schema";
import { and, eq } from "drizzle-orm";
import { S3AppClient } from "~/server/services/S3AppClient";
import { encryptText } from "~/server/utils/token-utils";

export default defineEventHandler(async (event) => {
    const { orgName, appName } = await readBody(event)
    if (await roleEditNotAllowed(event, orgName)) {
        throw createError({
            message: 'Unauthorized',
            statusCode: 401,
        })
    }
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

    const key = generateRandomPassword()
    const token = encryptText(event, {
        fileKey: key,
    })
    var expires = 500;
    const { temp } = getStorageKeys(userOrg.organizationsId!, app.id, key)
    const s3 = new S3AppClient()
    const signedUrl = await s3.getSignedUrlPutObject(event, new PutObjectCommand({
        Bucket: s3BucketName,
        Key: temp,
        // ContentLength: limitUploadSizeMb.app.limitUploadSizeMb,
    }), expires)
    return {
        token,
        url: signedUrl,
    }
})
