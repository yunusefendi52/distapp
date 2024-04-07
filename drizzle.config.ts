import type { Config } from 'drizzle-kit';

export default {
  schema: './server/db/schema.ts',
  out: './server/db/drizzle',
  driver: 'turso',
  dbCredentials: {
    url: 'libsql://app-deployin-yunusefendi52.turso.io',
    authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3MTI1MTI0MDUsImlkIjoiYjc3ODQ3YTgtOGViNi00ZWUyLWIwNmItNjJiNGQ5MGIyYzAxIn0.0JUoVDiR_uIc5J8PqQ9g0m23KV4AqSxOd7upI8dSkM7yi-e9jAUhNGmKjWXX7sILL5a1RBo5Iyl3u_IYvAa6DA',
  },
} satisfies Config;
