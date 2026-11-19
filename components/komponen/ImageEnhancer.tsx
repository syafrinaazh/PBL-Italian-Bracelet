"use client";

import { useId, useState } from "react";

type Props = {
  onChange: (file: File | null) => void; // file final yang dikirim ke form
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE = 10 * 1024 * 1024; // batas foto yang dipilih
const MAX_OUTPUT_SIZE = 2 * 1024 * 1024; // batas hasil akhir (batas backend)
const MAX_INPUT = 1600; // sisi terpanjang foto yang dikirim ke server
const MAX_OUTPUT = 1000; // sisi maksimal hasil akhir (px)
const MIN_OUTPUT = 400; // sisi minimal hasil akhir (px)
const MAX_UPSCALE = 3; // charm tidak diperbesar lebih dari ini (lebih dari itu cuma makin soft)
const PADDING = 1.1; // jarak tipis di sekeliling charm
const ALPHA_CUTOFF = 40; // piksel lebih transparan dari ini dibuang (membersihkan bayangan tipis)
const BLUR_THRESHOLD = 100; // di bawah ini dianggap buram (perkiraan, sesuaikan)
const SHARPEN_AMOUNT = 0.6; // 0 = tanpa pertajam, maksimal wajar 0.8
const CARD_BG = "#f7e9e6"; // warna latar kartu, hanya untuk pratinjau

// ---------------------------------------------------------------------------
// Ukur ketajaman foto (makin kecil = makin buram)
// ---------------------------------------------------------------------------
async function measureSharpness(file: File): Promise<number> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, 512 / Math.max(bmp.width, bmp.height));
  const w = Math.round(bmp.width * scale);
  const h = Math.round(bmp.height * scale);
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  if (!ctx) return 999;
  ctx.drawImage(bmp, 0, 0, w, h);
  bmp.close();

  const d = ctx.getImageData(0, 0, w, h).data;
  const gray = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    gray[i] = 0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2];
  }

  // variansi Laplacian
  let sum = 0, sumSq = 0, n = 0;
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      const lap = 4 * gray[i] - gray[i - 1] - gray[i + 1] - gray[i - w] - gray[i + w];
      sum += lap;
      sumSq += lap * lap;
      n++;
    }
  }
  const mean = sum / n;
  return sumSq / n - mean * mean;
}

// ---------------------------------------------------------------------------
// Perkecil foto sebelum dikirim ke server (JPEG supaya ringan)
// ---------------------------------------------------------------------------
async function resizeInput(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_INPUT / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas tidak tersedia");
  ctx.fillStyle = "#ffffff"; // PNG transparan jangan jadi hitam
  ctx.fillRect(0, 0, w, h);
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Gagal memperkecil gambar"))),
      "image/jpeg",
      0.92
    );
  });
}

// ---------------------------------------------------------------------------
// Kirim ke backend, terima PNG transparan (background sudah dihapus)
// ---------------------------------------------------------------------------
async function enhanceOnServer(input: Blob): Promise<Blob> {
  const fd = new FormData();
  fd.append("file", input, "foto.jpg");

  const res = await fetch(`${API_URL}/api/enhance`, {
    method: "POST",
    body: fd,
    credentials: "include",
  });

  if (!res.ok) {
    let msg = "Gagal memproses foto di server";
    try {
      const data = await res.json();
      if (data?.message) msg = data.message;
    } catch {}
    throw new Error(msg);
  }
  return await res.blob();
}

// ---------------------------------------------------------------------------
// Operasi mask (erosi, dilasi, komponen terbesar)
// ---------------------------------------------------------------------------
function erodeOnce(m: Uint8Array, w: number, h: number): Uint8Array {
  const o = new Uint8Array(w * h);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const p = y * w + x;
      if (m[p] && m[p - 1] && m[p + 1] && m[p - w] && m[p + w]) o[p] = 1;
    }
  }
  return o;
}

function dilateOnce(m: Uint8Array, w: number, h: number): Uint8Array {
  const o = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = y * w + x;
      if (
        m[p] ||
        (x > 0 && m[p - 1]) ||
        (x < w - 1 && m[p + 1]) ||
        (y > 0 && m[p - w]) ||
        (y < h - 1 && m[p + w])
      ) {
        o[p] = 1;
      }
    }
  }
  return o;
}

// Ambil komponen terhubung terbesar (buang garis tipis, bintik, sisa potongan)
function largestComponent(m: Uint8Array, w: number, h: number): Uint8Array {
  const label = new Int32Array(w * h);
  let best = 0;
  let bestSize = 0;
  let cur = 0;
  const stack: number[] = [];
  for (let s = 0; s < w * h; s++) {
    if (!m[s] || label[s]) continue;
    cur++;
    let size = 0;
    stack.push(s);
    label[s] = cur;
    while (stack.length) {
      const p = stack.pop()!;
      size++;
      const x = p % w;
      const y = (p - x) / w;
      if (x > 0 && m[p - 1] && !label[p - 1]) { label[p - 1] = cur; stack.push(p - 1); }
      if (x < w - 1 && m[p + 1] && !label[p + 1]) { label[p + 1] = cur; stack.push(p + 1); }
      if (y > 0 && m[p - w] && !label[p - w]) { label[p - w] = cur; stack.push(p - w); }
      if (y < h - 1 && m[p + w] && !label[p + w]) { label[p + w] = cur; stack.push(p + w); }
    }
    if (size > bestSize) {
      bestSize = size;
      best = cur;
    }
  }
  const out = new Uint8Array(w * h);
  for (let p = 0; p < w * h; p++) if (label[p] === best) out[p] = 1;
  return out;
}

// Buang bayangan tipis, garis, dan bintik: sisakan hanya objek charm terbesar
function cleanMask(img: ImageData) {
  const { width: w, height: h, data: d } = img;

  const obj = new Uint8Array(w * h);
  for (let p = 0; p < w * h; p++) obj[p] = d[p * 4 + 3] > ALPHA_CUTOFF ? 1 : 0;

  // erosi 2x -> objek terbesar -> dilasi balik 2x (garis tipis hilang)
  let er: Uint8Array = obj;
  for (let i = 0; i < 2; i++) er = erodeOnce(er, w, h);
  let main: Uint8Array = largestComponent(er, w, h);
  for (let i = 0; i < 2; i++) main = dilateOnce(main, w, h);

  for (let p = 0; p < w * h; p++) {
    if (!main[p] || !obj[p]) d[p * 4 + 3] = 0;
  }
}

// ---------------------------------------------------------------------------
// Ubah ukuran bertahap (maksimal 2x per langkah) supaya tidak soft/bergerigi
// ---------------------------------------------------------------------------
function resizeStaged(src: HTMLCanvasElement, dw: number, dh: number): HTMLCanvasElement {
  let cur = src;
  const step = (nw: number, nh: number) => {
    const next = document.createElement("canvas");
    next.width = Math.max(1, nw);
    next.height = Math.max(1, nh);
    const nx = next.getContext("2d")!;
    nx.imageSmoothingEnabled = true;
    nx.imageSmoothingQuality = "high";
    nx.drawImage(cur, 0, 0, next.width, next.height);
    cur = next;
  };
  while (cur.width * 2 <= dw) step(cur.width * 2, cur.height * 2);
  while (cur.width / 2 >= dw) step(Math.round(cur.width / 2), Math.round(cur.height / 2));
  if (cur.width !== dw || cur.height !== dh) step(dw, dh);
  return cur;
}

// Pertajam ringan. Piksel di tepi transparan dilewati supaya tidak muncul halo gelap.
function sharpenCanvas(canvas: HTMLCanvasElement, amount: number) {
  if (amount <= 0) return;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return;
  const { width: w, height: h } = canvas;
  const src = ctx.getImageData(0, 0, w, h);
  const out = ctx.createImageData(w, h);
  const s = src.data;
  const o = out.data;
  o.set(s);

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = (y * w + x) * 4;
      const up = i - w * 4, down = i + w * 4, left = i - 4, right = i + 4;
      if (
        s[i + 3] < 255 || s[up + 3] < 255 || s[down + 3] < 255 ||
        s[left + 3] < 255 || s[right + 3] < 255
      ) continue;
      for (let c = 0; c < 3; c++) {
        const sharp = 5 * s[i + c] - s[up + c] - s[down + c] - s[left + c] - s[right + c];
        const v = s[i + c] * (1 - amount) + sharp * amount;
        o[i + c] = v < 0 ? 0 : v > 255 ? 255 : v;
      }
    }
  }
  ctx.putImageData(out, 0, 0);
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Gagal membuat gambar akhir"))),
      type,
      quality
    );
  });
}

// ---------------------------------------------------------------------------
// Potong rapat di charm, taruh PRESISI DI TENGAH kanvas persegi transparan
// ---------------------------------------------------------------------------
async function trimAndFit(
  srcCanvas: HTMLCanvasElement,
  data: ImageData
): Promise<{ blob: Blob; ext: string; type: string }> {
  const { width: w, height: h } = data;
  const d = data.data;

  let minX = w, minY = h, maxX = -1, maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (d[(y * w + x) * 4 + 3] > 0) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) throw new Error("Charm tidak terdeteksi di foto");

  const cw = maxX - minX + 1;
  const ch = maxY - minY + 1;

  // Ukuran kanvas mengikuti resolusi charm: tidak diperbesar lebih dari MAX_UPSCALE
  const longest = Math.max(cw, ch) * PADDING;
  const outSize = Math.round(Math.min(MAX_OUTPUT, Math.max(MIN_OUTPUT, longest * MAX_UPSCALE)));
  const scale = outSize / longest;
  const dw = Math.max(1, Math.round(cw * scale));
  const dh = Math.max(1, Math.round(ch * scale));

  // Crop pas ke charm
  const cropped = document.createElement("canvas");
  cropped.width = cw;
  cropped.height = ch;
  cropped.getContext("2d")!.drawImage(srcCanvas, minX, minY, cw, ch, 0, 0, cw, ch);

  const resized = resizeStaged(cropped, dw, dh);

  const out = document.createElement("canvas");
  out.width = outSize;
  out.height = outSize;
  const octx = out.getContext("2d", { willReadFrequently: true });
  if (!octx) throw new Error("Canvas tidak tersedia");
  // tidak ada fillRect: latar tetap transparan
  octx.drawImage(resized, Math.round((outSize - dw) / 2), Math.round((outSize - dh) / 2));

  sharpenCanvas(out, SHARPEN_AMOUNT);

  // PNG dulu; kalau melebihi batas, pakai WebP (tetap transparan, ukuran lebih kecil)
  const png = await canvasToBlob(out, "image/png");
  if (png.size <= MAX_OUTPUT_SIZE) return { blob: png, ext: "png", type: "image/png" };
  const webp = await canvasToBlob(out, "image/webp", 0.92);
  return { blob: webp, ext: "webp", type: "image/webp" };
}

// Gambar blob ke canvas di resolusi aslinya
async function blobToCanvas(blob: Blob): Promise<{ canvas: HTMLCanvasElement; data: ImageData }> {
  const bmp = await createImageBitmap(blob);
  const canvas = document.createElement("canvas");
  canvas.width = bmp.width;
  canvas.height = bmp.height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas tidak tersedia");
  ctx.drawImage(bmp, 0, 0);
  bmp.close();
  return { canvas, data: ctx.getImageData(0, 0, canvas.width, canvas.height) };
}

// ---------------------------------------------------------------------------
// Komponen
// ---------------------------------------------------------------------------
export default function ImageEnhancer({ onChange }: Props) {
  const inputId = useId();
  const [original, setOriginal] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [enhancedFile, setEnhancedFile] = useState<File | null>(null);
  const [enhancedUrl, setEnhancedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");

  const resetAll = () => {
    setOriginal(null);
    setOriginalUrl(null);
    setEnhancedFile(null);
    setEnhancedUrl(null);
    onChange(null);
  };

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setError("");
    setWarning("");
    setEnhancedFile(null);
    setEnhancedUrl(null);

    if (!file) {
      resetAll();
      return;
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Foto harus berformat JPG, PNG, atau WEBP.");
      resetAll();
      return;
    }
    if (file.size > MAX_FILE) {
      setError("Ukuran foto maksimal 10 MB.");
      resetAll();
      return;
    }

    setOriginal(file);
    setOriginalUrl(URL.createObjectURL(file));

    // foto asli hanya boleh langsung dikirim kalau masih di bawah batas backend
    if (file.size <= MAX_OUTPUT_SIZE) {
      onChange(file);
    } else {
      onChange(null);
      setWarning("Foto lebih dari 2 MB. Klik “Hapus background” dulu supaya ukurannya diperkecil.");
    }

    measureSharpness(file)
      .then((score) => {
        if (score < BLUR_THRESHOLD) {
          setWarning(
            "Foto ini terlihat buram. Hasilnya akan kurang jelas, sebaiknya foto ulang dengan cahaya terang dan fokus."
          );
        }
      })
      .catch(() => {});
  };

  const handleEnhance = async () => {
    if (!original) return;
    setLoading(true);
    setError("");

    try {
      const input = await resizeInput(original);
      const cutout = await enhanceOnServer(input); // PNG transparan dari server

      // Rapikan lagi di browser: buang noise, crop pas ke charm,
      // taruh presisi di tengah, perbesar bertahap, pertajam.
      const { canvas, data } = await blobToCanvas(cutout);
      cleanMask(data);
      canvas.getContext("2d")!.putImageData(data, 0, 0);
      const result = await trimAndFit(canvas, data);

      if (result.blob.size > MAX_OUTPUT_SIZE) {
        setError("Hasil foto melebihi 2 MB. Coba foto lain.");
        return;
      }

      const baseName = original.name.replace(/\.[^.]+$/, "") || "charm";
      const file = new File([result.blob], `${baseName}.${result.ext}`, { type: result.type });
      setEnhancedFile(file);
      setEnhancedUrl(URL.createObjectURL(file));
      onChange(file); // otomatis pakai hasil AI
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error && err.message
          ? err.message
          : "Gagal memproses foto. Pastikan server backend menyala."
      );
    } finally {
      setLoading(false);
    }
  };

  const useOriginal = () => {
    if (original && original.size > MAX_OUTPUT_SIZE) {
      setError("Foto asli melebihi 2 MB, tidak bisa dipakai. Pakai hasil AI.");
      return;
    }
    setError("");
    onChange(original);
  };
  const useEnhanced = () => {
    setError("");
    onChange(enhancedFile);
  };

  return (
    <div className="space-y-3">
      <label
        htmlFor={inputId}
        className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-[#d9bdb7] bg-[#fbf3f1] px-4 py-6 text-center transition hover:border-[#4a2c2a] hover:bg-[#f7e9e6]"
      >
        <span className="text-sm font-medium text-[#4a2c2a]">
          {original ? "Ganti foto" : "Pilih foto"}
        </span>
        <span className="max-w-full truncate text-xs text-gray-500">
          {original ? original.name : "JPG, PNG, atau WEBP · maks. 10 MB"}
        </span>
      </label>
      <input
        id={inputId}
        type="file"
        className="sr-only"
        accept="image/jpeg,image/png,image/webp"
        capture="environment" // di HP langsung membuka kamera belakang; di desktop diabaikan
        onChange={handleSelect}
      />

      {originalUrl && !enhancedUrl && (
        <div className="space-y-2">
          <img src={originalUrl} alt="Foto asli" className="h-40 rounded-lg object-contain" />
          <button
            type="button"
            onClick={handleEnhance}
            disabled={loading}
            className="rounded-lg bg-[#4a2c2a] px-4 py-2 text-white disabled:opacity-50"
          >
            {loading ? "Memproses..." : "✨ Hapus background"}
          </button>
          {loading && (
            <p className="text-xs text-gray-500">
              Foto sedang dirapikan di server. Proses pertama bisa memakan waktu agak lama.
            </p>
          )}
        </div>
      )}

      {enhancedUrl && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="mb-1 text-sm text-gray-500">Asli</p>
              <img src={originalUrl!} alt="Asli" className="h-40 w-full rounded-lg object-contain" />
            </div>
            <div>
              <p className="mb-1 text-sm text-gray-500">Hasil AI</p>
              <div
                className="flex h-40 w-full items-center justify-center rounded-lg border"
                style={{ background: CARD_BG }}
              >
                <img src={enhancedUrl} alt="Hasil" className="h-[85%] w-auto object-contain" />
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={useEnhanced} className="rounded-lg bg-[#4a2c2a] px-3 py-1.5 text-sm text-white">
              Pakai hasil AI
            </button>
            <button type="button" onClick={useOriginal} className="rounded-lg border px-3 py-1.5 text-sm">
              Pakai foto asli
            </button>
          </div>
        </div>
      )}

      {warning && <p className="text-sm text-amber-600">{warning}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}