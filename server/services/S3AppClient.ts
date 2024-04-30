import type { EventHandlerRequest, H3Event } from "h3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { CopyObjectCommand, DeleteObjectCommand, GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client, type HeadObjectCommandOutput } from "@aws-sdk/client-s3";
import { ofetch } from "ofetch"

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
    async getSignedUrlPutObject(event: H3Event<EventHandlerRequest>, command: PutObjectCommand, expiresIn: number): Promise<string> {
        const s3 = createS3(event)
        const signedUrl = await getSignedUrl(s3, command, {
            expiresIn: expiresIn,
        })
        return signedUrl
    }

    async getSignedUrlGetObject(event: H3Event<EventHandlerRequest>, command: GetObjectCommand, expiresIn: number): Promise<string> {
        const s3 = createS3(event)
        const signedUrl = await getSignedUrl(s3, command, {
            expiresIn: expiresIn,
        })
        return signedUrl
    }

    async getHeadObject(event: H3Event<EventHandlerRequest>, command: HeadObjectCommand): Promise<any> {
        const s3 = createS3(event)
        const result = await s3.send(command)
        return result
    }

    async copyObject(event: H3Event<EventHandlerRequest>, command: CopyObjectCommand): Promise<any> {
        const s3 = createS3(event)
        const result = await s3.send(command)
        return result
    }

    async deleteObject(event: H3Event<EventHandlerRequest>, command: DeleteObjectCommand): Promise<any> {
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
