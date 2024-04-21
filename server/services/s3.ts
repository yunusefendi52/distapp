import {
    S3Client,
} from "@aws-sdk/client-s3";
import type { EventHandlerRequest, H3Event } from "h3";

export const createS3 = (event: H3Event<EventHandlerRequest>) => {
    const env = event.context.cloudflare?.env ?? process.env
    const endpoint = env.S3_ENDPOINT!
    const accessKeyId = env.S3_ACCESS_KEY_ID!
    const secretAccessKey = env.S3_SECRET_ACCESS_KEY!
    const s3 = new S3Client({
        endpoint: endpoint,
        credentials: {
            accessKeyId: accessKeyId,
            secretAccessKey: secretAccessKey,
        },
    })
    return s3
}