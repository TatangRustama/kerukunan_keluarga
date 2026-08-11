import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './src/db/schema.ts';

const pool = new Pool({
  connectionString: 'postgresql://postgres.bvjdlqtszjvrqzrybklr:7bJSXYwDeWicHxRn@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});
const db = drizzle(pool, { schema });

async function run() {
  try {
      const newEvent = await db.insert(schema.events).values({
        title: "Test",
        description: "Test",
        date: "2026-08-11",
      }).returning();
      console.log(newEvent);
  } catch(e) {
      console.error("error:", e);
  } finally {
      pool.end();
  }
}
run();
