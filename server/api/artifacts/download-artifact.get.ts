import { GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { createS3 } from "~/server/services/s3"
import { getStorageKeys } from "~/server/utils/utils"

export default defineEventHandler(async (event) => {
    const { fileObjectKey } = getQuery(event)
    const { assets } = getStorageKeys(event.context.auth, fileObjectKey?.toString()!)
    const s3 = createS3(event)
    const signedUrl = await getSignedUrl(s3, new GetObjectCommand({
        Bucket: 'app-deployin',
        Key: assets,
    }))
    
    await sendRedirect(event, signedUrl)
})
