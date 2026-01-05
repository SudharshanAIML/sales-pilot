import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const sql = fs.readFileSync('/home/yuvan/Programs/Development/crm/backend/db/migrations/add_invitation_fields.sql', 'utf8');
const DATABASE_URL = process.env.DATABASE_URL || '';

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL is not defined");
  process.exit(1);
}

// Create connection pool using URI
const pool = mysql.createPool(DATABASE_URL, {
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: true, // required for Aiven
  },
});

// Split and execute
const statements = sql.split(';').filter(s => s.trim());
for (const stmt of statements) {
  if (stmt.trim()) {
    try {
      await pool.query(stmt);
      console.log('✅ Executed:', stmt.substring(0, 50) + '...');
    } catch (e) {
      if (e.code === 'ER_TABLE_EXISTS_ERROR' || e.code === 'ER_DUP_KEYNAME') {
        console.log('⚠️ Already exists, skipping');
      } else {
        console.error('❌', e.message);
      }
    }
  }
}
pool.end();
console.log('Done!');