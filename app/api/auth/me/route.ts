import { NextRequest, NextResponse } from 'next/server';
import type { RowDataPacket } from 'mysql2';
import { db } from '@/lib/db';
import { getUser, unauthorized } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = getUser(req);
  if (!auth) return unauthorized();

  const [rows] = await db.query<RowDataPacket[]>(
    'SELECT id, name, email FROM users WHERE id = ?',
    [auth.id]
  );
  if (!rows[0]) return NextResponse.json({ message: 'User tidak ditemukan' }, { status: 404 });
  return NextResponse.json(rows[0]);
}
