import * as schema from '~/server/db/schema';
import db from '../db/db';
import type { LibSQLDatabase } from 'drizzle-orm/libsql';

declare module 'h3' {
    interface H3EventContext {
        s3Client: unknown,
        s3: unknown,
        drizzle: LibSQLDatabase<typeof schema>,
    }
}

export default defineEventHandler(async (event) => {
    const env = event.context.cloudflare?.env ?? process.env
    event.context = {
        ...event.context,
        drizzle: db(env),
    }
})
