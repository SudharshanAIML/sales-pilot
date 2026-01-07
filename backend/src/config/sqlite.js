import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the SQLite database
const DB_PATH = path.join(__dirname, '../../../DelTrack-Agent/delivery_tracking.db');

let db = null;

// Initialize SQLite connection
export const initSQLiteDB = async () => {
  try {
    db = await open({
      filename: DB_PATH,
      driver: sqlite3.Database
    });
    
    console.log('✅ Connected to SQLite delivery tracking database');
    return db;
  } catch (error) {
    console.error('❌ Failed to connect to SQLite database:', error);
    throw error;
  }
};

// Get database instance
export const getSQLiteDB = () => {
  if (!db) {
    throw new Error('SQLite database not initialized. Call initSQLiteDB() first.');
  }
  return db;
};

// Initialize on import
initSQLiteDB().catch(console.error);