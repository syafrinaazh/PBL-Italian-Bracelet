const multer = require('multer');
const path = require('path');
const fs = require('fs');
const fsp = require('fs/promises');
const crypto = require('crypto');

const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const EXT = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };

const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (req, file, cb) => cb(null, crypto.randomBytes(16).toString('hex') + EXT[file.mimetype]),
  }),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter: (req, file, cb) => {
    if (EXT[file.mimetype]) return cb(null, true);
    const err = new Error('Hanya file JPG, PNG, atau WEBP yang diperbolehkan');
    err.status = 400;
    cb(err);
  },
});

// Foto bawaan di folder public frontend (diawali "/") tidak dihapus dari sini
async function removeImage(name) {
  if (!name || String(name).startsWith('/')) return;
  try {
    await fsp.unlink(path.join(UPLOAD_DIR, path.basename(name)));
  } catch {}
}

// Foto bawaan (/charms/...) dipakai apa adanya, foto upload lewat /api/uploads/
const imageUrl = (name) => (!name ? null : String(name).startsWith('/') ? name : `/api/uploads/${name}`);

module.exports = { upload, removeImage, imageUrl, UPLOAD_DIR };
