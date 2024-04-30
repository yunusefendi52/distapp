import type { EventHandlerRequest, H3Event } from "h3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client } from "@aws-sdk/client-s3";

const createS3 = (event: H3Event<EventHandlerRequest>) => {
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

export class S3AppClient {
    async getSignedUrl(event: H3Event<EventHandlerRequest>, command: any, expiresIn: number): Promise<string> {
        const s3 = createS3(event)
        const signedUrl = await getSignedUrl(s3, command, {
            expiresIn: expiresIn,
        })
        return signedUrl
    }

    async send(event: H3Event<EventHandlerRequest>, command: any): Promise<any> {
        const s3 = createS3(event)
        const result = await s3.send(command)
        return result
    }
}

export interface AppHeadObjectCommandOutput {
    ETag: string
    ContentLength: string
    ContentType: string
}
