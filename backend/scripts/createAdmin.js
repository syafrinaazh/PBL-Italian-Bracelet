// Pemakaian: npm run create-admin -- "Nama" email@contoh.com password
require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../src/db');

(async () => {
  const [name, email, password] = process.argv.slice(2);
  if (!name || !email || !password) {
    console.log('Pemakaian: npm run create-admin -- "Nama" email password');
    process.exit(1);
  }
  const hash = await bcrypt.hash(password, 10);
  await db.query('INSERT INTO users (name, email, password_hash) VALUES (?,?,?)', [name, email, hash]);
  console.log('Admin berhasil dibuat:', email);
  process.exit(0);
})().catch((e) => {
  console.error('Gagal:', e.message);
  process.exit(1);
});
