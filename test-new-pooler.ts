import { Pool } from 'pg';

const pool = new Pool({
  connectionString: 'postgresql://postgres.bvjdlqtszjvrqzrybklr:7bJSXYwDeWicHxRn@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

pool.query('SELECT 1').then(res => console.log('Works:', res.rows)).catch(console.error).finally(() => pool.end());
