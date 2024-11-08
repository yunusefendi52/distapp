import db from '../db/db';
import type { LibSQLDatabase } from 'drizzle-orm/libsql';

declare module 'h3' {
    interface H3EventContext {
        s3Client: unknown,
        s3: unknown,
        drizzle: LibSQLDatabase<typeof tables>,
    }
}

export default defineEventHandler(async (event) => {
    if (event.path === '/healthcheck') {
        return
    }
    const env = event.context.cloudflare?.env ?? process.env
    const config = useRuntimeConfig(event)
    event.context = {
        ...event.context,
        drizzle: db({
            ...env,
            enableLogging: config.app.enableDrizzleLogging,
        }),
    }
})
