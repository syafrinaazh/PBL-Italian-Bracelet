import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { MIME_BY_EXT, UPLOAD_DIR } from '@/lib/upload';

// Menampilkan gambar yang diunggah: /api/uploads/namafile.jpg
export async function GET(_req: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const safe = path.basename(name); // cegah akses folder lain
  const type = MIME_BY_EXT[path.extname(safe).toLowerCase()];
  if (!type) return NextResponse.json({ message: 'Tidak ditemukan' }, { status: 404 });

  try {
    const data = await fs.readFile(path.join(UPLOAD_DIR, safe));
    return new NextResponse(new Uint8Array(data), {
      headers: { 'Content-Type': type, 'Cache-Control': 'public, max-age=31536000, immutable' },
    });
  } catch {
    return NextResponse.json({ message: 'Tidak ditemukan' }, { status: 404 });
  }
}
