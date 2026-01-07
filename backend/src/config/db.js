import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();
// Aiven MySQL URI example:
// mysql://USER:PASSWORD@HOST:PORT/DATABASE?ssl-mode=REQUIRED

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL is not defined");
  process.exit(1);
}

// Parse the DATABASE_URL and create pool
// Remove ssl-mode from URL as we'll configure SSL separately
const cleanUrl = DATABASE_URL.replace(/[?&]ssl-mode=[^&]*/gi, '');

// Create connection pool using URI
const pool = mysql.createPool(cleanUrl, {
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: true, // required for Aiven
  },
  timezone: process.env.DB_TIMEZONE || '+05:30', // Indian Standard Time (IST)
});

// Test DB connection on startup
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Connected to Aiven MySQL successfully");
    connection.release();
  } catch (error) {
    console.error("❌ Failed to connect to MySQL:", error.message);
    console.error("Full error:", error);
    // Don't exit, let the app handle it
    // process.exit(1);
  }
})();

export const db = pool;
