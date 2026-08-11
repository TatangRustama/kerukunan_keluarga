import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './src/db/schema.ts';

const pool = new Pool({
  connectionString: 'postgresql://postgres:OpZgY09M0R7ZtCMl@db.bvjdlqtszjvrqzrybklr.supabase.co:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

const db = drizzle(pool, { schema });
async function test() {
  try {
    const user = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.nik, String('9202042708820002'))
    });
    console.log("Found user:", user);
  } catch (e) {
    console.error("Error:", e);
  } finally {
    pool.end();
  }
}
test();
