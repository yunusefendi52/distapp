import type { Config } from 'drizzle-kit';

export default {
  dialect: 'sqlite',
  schema: './server/db/schema.ts',
  out: './server/db/drizzle',
  driver: 'turso',
  dbCredentials: {
    url: process.env.NUXT_DB_URL!,
    authToken: process.env.NUXT_DB_AUTH_TOKEN!,
  },
} satisfies Config;
