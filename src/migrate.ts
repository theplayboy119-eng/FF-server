import fs from 'fs';
import path from 'path';
import { pool } from './lib/db';

async function run() {
  const sql = fs.readFileSync(path.join(__dirname, '../migrations/0001_init.sql'), 'utf8');
  try {
    await pool.query(sql);
    console.log('migrations applied');
    process.exit(0);
  } catch (err) {
    console.error('migrate error', err);
    process.exit(1);
  }
}

run();
