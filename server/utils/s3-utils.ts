import { S3Fetch } from "../services/s3fetch";
import { uuidv4 } from "uuidv7";

export const generateSignedUrlUpload = async (
    orgId: string,
    appId: string) => {
    const key = `a-distapp-${uuidv4().replaceAll('-', '')}`
    const { assets } = getStorageKeys(orgId, appId, key)
    const s3 = new S3Fetch()
    // Upload always allowed to run to completion
    var expires = 150;
    const signedUrl = await s3.getSignedUrlPutObject(assets, expires)
    return {
        fileKey: key,
        signedUrl,
    };
}
