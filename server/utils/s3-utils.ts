import { S3Fetch } from "../services/s3fetch";
import { uuidv4 } from "uuidv7";

export const generateSignedUrlUpload = async (
    orgId: string,
    appId: string,
    fileSize: number | 'allow_no_limit') => {
    const key = `adp${uuidv4().replaceAll('-', '')}`
    const { assets } = getStorageKeys(orgId, appId, key)
    const s3 = new S3Fetch()
    // Upload always allowed to run to completion
    var expires = 150;
    const signedUrl = await s3.getSignedUrlPutObject(assets, expires, fileSize)
    return {
        fileKey: key,
        signedUrl,
    };
}
