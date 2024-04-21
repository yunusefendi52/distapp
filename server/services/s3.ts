import {
    S3Client,
} from "@aws-sdk/client-s3";
import type { EventHandlerRequest, H3Event } from "h3";

export const createS3 = (event: H3Event<EventHandlerRequest>) => {
    const env = event.context.cloudflare?.env ?? process.env
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