"use client";

import { useState } from "react";
import { autoDetectCharms, detectCharms, Box } from "../../lib/detectCharms";

type Item = { id: number; file: File; url: string; nama: string; selected: boolean };

export type BulkItem = { file: File; nama: string; harga: number; stok: number };

type Props = {
  onSave: (items: BulkItem[]) => Promise<void> | void;
};

type Small = { data: Uint8ClampedArray; w: number; h: number; scale: number };

const SMALL_SIDE = 500; // ukuran gambar kecil untuk deteksi
const TARGET_SIDE = 512; // ukuran sisi terpanjang tiap potongan sebelum hapus background

function makeSmall(img: HTMLImageElement): Small {
  const scale = Math.min(1, SMALL_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.round(img.naturalWidth * scale);
  const h = Math.round(img.naturalHeight * scale);
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, w, h);
  return { data: ctx.getImageData(0, 0, w, h).data, w, h, scale };
}

// Cari bagian terbesar (charm utama) di hasil hapus background
function keepLargestPart(canvas: HTMLCanvasElement) {
  const w = canvas.width;
  const h = canvas.height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  const lab = new Int32Array(w * h);
  const stack = new Int32Array(w * h);
  let id = 0;
  let best = { id: 0, area: 0, x0: 0, y0: 0, x1: 0, y1: 0 };

  for (let i = 0; i < w * h; i++) {
    if (lab[i] || d[i * 4 + 3] <= 40) continue;
    id++;
    let sp = 0;
    stack[sp++] = i;
    lab[i] = id;
    let area = 0, x0 = w, y0 = h, x1 = 0, y1 = 0;
    while (sp) {
      const p = stack[--sp];
      const x = p % w;
      const y = (p / w) | 0;
      area++;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
      if (x > 0 && !lab[p - 1] && d[(p - 1) * 4 + 3] > 40) { lab[p - 1] = id; stack[sp++] = p - 1; }
      if (x < w - 1 && !lab[p + 1] && d[(p + 1) * 4 + 3] > 40) { lab[p + 1] = id; stack[sp++] = p + 1; }
      if (y > 0 && !lab[p - w] && d[(p - w) * 4 + 3] > 40) { lab[p - w] = id; stack[sp++] = p - w; }
      if (y < h - 1 && !lab[p + w] && d[(p + w) * 4 + 3] > 40) { lab[p + w] = id; stack[sp++] = p + w; }
    }
    if (area > best.area) best = { id, area, x0, y0, x1, y1 };
  }
  if (!best.area) return null;

  for (let i = 0; i < w * h; i++) if (lab[i] !== best.id) d[i * 4 + 3] = 0;
  ctx.putImageData(img, 0, 0);
  return best;
}

// Pertajam (unsharp mask sederhana)
function sharpen(canvas: HTMLCanvasElement, amount: number) {
  if (amount <= 0) return;
  const w = canvas.width;
  const h = canvas.height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  const img = ctx.getImageData(0, 0, w, h);
  const out = img.data;
  const src = new Uint8ClampedArray(out);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = (y * w + x) * 4;
      for (let j = 0; j < 3; j++) {
        let sum = 0;
        for (let dy = -1; dy <= 1; dy++)
          for (let dx = -1; dx <= 1; dx++) sum += src[((y + dy) * w + x + dx) * 4 + j];
        out[i + j] = src[i + j] + amount * 1.5 * (src[i + j] - sum / 9);
      }
    }
  }
  ctx.putImageData(img, 0, 0);
}

async function processWindow(
  img: HTMLImageElement,
  win: Box,
  scale: number,
  removeBg: boolean,
  sharp: number,
  remover: ((b: Blob) => Promise<Blob>) | null
): Promise<Blob> {
  // 1. potong jendela di sekitar charm dari foto asli
  const sx = win.x / scale, sy = win.y / scale, sw = win.w / scale, sh = win.h / scale;
  const k = Math.min(4, Math.max(0.5, TARGET_SIDE / Math.max(sw, sh)));
  const crop = document.createElement("canvas");
  crop.width = Math.round(sw * k);
  crop.height = Math.round(sh * k);
  const cctx = crop.getContext("2d")!;
  cctx.imageSmoothingQuality = "high";
  cctx.drawImage(img, sx, sy, sw, sh, 0, 0, crop.width, crop.height);

  let x0 = 0, y0 = 0, x1 = crop.width, y1 = crop.height;
  let source: HTMLCanvasElement = crop;

  // 2. hapus background lalu ambil bentuk charm yang presisi
  if (removeBg && remover) {
    const blob: Blob = await new Promise((res) => crop.toBlob((b) => res(b!), "image/png"));
    const cut = await remover(blob);
    const bmp = await createImageBitmap(cut);
    const cc = document.createElement("canvas");
    cc.width = bmp.width;
    cc.height = bmp.height;
    cc.getContext("2d")!.drawImage(bmp, 0, 0);
    const part = keepLargestPart(cc);
    if (part) {
      const mg = Math.round(Math.max(part.x1 - part.x0, part.y1 - part.y0) * 0.08);
      x0 = Math.max(0, part.x0 - mg);
      y0 = Math.max(0, part.y0 - mg);
      x1 = Math.min(cc.width, part.x1 + mg);
      y1 = Math.min(cc.height, part.y1 + mg);
      source = cc;
    }
  }

  // 3. taruh di background putih
  const out = document.createElement("canvas");
  out.width = x1 - x0;
  out.height = y1 - y0;
  const octx = out.getContext("2d", { willReadFrequently: true })!;
  octx.fillStyle = "#ffffff";
  octx.fillRect(0, 0, out.width, out.height);
  octx.drawImage(source, x0, y0, out.width, out.height, 0, 0, out.width, out.height);

  // 4. perjelas
  sharpen(out, sharp);
  return new Promise<Blob>((res) => out.toBlob((b) => res(b!), "image/jpeg", 0.92));
}

export default function SmartCharmSplitter({ onSave }: Props) {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [small, setSmall] = useState<Small | null>(null);
  const [windows, setWindows] = useState<Box[]>([]);
  const [sens, setSens] = useState(0.3);
  const [removeBg, setRemoveBg] = useState(true);
  const [sharp, setSharp] = useState(0.8);
  const [harga, setHarga] = useState(25000);
  const [stok, setStok] = useState(40);
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    const i = new Image();
    i.onload = () => {
      const s = makeSmall(i);
      const det = autoDetectCharms(s.data, s.w, s.h);
      setImg(i);
      setSmall(s);
      setWindows(det.windows);
      setSens(det.sensitivity);
    };
    i.src = url;
    setImgUrl(url);
    setItems([]);
    setProgress("");
    setError("");
  };

  const redetect = (value: number) => {
    setSens(value);
    if (!small) return;
    setWindows(detectCharms(small.data, small.w, small.h, value).windows);
  };

  const autoRedetect = () => {
    if (!small) return;
    const det = autoDetectCharms(small.data, small.w, small.h);
    setWindows(det.windows);
    setSens(det.sensitivity);
  };

  const handleProcess = async () => {
    if (!img || !small || windows.length === 0) return;
    setBusy(true);
    setError("");
    setItems([]);

    try {
      const remover = removeBg
        ? (b: Blob) =>
            import("@imgly/background-removal").then((m) =>
              m.removeBackground(b, { model: "isnet" })
            )
        : null;

      // urutkan dari atas ke bawah, kiri ke kanan
      const rowH = Math.min(...windows.map((w) => w.h)) * 0.5;
      const sorted = [...windows].sort((a, b) => {
        const ra = Math.round(a.y / rowH), rb = Math.round(b.y / rowH);
        return ra !== rb ? a.y - b.y : a.x - b.x;
      });

      const result: Item[] = [];
      for (let i = 0; i < sorted.length; i++) {
        setProgress(`Memproses charm ${i + 1} dari ${sorted.length}...`);
        const blob = await processWindow(img, sorted[i], small.scale, removeBg, sharp, remover);
        const n = i + 1;
        result.push({
          id: n,
          file: new File([blob], `charm-${String(n).padStart(2, "0")}.jpg`, { type: "image/jpeg" }),
          url: URL.createObjectURL(blob),
          nama: `Charm ${n}`,
          selected: true,
        });
        setItems([...result]);
      }
      setProgress("Selesai. Cek hasilnya, ubah nama, lalu simpan.");
    } catch (err) {
      console.error(err);
      setError("Gagal memproses foto. Cek console browser (F12) untuk detail.");
    } finally {
      setBusy(false);
    }
  };

  const update = (id: number, patch: Partial<Item>) =>
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));

  const selected = items.filter((i) => i.selected);

  const handleSaveAll = async () => {
    setBusy(true);
    try {
      await onSave(selected.map((i) => ({ file: i.file, nama: i.nama, harga, stok })));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <input type="file" accept="image/*" onChange={handleFile} />

      {imgUrl && (
        <>
          <div className="relative inline-block max-w-full">
            <img src={imgUrl} alt="Foto" className="max-h-96 rounded-lg" />
            {small &&
              windows.map((b, i) => (
                <div
                  key={i}
                  className="pointer-events-none absolute border border-red-500"
                  style={{
                    left: `${(b.x / small.w) * 100}%`,
                    top: `${(b.y / small.h) * 100}%`,
                    width: `${(b.w / small.w) * 100}%`,
                    height: `${(b.h / small.h) * 100}%`,
                  }}
                />
              ))}
          </div>

          <p className="text-sm text-gray-700">
            Terdeteksi <b>{windows.length}</b> charm (kotak merah). Pastikan tiap kotak berisi
            satu charm. Kalau kurang pas, geser sensitivitas atau klik Deteksi otomatis.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-sm">
            <label className="flex items-center gap-2">
              Sensitivitas
              <input type="range" min={0.15} max={0.5} step={0.05} value={sens}
                onChange={(e) => redetect(+e.target.value)} />
            </label>
            <button type="button" onClick={autoRedetect} className="rounded-lg border px-3 py-1.5">
              Deteksi otomatis
            </button>
            <label className="flex items-center gap-2">
              Ketajaman
              <input type="range" min={0} max={2} step={0.1} value={sharp}
                onChange={(e) => setSharp(+e.target.value)} />
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={removeBg} onChange={(e) => setRemoveBg(e.target.checked)} />
              Hapus background (AI)
            </label>
            <button type="button" onClick={handleProcess} disabled={busy || windows.length === 0}
              className="rounded-lg bg-[#4a2c2a] px-4 py-2 text-white disabled:opacity-50">
              {busy ? "Memproses..." : "✨ Pisahkan & perjelas"}
            </button>
          </div>
        </>
      )}

      {progress && <p className="text-sm text-gray-600">{progress}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {items.length > 0 && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {items.map((it) => (
              <div key={it.id} className="space-y-1 rounded-lg border p-2">
                <label className="flex items-center gap-2 text-xs">
                  <input type="checkbox" checked={it.selected}
                    onChange={(e) => update(it.id, { selected: e.target.checked })} />
                  Simpan
                </label>
                <img src={it.url} alt={it.nama} className="h-24 w-full rounded object-contain" />
                <input value={it.nama} onChange={(e) => update(it.id, { nama: e.target.value })}
                  className="w-full rounded border px-2 py-1 text-sm" />
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm">
            <label>
              Harga semua (Rp){" "}
              <input type="number" value={harga} onChange={(e) => setHarga(+e.target.value)}
                className="w-28 rounded border px-2 py-1" />
            </label>
            <label>
              Stok semua{" "}
              <input type="number" value={stok} onChange={(e) => setStok(+e.target.value)}
                className="w-20 rounded border px-2 py-1" />
            </label>
            <button type="button" onClick={handleSaveAll} disabled={busy || selected.length === 0}
              className="rounded-lg bg-[#4a2c2a] px-4 py-2 text-white disabled:opacity-50">
              Simpan {selected.length} komponen
            </button>
          </div>
        </>
      )}
    </div>
  );
}