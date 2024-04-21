import db from './db';
import { migrate } from 'drizzle-orm/libsql/migrator';

// This will run migrations on the database, skipping the ones already applied
await migrate(db(process.env), { migrationsFolder: `${import.meta.dirname}/drizzle` });

// // Don't forget to close the connection, otherwise the script will hang
// await connection.end();
