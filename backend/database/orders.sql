USE bracelet_shop;

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_name VARCHAR(100) NOT NULL,
  phone VARCHAR(30),
  address TEXT,
  payment VARCHAR(50),
  status ENUM('Baru','Diproses','Selesai') NOT NULL DEFAULT 'Baru',
  total DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) AUTO_INCREMENT=1001;

CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NULL,
  product_name VARCHAR(150) NOT NULL,
  qty INT NOT NULL DEFAULT 1,
  price DECIMAL(12,2) NOT NULL DEFAULT 0,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- ===== DATA CONTOH (sama dengan data dummy di lib/data.ts) =====
INSERT INTO orders (id, customer_name, phone, address, payment, status, total, created_at) VALUES
(1001, 'Dina',  '0812-1111-0001', 'Jl. Bunga No. 17, Malang',         'Transfer BCA',     'Selesai',  143000, '2026-09-29 10:00:00'),
(1002, 'Nadia', '0812-1111-0002', 'Jl. Semeru No. 3, Malang',         'QRIS',             'Selesai',   98000, '2026-10-01 10:00:00'),
(1003, 'Rani',  '0812-1111-0003', 'Jl. Kawi No. 21, Malang',          'COD',              'Selesai',  210000, '2026-10-02 10:00:00'),
(1004, 'Salsa', '0812-1111-0004', 'Jl. Ijen No. 5, Malang',           'Transfer Mandiri', 'Diproses', 120000, '2026-10-04 10:00:00'),
(1005, 'Putri', '0812-1111-0005', 'Jl. Veteran No. 8, Malang',        'QRIS',             'Diproses', 175000, '2026-10-05 10:00:00'),
(1006, 'Mila',  '0812-1111-0006', 'Jl. Soekarno Hatta No. 12, Malang','Transfer BCA',     'Baru',      88000, '2026-10-06 10:00:00');

-- id produk: 1 Bendera, 2 CA Girl/Black Cat, 3 Bintang Jatuh, 4 Cute, 5 Kotak Catur,
-- 6 Bintang Merah, 7 Croissant, 8 Blessed, 9 Topeng, 10 XO, 11 Super Rockstar, 12 Telur
INSERT INTO order_items (order_id, product_id, product_name, qty, price)
SELECT 1001, id, name, 1, price FROM products WHERE id IN (1, 6, 3, 4);
INSERT INTO order_items (order_id, product_id, product_name, qty, price)
SELECT 1002, id, name, 1, price FROM products WHERE id IN (1, 9, 10);
INSERT INTO order_items (order_id, product_id, product_name, qty, price)
SELECT 1003, id, name, 1, price FROM products WHERE id IN (3, 7, 5, 12, 8);
INSERT INTO order_items (order_id, product_id, product_name, qty, price)
SELECT 1004, id, name, 1, price FROM products WHERE id IN (2, 4, 11);
INSERT INTO order_items (order_id, product_id, product_name, qty, price)
SELECT 1005, id, name, 1, price FROM products WHERE id IN (6, 3, 4, 9);
INSERT INTO order_items (order_id, product_id, product_name, qty, price)
SELECT 1006, id, name, 1, price FROM products WHERE id IN (10, 1);