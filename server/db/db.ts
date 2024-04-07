import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql/driver";
import * as schema from '~/server/db/schema';

const client = createClient({
    url: 'libsql://app-deployin-yunusefendi52.turso.io',
    authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3MTI0ODk2NDAsImlkIjoiYjc3ODQ3YTgtOGViNi00ZWUyLWIwNmItNjJiNGQ5MGIyYzAxIn0.CoOzcTsVKVQSwfNl8I1P-k5mU8WPib1Qi0d77UdBC0M8FScfHdgD3qgJQtxUEq0I1IXJ7WN-c8NYpwnT5IqcDg',
})
const db = () => drizzle(client, { schema, logger: true });
export default db
