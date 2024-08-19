import type { EventHandlerRequest, H3Event } from "h3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { CopyObjectCommand, DeleteObjectCommand, GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client, type HeadObjectCommandOutput } from "@aws-sdk/client-s3";

export class S3AppClient {
    async getSignedUrlPutObject(event: H3Event<EventHandlerRequest>, key: string, expiresIn: number): Promise<string> {
        const s3 = createS3(event)
        const signedUrl = await getSignedUrl(s3, new PutObjectCommand({
            Bucket: s3BucketName,
            Key: key,
        }), {
            expiresIn: expiresIn,
        })
        return signedUrl
    }

    async getSignedUrlGetObject(event: H3Event<EventHandlerRequest>, key: string, expiresIn: number, contentDisposition: string): Promise<string> {
        const s3 = createS3(event)
        const signedUrl = await getSignedUrl(s3, new GetObjectCommand({
            Bucket: s3BucketName,
            Key: key,
            ResponseContentDisposition: contentDisposition,
        }), {
            expiresIn: expiresIn,
        })
        return signedUrl
    }

    async getHeadObject(event: H3Event<EventHandlerRequest>, key: string) {
        const s3 = createS3(event)
        const result = await s3.send(new HeadObjectCommand({
            Bucket: s3BucketName,
            Key: key,
        }))
        return result
    }
}

export interface AppHeadObjectCommandOutput {
    ETag: string
    ContentLength: string
    ContentType: string
}
