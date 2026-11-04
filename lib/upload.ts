import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

// Gambar disimpan di folder "uploads" di root project (di luar public)
export const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};
export const MIME_BY_EXT: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};
const MAX_SIZE = 2 * 1024 * 1024; // 2 MB

// Mengembalikan pesan error, atau null kalau file valid
export function validateImage(file: File): string | null {
  if (!EXT_BY_MIME[file.type]) return 'Hanya file JPG, PNG, atau WEBP yang diperbolehkan';
  if (file.size > MAX_SIZE) return 'Ukuran gambar maksimal 2 MB';
  return null;
}

export async function saveImage(file: File): Promise<string> {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const name = crypto.randomUUID().replace(/-/g, '') + EXT_BY_MIME[file.type];
  await fs.writeFile(path.join(UPLOAD_DIR, name), Buffer.from(await file.arrayBuffer()));
  return name;
}

export async function removeImage(name?: string | null) {
  if (!name) return;
  try {
    await fs.unlink(path.join(UPLOAD_DIR, path.basename(name)));
  } catch {}
}

export const imageUrl = (name?: string | null) => (name ? `/api/uploads/${name}` : null);
