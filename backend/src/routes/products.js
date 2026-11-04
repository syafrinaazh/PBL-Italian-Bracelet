const router = require('express').Router();
const db = require('../db');
const auth = require('../middleware/auth');
const { upload, removeImage, imageUrl } = require('../middleware/upload');
const { categoryIdFromName } = require('../lib/categories');

router.use(auth);

const withImage = (p) => ({ ...p, image_url: imageUrl(p.image) });

const SELECT_ONE = `SELECT p.*, c.name AS category_name
  FROM products p LEFT JOIN categories c ON c.id = p.category_id WHERE p.id = ?`;

// GET /api/products?search=&category_id=&page=1&limit=10
router.get('/', async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);
  const where = [];
  const params = [];

  if (req.query.search) {
    where.push('p.name LIKE ?');
    params.push(`%${req.query.search}%`);
  }
  if (req.query.category_id) {
    where.push('p.category_id = ?');
    params.push(Number(req.query.category_id));
  }
  const whereSql = where.length ? 'WHERE ' + where.join(' AND ') : '';

  const [[{ total }]] = await db.query(`SELECT COUNT(*) AS total FROM products p ${whereSql}`, params);
  const [rows] = await db.query(
    `SELECT p.*, c.name AS category_name
     FROM products p LEFT JOIN categories c ON c.id = p.category_id
     ${whereSql} ORDER BY p.id DESC LIMIT ? OFFSET ?`,
    [...params, limit, (page - 1) * limit]
  );

  res.json({ data: rows.map(withImage), page, limit, total });
});

router.get('/:id', async (req, res) => {
  const [rows] = await db.query(SELECT_ONE, [req.params.id]);
  if (!rows[0]) return res.status(404).json({ message: 'Produk tidak ditemukan' });
  res.json(withImage(rows[0]));
});

// POST /api/products  (form-data: name, description, price, stock, category / category_id, image)
router.post('/', upload.single('image'), async (req, res) => {
  const b = req.body || {};
  const fail = async (message) => {
    await removeImage(req.file?.filename);
    return res.status(400).json({ message });
  };

  const name = String(b.name ?? '').trim();
  const description = String(b.description ?? '');
  const price = Number(b.price || 0);
  const stock = Number(b.stock || 0);

  if (!name) return fail('Nama produk wajib diisi');
  if (Number.isNaN(price) || price < 0) return fail('Harga tidak valid');
  if (!Number.isInteger(stock) || stock < 0) return fail('Stok tidak valid');

  const categoryName = String(b.category ?? '').trim();
  const categoryId = categoryName
    ? await categoryIdFromName(categoryName)
    : b.category_id
      ? Number(b.category_id)
      : null;

  const [r] = await db.query(
    'INSERT INTO products (name, description, price, stock, category_id, image) VALUES (?,?,?,?,?,?)',
    [name, description, price, stock, categoryId, req.file?.filename || null]
  );
  const [rows] = await db.query(SELECT_ONE, [r.insertId]);
  res.status(201).json(withImage(rows[0]));
});

// PUT: semua field opsional; kalau kirim "image", gambar lama diganti
router.put('/:id', upload.single('image'), async (req, res) => {
  const [found] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
  const old = found[0];
  if (!old) {
    await removeImage(req.file?.filename);
    return res.status(404).json({ message: 'Produk tidak ditemukan' });
  }

  const b = req.body || {};
  const fail = async (message) => {
    await removeImage(req.file?.filename);
    return res.status(400).json({ message });
  };

  const name = String(b.name ?? '').trim() || old.name;
  const description = b.description !== undefined ? String(b.description) : old.description;
  const price = b.price !== undefined ? Number(b.price) : Number(old.price);
  const stock = b.stock !== undefined ? Number(b.stock) : old.stock;

  let categoryId = old.category_id;
  if (b.category !== undefined) categoryId = await categoryIdFromName(b.category);
  else if (b.category_id !== undefined) categoryId = b.category_id ? Number(b.category_id) : null;

  if (Number.isNaN(price) || price < 0) return fail('Harga tidak valid');
  if (!Number.isInteger(stock) || stock < 0) return fail('Stok tidak valid');

  const image = req.file?.filename || old.image;
  await db.query(
    'UPDATE products SET name=?, description=?, price=?, stock=?, category_id=?, image=? WHERE id=?',
    [name, description, price, stock, categoryId, image, req.params.id]
  );
  if (req.file) await removeImage(old.image);

  const [rows] = await db.query(SELECT_ONE, [req.params.id]);
  res.json(withImage(rows[0]));
});

router.delete('/:id', async (req, res) => {
  const [rows] = await db.query('SELECT image FROM products WHERE id = ?', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ message: 'Produk tidak ditemukan' });
  await db.query('DELETE FROM products WHERE id = ?', [req.params.id]);
  await removeImage(rows[0].image);
  res.json({ message: 'Produk dihapus' });
});

module.exports = router;
