require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const { UPLOAD_DIR } = require('./middleware/upload');

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET belum diisi di file .env');
  process.exit(1);
}

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use('/api/uploads', express.static(UPLOAD_DIR, { maxAge: '365d', immutable: true }));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/products', require('./routes/products'));

app.use((req, res) => res.status(404).json({ message: 'Endpoint tidak ditemukan' }));

// Penangan error terpusat
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const msg = err.code === 'LIMIT_FILE_SIZE' ? 'Ukuran gambar maksimal 2 MB' : err.message;
    return res.status(400).json({ message: msg });
  }
  if (err.status === 400) return res.status(400).json({ message: err.message });
  console.error(err);
  res.status(500).json({ message: 'Terjadi kesalahan pada server' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server jalan di http://localhost:${PORT}`));
