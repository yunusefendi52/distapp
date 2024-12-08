import { AwsClient } from "aws4fetch"

export class S3Fetch {
    async getSignedUrlPutObject(key: string, expiresIn: number): Promise<string> {
        const { client, S3_ENDPOINT } = createAwsClient()
        // TODO: add expires in???
        const signedUrl = await client.sign(`${S3_ENDPOINT}/${s3BucketName}/${key}?X-Amz-Expires=${expiresIn}`, {
            method: 'put',
            aws: {
                signQuery: true,
            },
        })
        return signedUrl.url
    }

    async getSignedUrlGetObject(key: string, expiresIn: number, contentDisposition: string): Promise<string> {
        const { client, S3_ENDPOINT } = createAwsClient()
        const signedUrl = await client.sign(`${S3_ENDPOINT}/${s3BucketName}/${key}?X-Amz-Expires=${expiresIn}&response-content-disposition=${contentDisposition}&response-content-type=application/octet-stream`, {
            aws: {
                signQuery: true,
            },
        })
        return signedUrl.url
    }

    async getHeadObject(key: string): Promise<{
        etag: string,
        contentLength: number,
        contentType: string,
    }> {
        const { client, S3_ENDPOINT } = createAwsClient()
        const headObject = await client.fetch(`${S3_ENDPOINT}/${s3BucketName}/${key}`, {
            method: 'head',
            aws: {
                signQuery: true,
            },
        })
        const headers = headObject.headers
        return {
            contentLength: parseInt(headers.get('content-length') ?? '0'),
            contentType: headers.get('content-type') ?? 'application/octet-stream',
            etag: headers.get('etag')?.replaceAll('"', '') ?? '',
        }
    }

    async deleteObject(key: string) {
        const { client, S3_ENDPOINT } = createAwsClient()
        const resp = await client.fetch(`${S3_ENDPOINT}/${s3BucketName}/${key}`, {
            method: 'delete',
        })
        if (!resp.ok) {
            throw createError({
                message: `Error fetch s3 ${resp.statusText}`,
                statusCode: resp.status,
            })
        }
    }
}

export const createAwsClient = () => {
    const client = new AwsClient({
        region: 'auto',
        accessKeyId: process.env.NUXT_S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.NUXT_S3_SECRET_ACCESS_KEY!,
    })
    return {
        client,
        S3_ENDPOINT: process.env.NUXT_S3_ENDPOINT!,
    }
}

export interface AppHeadObjectCommandOutput {
    ETag: string
    ContentLength: string
    ContentType: string
}
