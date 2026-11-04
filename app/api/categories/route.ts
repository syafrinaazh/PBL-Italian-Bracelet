import { NextRequest, NextResponse } from 'next/server';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { db } from '@/lib/db';
import { getUser, unauthorized } from '@/lib/auth';

export async function GET(req: NextRequest) {
  if (!getUser(req)) return unauthorized();
  const [rows] = await db.query<RowDataPacket[]>('SELECT * FROM categories ORDER BY name');
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  if (!getUser(req)) return unauthorized();
  const body = await req.json().catch(() => null);
  const name = String(body?.name ?? '').trim();
  if (!name) return NextResponse.json({ message: 'Nama kategori wajib diisi' }, { status: 400 });

  try {
    const [r] = await db.query<ResultSetHeader>('INSERT INTO categories (name) VALUES (?)', [name]);
    return NextResponse.json({ id: r.insertId, name }, { status: 201 });
  } catch (e) {
    if ((e as { code?: string }).code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ message: 'Kategori sudah ada' }, { status: 409 });
    }
    throw e;
  }
}
