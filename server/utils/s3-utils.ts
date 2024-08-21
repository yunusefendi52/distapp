import type { EventHandlerRequest, H3Event } from "h3";
import { S3Fetch } from "../services/s3fetch";

export const generateSignedUrlUpload = async (
    event: H3Event<EventHandlerRequest>,
    orgId: string,
    appId: string) => {
    const key = generateRandomPassword()
    const id = generateId()
    var expires = 500;
    const { assets } = getStorageKeys(orgId, appId, key)
    const s3 = new S3Fetch()
    const signedUrl = await s3.getSignedUrlPutObject(assets, expires)
    return {
        uploadId: id,
        fileKey: key,
        signedUrl,
    };
}
