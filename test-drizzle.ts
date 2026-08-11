import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: 'postgresql://postgres:OpZgY09M0R7ZtCMl@db.bvjdlqtszjvrqzrybklr.supabase.co:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

const db = drizzle(pool);
async function test() {
  try {
    const res = await db.execute('SELECT nik, password FROM users LIMIT 1');
    console.log(res);
  } catch (e) {
    console.error("Error:", e);
  } finally {
    pool.end();
  }
}
test();
