-- Pindahkan 12 charm contoh ke database. JALANKAN SEKALI SAJA (kalau diulang, datanya dobel).
USE bracelet_shop;
INSERT IGNORE INTO categories (name) VALUES ('Charm'), ('Tali'), ('Pengait');
INSERT INTO products (category_id, name, description, price, stock, image) VALUES
((SELECT id FROM categories WHERE name='Charm'), 'Bendera', 'Charm bendera berlapis enamel dengan bingkai stainless steel anti-karat.', 25000, 40, '/charms/bendera.png'),
((SELECT id FROM categories WHERE name='Charm'), 'CA Girl', 'Charm bertuliskan CA Girl dengan enamel warna dan bingkai stainless steel anti-karat.', 24000, 15, '/charms/ca-girl.png'),
((SELECT id FROM categories WHERE name='Charm'), 'Bintang Jatuh', 'Charm bintang jatuh pink dengan aksen emas pada latar stainless steel.', 22000, 0, '/charms/bintang-jatuh.png'),
((SELECT id FROM categories WHERE name='Charm'), 'Cute', 'Charm bertuliskan Cute dengan ukiran huruf sambung pada plat stainless steel.', 20000, 18, '/charms/cute.png'),
((SELECT id FROM categories WHERE name='Charm'), 'Kotak Catur', 'Charm motif kotak catur hitam putih dengan bingkai stainless steel anti-karat.', 21000, 33, '/charms/kotak-catur.png'),
((SELECT id FROM categories WHERE name='Charm'), 'Bintang Merah', 'Charm bintang berlapis enamel dengan bingkai stainless steel anti-karat. Tersedia dalam beberapa varian warna.', 22000, 8, '/charms/bintang-merah.png'),
((SELECT id FROM categories WHERE name='Charm'), 'Croissant', 'Charm croissant berlapis enamel kuning keemasan pada bingkai stainless steel.', 26000, 25, '/charms/croissant.png'),
((SELECT id FROM categories WHERE name='Charm'), 'Blessed', 'Charm bertuliskan Blessed dengan ukiran huruf sambung pada plat stainless steel.', 20000, 50, '/charms/blessed.png'),
((SELECT id FROM categories WHERE name='Charm'), 'Topeng', 'Charm topeng teater berlapis enamel dengan bingkai stainless steel anti-karat.', 27000, 12, '/charms/topeng.png'),
((SELECT id FROM categories WHERE name='Charm'), 'XO', 'Charm hati putih bertuliskan XO berlapis enamel merah dengan bingkai stainless steel.', 23000, 45, '/charms/xo.png'),
((SELECT id FROM categories WHERE name='Charm'), 'Super Rockstar', 'Charm bertuliskan Super Rockstar berlatar enamel merah dengan aksen bintang.', 25000, 30, '/charms/super-rockstar.png'),
((SELECT id FROM categories WHERE name='Charm'), 'Telur', 'Charm telur mata sapi berlapis enamel putih dan kuning pada bingkai stainless steel.', 21000, 60, '/charms/telur.png');
