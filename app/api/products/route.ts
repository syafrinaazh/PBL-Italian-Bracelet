import { NextRequest, NextResponse } from 'next/server';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { db } from '@/lib/db';
import { getUser, unauthorized } from '@/lib/auth';
import { imageUrl, saveImage, validateImage } from '@/lib/upload';

const bad = (message: string) => NextResponse.json({ message }, { status: 400 });

// GET /api/products?search=&category_id=&page=1&limit=10
export async function GET(req: NextRequest) {
  if (!getUser(req)) return unauthorized();

  const sp = req.nextUrl.searchParams;
  const page = Math.max(parseInt(sp.get('page') ?? '1') || 1, 1);
  const limit = Math.min(Math.max(parseInt(sp.get('limit') ?? '10') || 10, 1), 100);

  const where: string[] = [];
  const params: (string | number)[] = [];
  if (sp.get('search')) {
    where.push('p.name LIKE ?');
    params.push(`%${sp.get('search')}%`);
  }
  if (sp.get('category_id')) {
    where.push('p.category_id = ?');
    params.push(Number(sp.get('category_id')));
  }
  const whereSql = where.length ? 'WHERE ' + where.join(' AND ') : '';

  const [[{ total }]] = await db.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS total FROM products p ${whereSql}`,
    params
  );
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT p.*, c.name AS category_name
     FROM products p LEFT JOIN categories c ON c.id = p.category_id
     ${whereSql} ORDER BY p.id DESC LIMIT ? OFFSET ?`,
    [...params, limit, (page - 1) * limit]
  );

  return NextResponse.json({
    data: rows.map((p) => ({ ...p, image_url: imageUrl(p.image) })),
    page,
    limit,
    total,
  });
}

// POST /api/products  (form-data: name, description, price, stock, category_id, image)
export async function POST(req: NextRequest) {
  if (!getUser(req)) return unauthorized();

  const form = await req.formData();
  const name = String(form.get('name') ?? '').trim();
  const description = String(form.get('description') ?? '');
  const price = Number(form.get('price') || 0);
  const stock = Number(form.get('stock') || 0);
  const categoryId = form.get('category_id') ? Number(form.get('category_id')) : null;

  if (!name) return bad('Nama produk wajib diisi');
  if (Number.isNaN(price) || price < 0) return bad('Harga tidak valid');
  if (!Number.isInteger(stock) || stock < 0) return bad('Stok tidak valid');

  let image: string | null = null;
  const file = form.get('image');
  if (file instanceof File && file.size > 0) {
    const err = validateImage(file);
    if (err) return bad(err);
    image = await saveImage(file);
  }

  const [r] = await db.query<ResultSetHeader>(
    'INSERT INTO products (name, description, price, stock, category_id, image) VALUES (?,?,?,?,?,?)',
    [name, description, price, stock, categoryId, image]
  );
  const [rows] = await db.query<RowDataPacket[]>('SELECT * FROM products WHERE id = ?', [r.insertId]);
  return NextResponse.json({ ...rows[0], image_url: imageUrl(rows[0].image) }, { status: 201 });
}
