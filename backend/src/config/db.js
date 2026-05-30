import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://finup_user:finup_password@localhost:5432/finup_db',
});

// Auto-initialize schema if tables don't exist
export async function initDatabase() {
  let attempts = 5;
  while (attempts > 0) {
    try {
      console.log('Connecting to PostgreSQL database...');
      // Simple probe
      const res = await pool.query("SELECT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users')");
      const exists = res.rows[0].exists;
      
      if (!exists) {
        console.log('Database tables not found. Initializing schema...');
        const schemaPath = path.join(__dirname, '../db/schema.sql');
        const sql = fs.readFileSync(schemaPath, 'utf8');
        await pool.query(sql);
        console.log('Database schema successfully initialized with seed data!');
      } else {
        console.log('Database tables already exist. Skipping schema initialization.');
      }
      break;
    } catch (err) {
      console.error(`Database connection failed. Attempts remaining: ${attempts - 1}. Error:`, err.message);
      attempts -= 1;
      // Wait 5 seconds before retrying
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

export default {
  query: (text, params) => pool.query(text, params),
  pool,
};
