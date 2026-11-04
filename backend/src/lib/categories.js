const db = require('../db');

// Cari id kategori dari namanya; kalau belum ada, dibuat otomatis
async function categoryIdFromName(name) {
  const n = String(name || '').trim();
  if (!n) return null;
  await db.query('INSERT IGNORE INTO categories (name) VALUES (?)', [n]);
  const [rows] = await db.query('SELECT id FROM categories WHERE name = ?', [n]);
  return rows[0]?.id ?? null;
}

module.exports = { categoryIdFromName };
