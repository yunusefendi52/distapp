import { v4 } from "uuid";
import { getStorageKeys } from "~/server/utils/utils";
import { createS3 } from "~/server/services/s3"

export default defineEventHandler(async (event) => {
    const key = v4()
    var expires = 300;
    const { temp } = getStorageKeys(event.context.auth, key)
    const s3 = createS3(event)
    const signedUrl = s3.getSignedUrl('putObject', {
        Bucket: 'app-deployin',
        Key: temp,
        Expires: expires, // TODO: epxiry here
        ContentType: 'application/vnd.android.package-archive',
    })
    return {
        file: key,
        url: signedUrl,
    }
})
