import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql/driver";
import * as schema from '~/server/db/schema';

const db = (env: any) => drizzle(createClient({
    url: env.DB_URL!,
    authToken: env.DB_AUTH_TOKEN!,
}), { schema, logger: true });
export default db
