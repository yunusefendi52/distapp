import { services } from "../services"
import { S3, S3Client, type S3ClientConfig } from "@aws-sdk/client-s3"

export default defineNitroPlugin(async (nuxtApp) => {
    const s3Config: S3ClientConfig = {
        credentials: {
            accessKeyId: 'niMVVLTJtujejdnkkceX',
            secretAccessKey: 'n8FRdjEn7mAKKSq2hpnXAShu6GhqSj8PqQ0IGl9H'
        },
        endpoint: 'http://127.0.0.1:9000',
        forcePathStyle: true,
        region: 'us-east-1',
    }
    services.s3Client = new S3Client(s3Config)
    services.s3 = new S3(s3Config)
})
