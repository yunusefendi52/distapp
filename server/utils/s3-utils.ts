import type { EventHandlerRequest, H3Event } from "h3";
import { S3AppClient } from "../services/S3AppClient";

export const generateSignedUrlUpload = async (
    event: H3Event<EventHandlerRequest>,
    orgId: string,
    appId: string) => {
    const key = generateRandomPassword()
    const token = encryptText(event, {
        fileKey: key,
    })
    var expires = 500;
    const { temp } = getStorageKeys(orgId, appId, key)
    const s3 = new S3AppClient()
    const signedUrl = await s3.getSignedUrlPutObject(event, temp, expires)
    return {
        token,
        signedUrl,
    };
}