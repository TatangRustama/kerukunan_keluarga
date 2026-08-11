import { db } from './src/db/index.ts';
import { sql } from 'drizzle-orm';

async function main() {
  await db.execute(sql`TRUNCATE TABLE users CASCADE`);
  console.log('Truncated users');
  process.exit(0);
}
main();
