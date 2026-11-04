import { NextResponse } from 'next/server';

export async function POST() {
  const res = NextResponse.json({ message: 'Berhasil logout' });
  res.cookies.set('token', '', { path: '/', maxAge: 0 });
  return res;
}
