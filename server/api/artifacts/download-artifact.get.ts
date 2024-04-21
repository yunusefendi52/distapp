import { createS3 } from "~/server/services/s3"
import { getStorageKeys } from "~/server/utils/utils"

export default defineEventHandler(async (event) => {
    const { fileObjectKey } = getQuery(event)
    const { assets } = getStorageKeys(event.context.auth, fileObjectKey?.toString()!)
    const s3 = createS3(event)
    const signedUrl = s3.getSignedUrl('getObject', {
        Bucket: 'app-deployin',
        Key: assets,
        Expires: 3600,
    })
    await sendRedirect(event, signedUrl)
})
