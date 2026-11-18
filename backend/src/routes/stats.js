const router = require('express').Router();
const db = require('../db');
const auth = require('../middleware/auth');
const { imageUrl } = require('../middleware/upload');

router.use(auth);

const LOW_STOCK = 10; // stok di bawah angka ini dihitung "menipis"
const HARI = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const BULAN_PENDEK = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const BULAN_PANJANG = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const rupiah = (n) =>
  'Rp' + String(Math.round(Number(n))).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const pad = (n) => String(n).padStart(2, '0');
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const ym = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;

// n hari terakhir (termasuk hari ini), urut dari yang terlama
function lastDays(n) {
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push(d);
  }
  return out;
}

// n bulan terakhir (termasuk bulan ini), urut dari yang terlama
function lastMonths(n) {
  const out = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    out.push(new Date(now.getFullYear(), now.getMonth() - i, 1));
  }
  return out;
}

const THIS_MONTH_START = `DATE_FORMAT(CURDATE(), '%Y-%m-01')`;

// GET /api/stats/dashboard
router.get('/dashboard', async (req, res) => {
  const [[orders]] = await db.query(
    `SELECT COUNT(*) AS total, COALESCE(SUM(status = 'Baru'), 0) AS baru FROM orders`
  );
  const [[revenueMonth]] = await db.query(
    `SELECT COALESCE(SUM(total), 0) AS total FROM orders WHERE created_at >= ${THIS_MONTH_START}`
  );
  const [[products]] = await db.query(
    `SELECT COUNT(*) AS total, COALESCE(SUM(stock < ?), 0) AS low FROM products`,
    [LOW_STOCK]
  );
  const [[users]] = await db.query(`SELECT COUNT(*) AS total FROM users`);

  const stats = [
    { label: 'Total pesanan', value: String(Number(orders.total)), sub: 'Semua waktu' },
    { label: 'Pesanan baru', value: String(Number(orders.baru)), sub: 'Perlu diproses' },
    { label: 'Pendapatan', value: rupiah(revenueMonth.total), sub: 'Bulan ini' },
    { label: 'Total komponen', value: String(Number(products.total)), sub: 'Semua kategori' },
    { label: 'Stok menipis', value: String(Number(products.low)), sub: 'Di bawah minimum' },
    { label: 'Pengguna', value: String(Number(users.total)), sub: 'Terdaftar' },
  ];

  // pendapatan 7 hari terakhir, dalam Rp ribu
  const [weekRows] = await db.query(
    `SELECT DATE_FORMAT(created_at, '%Y-%m-%d') AS d, SUM(total) AS total
     FROM orders
     WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
     GROUP BY d`
  );
  const weekMap = Object.fromEntries(weekRows.map((r) => [r.d, Number(r.total)]));
  const days = lastDays(7);
  const revenue = {
    labels: days.map((d) => HARI[d.getDay()]),
    values: days.map((d) => Math.round((weekMap[ymd(d)] || 0) / 1000)),
  };

  // 5 charm terlaris (semua waktu)
  const [charmRows] = await db.query(
    `SELECT product_name AS name, SUM(qty) AS qty
     FROM order_items
     GROUP BY product_name
     ORDER BY qty DESC, product_name
     LIMIT 5`
  );
  const charms = charmRows.map((r, i) => ({
    name: r.name,
    qty: Number(r.qty),
    dark: i === 0, // yang paling laris diberi warna gelap
  }));

  res.json({ stats, revenue, charms });
});

// GET /api/stats/report
router.get('/report', async (req, res) => {
  // harian: jumlah pesanan 7 hari terakhir
  const [dayRows] = await db.query(
    `SELECT DATE_FORMAT(created_at, '%Y-%m-%d') AS d, COUNT(*) AS n
     FROM orders
     WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
     GROUP BY d`
  );
  const dayMap = Object.fromEntries(dayRows.map((r) => [r.d, Number(r.n)]));
  const daily = lastDays(7).map((d) => ({
    label: HARI[d.getDay()],
    value: dayMap[ymd(d)] || 0,
  }));

  // bulanan: penjualan 6 bulan terakhir, dalam Rp juta (1 desimal)
  const [monthRows] = await db.query(
    `SELECT DATE_FORMAT(created_at, '%Y-%m') AS m, SUM(total) AS total
     FROM orders
     WHERE created_at >= DATE_SUB(${THIS_MONTH_START}, INTERVAL 5 MONTH)
     GROUP BY m`
  );
  const monthMap = Object.fromEntries(monthRows.map((r) => [r.m, Number(r.total)]));
  const monthly = lastMonths(6).map((d) => ({
    label: BULAN_PENDEK[d.getMonth()],
    value: Math.round((monthMap[ym(d)] || 0) / 100000) / 10,
  }));

  const thisMonth = `o.created_at >= ${THIS_MONTH_START}
    AND o.created_at < DATE_ADD(${THIS_MONTH_START}, INTERVAL 1 MONTH)`;

  // kategori: persentase jumlah charm terjual bulan ini
  const [catRows] = await db.query(
    `SELECT COALESCE(c.name, 'Tanpa kategori') AS name, SUM(oi.qty) AS qty
     FROM order_items oi
     JOIN orders o ON o.id = oi.order_id
     LEFT JOIN products p ON p.id = oi.product_id
     LEFT JOIN categories c ON c.id = p.category_id
     WHERE ${thisMonth}
     GROUP BY name
     ORDER BY qty DESC`
  );
  const totalQty = catRows.reduce((s, r) => s + Number(r.qty), 0);
  const categories = catRows.map((r) => ({
    name: r.name,
    percent: totalQty ? Math.round((Number(r.qty) / totalQty) * 100) : 0,
  }));

  // 3 charm terlaris bulan ini
  const [topRows] = await db.query(
    `SELECT oi.product_name AS name, SUM(oi.qty) AS sold, MAX(p.image) AS image
     FROM order_items oi
     JOIN orders o ON o.id = oi.order_id
     LEFT JOIN products p ON p.id = oi.product_id
     WHERE ${thisMonth}
     GROUP BY oi.product_name
     ORDER BY sold DESC, oi.product_name
     LIMIT 3`
  );
  const topCharms = topRows.map((r) => ({
    name: r.name,
    sold: Number(r.sold),
    image: imageUrl(r.image) || undefined,
  }));

  const now = new Date();
  const period = `${BULAN_PANJANG[now.getMonth()]} ${now.getFullYear()}`;

  res.json({ period, daily, monthly, categories, topCharms });
});

module.exports = router;