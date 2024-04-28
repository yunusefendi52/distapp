import { v4 } from "uuid";
import { generateRandomPassword, getStorageKeys, s3BucketName } from "~/server/utils/utils";
import { createS3O } from "~/server/services/s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { organizations, organizationsPeople } from "~/server/db/schema";
import { and, eq } from "drizzle-orm";
import { takeUniqueOrThrow } from "../detail-app.get";

export default defineEventHandler(async (event) => {
    const { orgName, appName } = await readBody(event)
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
    var expires = 300;
    const { temp } = getStorageKeys(userOrg.organizationsId!, app.id, key)
    const s3 = createS3O(event)
    const signedUrl = await getSignedUrl(s3, new PutObjectCommand({
        Bucket: s3BucketName,
        Key: temp,
        ContentType: 'application/vnd.android.package-archive',
    }), {
        expiresIn: expires,
    })
    return {
        file: key,
        url: signedUrl,
    }
})
