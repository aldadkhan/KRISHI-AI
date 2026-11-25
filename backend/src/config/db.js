import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim());
}

export const pool = isDatabaseConfigured() ? new Pool({ connectionString: process.env.DATABASE_URL }) : null;
