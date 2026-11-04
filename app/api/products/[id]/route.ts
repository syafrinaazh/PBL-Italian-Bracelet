import { NextRequest, NextResponse } from 'next/server';
import type { RowDataPacket } from 'mysql2';
import { db } from '@/lib/db';
import { getUser, unauthorized } from '@/lib/auth';
import { imageUrl, removeImage, saveImage, validateImage } from '@/lib/upload';

type Ctx = { params: Promise<{ id: string }> };

const bad = (message: string) => NextResponse.json({ message }, { status: 400 });
const notFound = () => NextResponse.json({ message: 'Produk tidak ditemukan' }, { status: 404 });

export async function GET(req: NextRequest, { params }: Ctx) {
  if (!getUser(req)) return unauthorized();
  const { id } = await params;
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT p.*, c.name AS category_name
     FROM products p LEFT JOIN categories c ON c.id = p.category_id WHERE p.id = ?`,
    [id]
  );
  if (!rows[0]) return notFound();
  return NextResponse.json({ ...rows[0], image_url: imageUrl(rows[0].image) });
}

// PUT: semua field opsional; kalau kirim "image", gambar lama diganti
export async function PUT(req: NextRequest, { params }: Ctx) {
  if (!getUser(req)) return unauthorized();
  const { id } = await params;

  const [found] = await db.query<RowDataPacket[]>('SELECT * FROM products WHERE id = ?', [id]);
  const old = found[0];
  if (!old) return notFound();

  const form = await req.formData();
  const name = String(form.get('name') ?? '').trim() || old.name;
  const description = form.has('description') ? String(form.get('description')) : old.description;
  const price = form.has('price') ? Number(form.get('price')) : Number(old.price);
  const stock = form.has('stock') ? Number(form.get('stock')) : old.stock;
  const categoryId = form.has('category_id')
    ? form.get('category_id') ? Number(form.get('category_id')) : null
    : old.category_id;

  if (Number.isNaN(price) || price < 0) return bad('Harga tidak valid');
  if (!Number.isInteger(stock) || stock < 0) return bad('Stok tidak valid');

  let image: string | null = old.image;
  const file = form.get('image');
  if (file instanceof File && file.size > 0) {
    const err = validateImage(file);
    if (err) return bad(err);
    image = await saveImage(file);
  }

  await db.query(
    'UPDATE products SET name=?, description=?, price=?, stock=?, category_id=?, image=? WHERE id=?',
    [name, description, price, stock, categoryId, image, id]
  );
  if (image !== old.image) await removeImage(old.image);

  const [updated] = await db.query<RowDataPacket[]>('SELECT * FROM products WHERE id = ?', [id]);
  return NextResponse.json({ ...updated[0], image_url: imageUrl(updated[0].image) });
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  if (!getUser(req)) return unauthorized();
  const { id } = await params;

  const [rows] = await db.query<RowDataPacket[]>('SELECT image FROM products WHERE id = ?', [id]);
  if (!rows[0]) return notFound();

  await db.query('DELETE FROM products WHERE id = ?', [id]);
  await removeImage(rows[0].image);
  return NextResponse.json({ message: 'Produk dihapus' });
}
