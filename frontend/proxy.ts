import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

async function isLoggedIn(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  const secret = process.env.JWT_SECRET;
  if (!token || !secret) return false;
  try {
    await jwtVerify(token, new TextEncoder().encode(secret));
    return true;
  } catch {
    return false;
  }
}

export async function proxy(req: NextRequest) {
  const loggedIn = await isLoggedIn(req);

  // Sudah login tapi buka /login -> arahkan ke dashboard
  if (req.nextUrl.pathname.startsWith('/login')) {
    if (loggedIn) return NextResponse.redirect(new URL('/dashboard', req.url));
    return NextResponse.next();
  }

  // Belum login tapi buka halaman admin -> arahkan ke login
  if (!loggedIn) return NextResponse.redirect(new URL('/login', req.url));
  return NextResponse.next();
}

// Halaman yang dijaga. Kalau nanti ada halaman admin lain, tambahkan di sini.
export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};