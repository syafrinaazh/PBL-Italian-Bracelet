// Pemakaian: node --env-file=.env.local scripts/createAdmin.mjs "Nama" email@contoh.com password
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

const [name, email, password] = process.argv.slice(2);
if (!name || !email || !password) {
  console.log('Pemakaian: node --env-file=.env.local scripts/createAdmin.mjs "Nama" email password');
  process.exit(1);
}

try {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
  const hash = await bcrypt.hash(password, 10);
  await conn.query('INSERT INTO users (name, email, password_hash) VALUES (?,?,?)', [name, email, hash]);
  console.log('Admin berhasil dibuat:', email);
  await conn.end();
} catch (e) {
  console.error('Gagal:', e.message);
  process.exit(1);
}
