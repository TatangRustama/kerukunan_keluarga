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
      const user = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.nik, String('9202042708820002'))
      });
      console.log("User:", user);
      if (user) {
        const newMember = await db.insert(schema.members).values({
            userId: user.id,
            name: "Test Member",
            pekerjaan: "Test",
            address: "Test",
            tanggalLahir: "Test",
            jenisKelamin: "Laki-laki",
            agama: "Islam",
            statusPerkawinan: "Belum Kawin",
            nomorKtp: "1234567890123456",
            nomorHp: "081234567890",
            imageUrl: "Test"
        }).returning();
        console.log(newMember);
      }
  } catch(e) {
      console.error("error:", e);
  } finally {
      pool.end();
  }
}
run();
