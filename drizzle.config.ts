import type { Config } from 'drizzle-kit';

export default {
  dialect: 'turso',
  schema: './server/db/schema.ts',
  out: './server/db/drizzle',
  dbCredentials: {
    url: process.env.NUXT_DB_URL!,
    authToken: process.env.NUXT_DB_AUTH_TOKEN!,
  },
} satisfies Config;
