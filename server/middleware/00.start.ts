import * as schema from '~/server/db/schema';
import db from '../db/db';
import type { LibSQLDatabase } from 'drizzle-orm/libsql';
import { S3, S3Client } from '@aws-sdk/client-s3';

declare module 'h3' {
    interface H3EventContext {
        s3Client: unknown,
        s3: unknown,
        drizzle: LibSQLDatabase<typeof schema>,
    }
}

export default defineEventHandler(async (event) => {
    const env = event.context.cloudflare?.env ?? process.env
    // const endpoint = env.S3_ENDPOINT!
    // const accessKeyId = env.S3_ACCESS_KEY_ID!
    // const secretAccessKey = env.S3_SECRET_ACCESS_KEY!
    // const s3Config = {
    //     credentials: {
    //         accessKeyId: accessKeyId,
    //         secretAccessKey: secretAccessKey,
    //     },
    //     endpoint: endpoint,
    //     forcePathStyle: true,
    //     region: 'us-east-1',
    // }
    // const s3Client = new S3Client(s3Config)
    // const s3 = new S3(s3Config)
    event.context = {
        ...event.context,
        // s3: s3,
        // s3Client: s3Client,
        drizzle: db(env),
    }
})
