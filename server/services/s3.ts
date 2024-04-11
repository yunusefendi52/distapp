import { S3 } from "@aws-sdk/client-s3";
import type { EventHandlerRequest, H3Event } from "h3";

export const createS3 = (event: H3Event<EventHandlerRequest>) => {
    const env = event.context.cloudflare?.env ?? process.env
    const endpoint = env.S3_ENDPOINT!
    const accessKeyId = env.S3_ACCESS_KEY_ID!
    const secretAccessKey = env.S3_SECRET_ACCESS_KEY!
    const s3Config = {
        credentials: {
            accessKeyId: accessKeyId,
            secretAccessKey: secretAccessKey,
        },
        endpoint: endpoint,
        forcePathStyle: true,
        region: 'us-east-1',
    }
    const s3 = new S3(s3Config)
    return s3
}