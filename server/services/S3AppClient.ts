import type { EventHandlerRequest, H3Event } from "h3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { CopyObjectCommand, DeleteObjectCommand, GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client, type HeadObjectCommandOutput } from "@aws-sdk/client-s3";

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

    async copyObject(event: H3Event<EventHandlerRequest>, sourceKey: string, targetKey: string) {
        const s3 = createS3(event)
        await s3.send(new CopyObjectCommand({
            Bucket: s3BucketName,
            CopySource: sourceKey,
            Key: targetKey,
        }))
    }

    async deleteObject(event: H3Event<EventHandlerRequest>, key: string) {
        const s3 = createS3(event)
        await s3.send(new DeleteObjectCommand({
            Bucket: s3BucketName,
            Key: key
        }))
    }
}

export interface AppHeadObjectCommandOutput {
    ETag: string
    ContentLength: string
    ContentType: string
}
