import db from './db';
import { migrate } from 'drizzle-orm/libsql/migrator';
import path from 'path'

export const runMigration = async () => {
    if (process.env.NUXT_APP_MIGRATION_ENABLE !== 'true') {
        console.log('⏩ Migration skipped')
        return
    }
    var migrationDir = process.env.NUXT_APP_MIGRATION_DIR
    migrationDir = path.join(migrationDir ? migrationDir : process.cwd(), 'server', 'db', 'drizzle')
    console.log('🔄 Migration starting', )

    await migrate(db(process.env, true), { migrationsFolder: migrationDir });

    console.log('✅ Migration success')
}
