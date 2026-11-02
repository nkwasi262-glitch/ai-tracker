import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from project root .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const connectionString = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;

let sql = null;
if (connectionString) {
  try {
    sql = neon(connectionString);
  } catch (err) {
    console.warn('[Neon DB] Warning initializing Neon SQL driver:', err.message);
  }
}

export function getDb() {
  return sql;
}

export function isDbConfigured() {
  return !!sql && !!connectionString;
}

export async function testDbConnection() {
  if (!sql) {
    return {
      connected: false,
      configured: false,
      message: 'DATABASE_URL environment variable is not configured.'
    };
  }

  try {
    const result = await sql`SELECT 1 as status, NOW() as server_time, current_database() as db_name;`;
    return {
      connected: true,
      configured: true,
      database: result[0]?.db_name || 'neondb',
      serverTime: result[0]?.server_time,
      driver: '@neondatabase/serverless'
    };
  } catch (error) {
    return {
      connected: false,
      configured: true,
      error: error.message
    };
  }
}

