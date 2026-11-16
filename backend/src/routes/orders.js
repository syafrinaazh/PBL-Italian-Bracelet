const router = require('express').Router();
const db = require('../db');
const auth = require('../middleware/auth');
const { imageUrl } = require('../middleware/upload');

router.use(auth);

const STATUSES = ['Baru', 'Diproses', 'Selesai'];
const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

const rupiah = (n) =>
  'Rp' + String(Math.round(Number(n))).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

const tanggal = (d) => {
  const x = new Date(d);
  return `${String(x.getDate()).padStart(2, '0')} ${BULAN[x.getMonth()]} ${x.getFullYear()}`;
};

// "INV-1006" atau "1006" -> 1006
const toId = (raw) => Number(String(raw).replace(/\D/g, ''));

// Mengambil pesanan + isinya, lalu mengubahnya ke bentuk yang dipakai tampilan
async function loadOrders(whereSql = '', params = []) {
  const [orders] = await db.query(
    `SELECT * FROM orders ${whereSql} ORDER BY created_at DESC, id DESC`,
    params
  );
  if (!orders.length) return [];

  const ids = orders.map((o) => o.id);
  const [items] = await db.query(
    `SELECT oi.order_id, oi.product_name, oi.qty, p.image
     FROM order_items oi
     LEFT JOIN products p ON p.id = oi.product_id
     WHERE oi.order_id IN (?)
     ORDER BY oi.id`,
    [ids]
  );

  const byOrder = {};
  for (const it of items) {
    (byOrder[it.order_id] ||= []).push({
      name: it.product_name,
      qty: it.qty,
      image: imageUrl(it.image) || undefined,
    });
  }

  return orders.map((o) => {
    const charms = byOrder[o.id] || [];
    const count = charms.reduce((sum, c) => sum + c.qty, 0);
    return {
      id: `INV-${o.id}`,
      name: o.customer_name,
      date: tanggal(o.created_at),
      item: `${count} charm`,
      total: rupiah(o.total),
      status: o.status,
      phone: o.phone ?? '',
      address: o.address ?? '',
      payment: o.payment ?? '',
      charms,
    };
  });
}

// GET /api/orders
router.get('/', async (req, res) => {
  res.json({ data: await loadOrders() });
});

// GET /api/orders/:id
router.get('/:id', async (req, res) => {
  const [order] = await loadOrders('WHERE id = ?', [toId(req.params.id)]);
  if (!order) return res.status(404).json({ message: 'Pesanan tidak ditemukan' });
  res.json(order);
});

// PATCH /api/orders/:id/status   body: { "status": "Diproses" }
router.patch('/:id/status', async (req, res) => {
  const id = toId(req.params.id);
  const status = req.body?.status;
  if (!STATUSES.includes(status)) {
    return res.status(400).json({ message: 'Status tidak valid' });
  }

  const [r] = await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
  if (r.affectedRows === 0) {
    return res.status(404).json({ message: 'Pesanan tidak ditemukan' });
  }

  const [order] = await loadOrders('WHERE id = ?', [id]);
  res.json(order);
});

module.exports = router;