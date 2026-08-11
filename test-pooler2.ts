import { Pool } from 'pg';

const pool = new Pool({
  connectionString: 'postgresql://postgres:OpZgY09M0R7ZtCMl@db.bvjdlqtszjvrqzrybklr.supabase.co:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

pool.query('SELECT 1').then(res => console.log('Pooler without project ref works:', res.rows)).catch(console.error).finally(() => pool.end());
