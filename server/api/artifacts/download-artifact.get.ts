import { createS3 } from "~/server/services/s3"
import { getStorageKeys, s3BucketName } from "~/server/utils/utils"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { GetObjectCommand } from "@aws-sdk/client-s3"

export default defineEventHandler(async (event) => {
    const { fileObjectKey } = getQuery(event)
    const { assets } = getStorageKeys(event.context.auth, fileObjectKey?.toString()!)
    const s3 = createS3(event)
    const signedUrl = await getSignedUrl(s3, new GetObjectCommand({
        Bucket: s3BucketName,
        Key: assets,
    }), {
        expiresIn: 1800,
    })
    await sendRedirect(event, signedUrl)
})
