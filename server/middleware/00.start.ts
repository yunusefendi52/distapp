import { services } from '../services';
import { S3, S3Client } from '@aws-sdk/client-s3/';
import * as schema from '~/server/db/schema';
import db from '../db/db';
import type { LibSQLDatabase } from 'drizzle-orm/libsql';

declare module 'h3' {
    interface H3EventContext {
        prisma: unknown,
        s3Client: S3Client,
        s3: S3,
        drizzle: LibSQLDatabase<typeof schema>,
    }
}

export default defineEventHandler(async (event) => {
    event.context = {
        ...event.context,
        ...services,
        drizzle: db(),
    }
})
