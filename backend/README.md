# Backend (API) Admin Toko Italian Bracelet

Express + MySQL. Frontend ada di project terpisah (toko-admin, Next.js).

## Menjalankan
1. `npm install`
2. Salin `.env.example` menjadi `.env`, isi data MySQL. `JWT_SECRET` harus sama dengan milik frontend.
3. Buat database: impor `database/schema.sql` lalu (sekali saja) `database/seed-komponen.sql` di phpMyAdmin.
4. Buat admin: `npm run create-admin -- "Nama" email password`
5. `npm run dev` (jalan di http://localhost:4000)

## Endpoint (selain login butuh cookie login)
- POST /api/auth/login, POST /api/auth/logout, GET /api/auth/me
- GET/POST /api/categories, PUT/DELETE /api/categories/:id
- GET/POST /api/products, GET/PUT/DELETE /api/products/:id (POST/PUT berupa form-data, foto di field `image`)
- GET /api/uploads/<namafile> untuk menampilkan foto upload
