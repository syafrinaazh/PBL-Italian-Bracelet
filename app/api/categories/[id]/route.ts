import { NextRequest, NextResponse } from 'next/server';
import type { ResultSetHeader } from 'mysql2';
import { db } from '@/lib/db';
import { getUser, unauthorized } from '@/lib/auth';

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Ctx) {
  if (!getUser(req)) return unauthorized();
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const name = String(body?.name ?? '').trim();
  if (!name) return NextResponse.json({ message: 'Nama kategori wajib diisi' }, { status: 400 });

  const [r] = await db.query<ResultSetHeader>('UPDATE categories SET name = ? WHERE id = ?', [name, id]);
  if (!r.affectedRows) return NextResponse.json({ message: 'Kategori tidak ditemukan' }, { status: 404 });
  return NextResponse.json({ id: Number(id), name });
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  if (!getUser(req)) return unauthorized();
  const { id } = await params;
  const [r] = await db.query<ResultSetHeader>('DELETE FROM categories WHERE id = ?', [id]);
  if (!r.affectedRows) return NextResponse.json({ message: 'Kategori tidak ditemukan' }, { status: 404 });
  return NextResponse.json({ message: 'Kategori dihapus' });
}
