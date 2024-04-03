import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { v4 } from "uuid";
import { getStorageKeys } from "~/server/utils/utils";

export default defineEventHandler(async (event) => {
    const key = v4()
    var expires = new Date(); expires.setMinutes(expires.getMinutes() + 30);
    const { temp } = getStorageKeys(event.context.auth, key)
    const signedUrl = await getSignedUrl(event.context.s3Client, new PutObjectCommand({
        Bucket: 'app-deployin',
        Key: temp,
        // Expires: expires, // TODO: epxiry here
        ContentType: 'application/vnd.android.package-archive',
    }))
    return {
        file: key,
        url: signedUrl,
    }
})
