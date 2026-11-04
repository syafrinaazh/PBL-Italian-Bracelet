import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

export type AuthUser = { id: number; email: string };

function secret() {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error('JWT_SECRET belum diisi di .env.local');
  return s;
}

export function signToken(user: AuthUser) {
  return jwt.sign(user, secret(), { expiresIn: '1d' });
}

// Baca token dari cookie "token" (atau header Authorization: Bearer ...)
export function getUser(req: NextRequest): AuthUser | null {
  const header = req.headers.get('authorization');
  const token =
    req.cookies.get('token')?.value ??
    (header?.startsWith('Bearer ') ? header.slice(7) : null);
  if (!token) return null;
  try {
    const p = jwt.verify(token, secret()) as AuthUser;
    return { id: p.id, email: p.email };
  } catch {
    return null;
  }
}

export const unauthorized = () =>
  NextResponse.json({ message: 'Belum login atau sesi habis' }, { status: 401 });

export const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: 60 * 60 * 24, // 1 hari
};
