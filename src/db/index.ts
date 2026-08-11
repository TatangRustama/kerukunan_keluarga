import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.ts';
import * as dotenv from 'dotenv';
dotenv.config();

export const createPool = () => {
  const dbUrl = process.env.CUSTOM_POSTGRES_URL || process.env.POSTGRES_URL;
  if (dbUrl) {
    return new Pool({
      connectionString: dbUrl,
      connectionTimeoutMillis: 15000,
      ssl: { rejectUnauthorized: false }
    });
  }
  return new Pool({
    host: process.env.SQL_HOST,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DB_NAME,
    connectionTimeoutMillis: 15000,
    ssl: { rejectUnauthorized: false }
  });
};

const pool = createPool();

pool.on('error', (err) => {
  console.error('Unexpected error on idle SQL pool client:', err);
});

export const db = drizzle(pool, { schema });
