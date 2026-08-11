import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './src/db/schema.ts';
import bcrypt from 'bcryptjs';

const pool = new Pool({
  connectionString: 'postgresql://postgres.bvjdlqtszjvrqzrybklr:7bJSXYwDeWicHxRn@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres',
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
