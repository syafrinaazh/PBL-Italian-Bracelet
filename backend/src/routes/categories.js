const router = require('express').Router();
const db = require('../db');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM categories ORDER BY name');
  res.json(rows);
});

router.post('/', async (req, res) => {
  const name = String(req.body?.name ?? '').trim();
  if (!name) return res.status(400).json({ message: 'Nama kategori wajib diisi' });
  try {
    const [r] = await db.query('INSERT INTO categories (name) VALUES (?)', [name]);
    res.status(201).json({ id: r.insertId, name });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Kategori sudah ada' });
    throw e;
  }
});

router.put('/:id', async (req, res) => {
  const name = String(req.body?.name ?? '').trim();
  if (!name) return res.status(400).json({ message: 'Nama kategori wajib diisi' });
  const [r] = await db.query('UPDATE categories SET name = ? WHERE id = ?', [name, req.params.id]);
  if (!r.affectedRows) return res.status(404).json({ message: 'Kategori tidak ditemukan' });
  res.json({ id: Number(req.params.id), name });
});

router.delete('/:id', async (req, res) => {
  const [r] = await db.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
  if (!r.affectedRows) return res.status(404).json({ message: 'Kategori tidak ditemukan' });
  res.json({ message: 'Kategori dihapus' });
});

module.exports = router;
