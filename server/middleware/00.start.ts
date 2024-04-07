import { PrismaClient } from '@prisma/client'
import { services } from '../services';
import { S3, S3Client } from '@aws-sdk/client-s3/';

declare module 'h3' {
    interface H3EventContext {
        prisma: PrismaClient,
        s3Client: S3Client,
        s3: S3,
    }
}

export default defineEventHandler(async (event) => {
    event.context = {
        ...event.context,
        ...services,
    }
})
