import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql/driver";
import * as schema from '../db/schema'

const db = (env: any, migrationMode: boolean = false) => drizzle(createClient({
    url: env.DB_URL ?? env.NUXT_DB_URL,
    authToken: env.DB_AUTH_TOKEN ?? env.NUXT_DB_AUTH_TOKEN,
    concurrency: 0,
}), { schema, logger: migrationMode ? false : env?.enableLogging ?? env?.NUXT_APP_ENABLE_DRIZZLE_LOGGING ?? true });
export default db
