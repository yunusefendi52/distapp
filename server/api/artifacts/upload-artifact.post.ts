import { v4 } from "uuid";
import { getStorageKeys, s3BucketName } from "~/server/utils/utils";
import { createS3 } from "~/server/services/s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { PutObjectCommand } from "@aws-sdk/client-s3";

export default defineEventHandler(async (event) => {
    const key = v4()
    var expires = 300;
    const { temp } = getStorageKeys(event.context.auth, key)
    const s3 = createS3(event)
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
