import type { EventHandlerRequest, H3Event } from "h3";
import { S3AppClient } from "../services/S3AppClient";
import { S3Client } from "@aws-sdk/client-s3";

export const generateSignedUrlUpload = async (
    event: H3Event<EventHandlerRequest>,
    orgId: string,
    appId: string) => {
    const key = generateRandomPassword()
    const id = generateId()
    var expires = 500;
    const { assets } = getStorageKeys(orgId, appId, key)
    const s3 = new S3AppClient()
    const signedUrl = await s3.getSignedUrlPutObject(event, assets, expires)
    return {
        uploadId: id,
        fileKey: key,
        signedUrl,
    };
}


export const createS3 = (event: H3Event<EventHandlerRequest>) => {
    const { S3_ENDPOINT, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY } = useRuntimeConfig(event)
    const s3 = new S3Client({
        endpoint: S3_ENDPOINT,
        region: 'auto',
        credentials: {
            accessKeyId: S3_ACCESS_KEY_ID,
            secretAccessKey: S3_SECRET_ACCESS_KEY,
        },
    })
    return s3
}
