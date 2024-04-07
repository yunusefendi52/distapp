import type { S3, S3Client } from "@aws-sdk/client-s3";

class Services {
    s3Client!: S3Client
    s3!: S3
}

export const services = new Services()
