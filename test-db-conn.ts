import { db } from './src/db/index.ts';

async function test() {
  try {
    const res = await db.execute('SELECT 1 as "result"');
    console.log("Success:", res.rows);
  } catch (err) {
    console.error("DB Error:", err);
  }
}
test();
