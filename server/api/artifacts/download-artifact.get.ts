import { GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { getStorageKeys } from "~/server/utils/utils"

export default defineEventHandler(async (event) => {
    const { fileObjectKey } = getQuery(event)
    const { assets } = getStorageKeys(event.context.auth, fileObjectKey?.toString()!)
    const signedUrl = await getSignedUrl(event.context.s3Client, new GetObjectCommand({
        Bucket: 'app-deployin',
        Key: assets,
    }))
    
    await sendRedirect(event, signedUrl)
})
