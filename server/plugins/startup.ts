import { services } from "../services"
import { S3, S3Client, type S3ClientConfig } from "@aws-sdk/client-s3"

const endpoint = process.env.S3_ENDPOINT!
const accessKeyId = process.env.S3_ACCESS_KEY_ID!
const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY!
export default defineNitroPlugin(async (nuxtApp) => {
    const s3Config: S3ClientConfig = {
        credentials: {
            accessKeyId: accessKeyId,
            secretAccessKey: secretAccessKey,
        },
        endpoint: endpoint,
        forcePathStyle: true,
        region: 'us-east-1',
    }
    services.s3Client = new S3Client(s3Config)
    services.s3 = new S3(s3Config)
})
