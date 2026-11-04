import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import type { RowDataPacket } from 'mysql2';
import { db } from '@/lib/db';
import { signToken, COOKIE_OPTIONS } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = body?.email;
  const password = body?.password;

  if (!email || !password) {
    return NextResponse.json({ message: 'Email dan password wajib diisi' }, { status: 400 });
  }

  const [rows] = await db.query<RowDataPacket[]>('SELECT * FROM users WHERE email = ?', [email]);
  const user = rows[0];
  const ok = user && (await bcrypt.compare(password, user.password_hash));
  if (!ok) {
    return NextResponse.json({ message: 'Email atau password salah' }, { status: 401 });
  }

  const res = NextResponse.json({ user: { id: user.id, name: user.name, email: user.email } });
  res.cookies.set('token', signToken({ id: user.id, email: user.email }), COOKIE_OPTIONS);
  return res;
}
