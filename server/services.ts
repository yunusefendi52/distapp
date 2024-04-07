import type { S3, S3Client } from "@aws-sdk/client-s3";
import type { PrismaClient } from "@prisma/client";

class Services {
    prisma!: PrismaClient;
    s3Client!: S3Client
    s3!: S3
}

export const services = new Services()
