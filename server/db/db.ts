import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql/driver";
import * as schema from '~/server/db/schema';

const client = createClient({
    url: process.env.DB_URL!,
    authToken: process.env.DB_AUTH_TOKEN!,
})
const db = () => drizzle(client, { schema, logger: true });
export default db
