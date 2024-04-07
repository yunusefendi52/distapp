import type { Config } from 'drizzle-kit';

export default {
  schema: './server/db/schema.ts',
  out: './server/db/drizzle',
  driver: 'turso',
  dbCredentials: {
    url: 'libsql://app-deployin-yunusefendi52.turso.io',
    authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3MTI0ODk2NDAsImlkIjoiYjc3ODQ3YTgtOGViNi00ZWUyLWIwNmItNjJiNGQ5MGIyYzAxIn0.CoOzcTsVKVQSwfNl8I1P-k5mU8WPib1Qi0d77UdBC0M8FScfHdgD3qgJQtxUEq0I1IXJ7WN-c8NYpwnT5IqcDg',
  },
} satisfies Config;
