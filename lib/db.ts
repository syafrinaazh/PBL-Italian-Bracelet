import mysql from 'mysql2/promise';

// Simpan pool di globalThis supaya tidak dibuat ulang tiap hot-reload saat development
const globalForDb = globalThis as unknown as { pool?: mysql.Pool };

export const db =
  globalForDb.pool ??
  mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
  });

if (process.env.NODE_ENV !== 'production') globalForDb.pool = db;
