"use client";

import { useState } from "react";

type Item = { id: number; file: File; url: string; nama: string; selected: boolean };

export type BulkItem = { file: File; nama: string; harga: number; stok: number };

type Props = {
  onSave: (items: BulkItem[]) => Promise<void> | void;
};

// Potong 1 sel dari foto besar, perbesar kalau kecil
function cropCell(img: HTMLImageElement, sx: number, sy: number, sw: number, sh: number) {
  const scale = Math.max(1, Math.ceil(400 / Math.max(sw, sh)));
  const c = document.createElement("canvas");
  c.width = Math.round(sw * scale);
  c.height = Math.round(sh * scale);
  const ctx = c.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, c.width, c.height);
  return new Promise<Blob>((res) => c.toBlob((b) => res(b!), "image/png"));
}

// Taruh hasil (PNG transparan) di background putih, crop rapat ke objek
async function toWhiteBg(cutout: Blob, trim: boolean) {
  const bmp = await createImageBitmap(cutout);
  const src = document.createElement("canvas");
  src.width = bmp.width;
  src.height = bmp.height;
  const sctx = src.getContext("2d", { willReadFrequently: true })!;
  sctx.drawImage(bmp, 0, 0);

  let x0 = 0, y0 = 0, x1 = src.width, y1 = src.height;
  if (trim) {
    const { data } = sctx.getImageData(0, 0, src.width, src.height);
    let minX = src.width, minY = src.height, maxX = -1, maxY = -1;
    for (let y = 0; y < src.height; y++) {
      for (let x = 0; x < src.width; x++) {
        if (data[(y * src.width + x) * 4 + 3] > 30) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (maxX > minX && maxY > minY) {
      const mg = Math.round(Math.max(maxX - minX, maxY - minY) * 0.08);
      x0 = Math.max(0, minX - mg);
      y0 = Math.max(0, minY - mg);
      x1 = Math.min(src.width, maxX + mg);
      y1 = Math.min(src.height, maxY + mg);
    }
  }

  const out = document.createElement("canvas");
  out.width = x1 - x0;
  out.height = y1 - y0;
  const octx = out.getContext("2d")!;
  octx.fillStyle = "#ffffff";
  octx.fillRect(0, 0, out.width, out.height);
  octx.drawImage(src, x0, y0, out.width, out.height, 0, 0, out.width, out.height);
  return new Promise<Blob>((res) => out.toBlob((b) => res(b!), "image/jpeg", 0.92));
}

export default function MultiCharmSplitter({ onSave }: Props) {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [rows, setRows] = useState(5);
  const [cols, setCols] = useState(5);
  const [removeBg, setRemoveBg] = useState(true);
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
    i.onload = () => setImg(i);
    i.src = url;
    setImgUrl(url);
    setItems([]);
    setError("");
  };

  const handleSplit = async () => {
    if (!img) return;
    setBusy(true);
    setError("");
    setItems([]);

    try {
      const remover = removeBg
        ? (await import("@imgly/background-removal")).removeBackground
        : null;

      const cw = img.naturalWidth / cols;
      const ch = img.naturalHeight / rows;
      const total = rows * cols;
      const result: Item[] = [];

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const n = r * cols + c + 1;
          setProgress(`Memproses charm ${n} dari ${total}...`);

          const cell = await cropCell(img, c * cw, r * ch, cw, ch);
          const cutout = remover ? await remover(cell) : cell;
          const finalBlob = await toWhiteBg(cutout, !!remover);
          const file = new File([finalBlob], `charm-${String(n).padStart(2, "0")}.jpg`, {
            type: "image/jpeg",
          });

          result.push({
            id: n,
            file,
            url: URL.createObjectURL(finalBlob),
            nama: `Charm ${n}`,
            selected: true,
          });
          setItems([...result]);
        }
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
            <img src={imgUrl} alt="Foto" className="max-h-80 rounded-lg" />
            {Array.from({ length: cols - 1 }, (_, i) => (
              <div
                key={`v${i}`}
                className="absolute top-0 h-full border-l border-dashed border-red-500"
                style={{ left: `${((i + 1) / cols) * 100}%` }}
              />
            ))}
            {Array.from({ length: rows - 1 }, (_, i) => (
              <div
                key={`h${i}`}
                className="absolute left-0 w-full border-t border-dashed border-red-500"
                style={{ top: `${((i + 1) / rows) * 100}%` }}
              />
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm">
            <label>
              Baris{" "}
              <input type="number" min={1} max={10} value={rows}
                onChange={(e) => setRows(Math.max(1, +e.target.value))}
                className="w-16 rounded border px-2 py-1" />
            </label>
            <label>
              Kolom{" "}
              <input type="number" min={1} max={10} value={cols}
                onChange={(e) => setCols(Math.max(1, +e.target.value))}
                className="w-16 rounded border px-2 py-1" />
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={removeBg} onChange={(e) => setRemoveBg(e.target.checked)} />
              Hapus background
            </label>
            <button type="button" onClick={handleSplit} disabled={busy}
              className="rounded-lg bg-[#4a2c2a] px-4 py-2 text-white disabled:opacity-50">
              {busy ? "Memproses..." : "✨ Pisahkan charm"}
            </button>
          </div>
          <p className="text-xs text-gray-500">
            Garis merah putus-putus adalah batas potongan. Sesuaikan baris dan kolom sampai
            tiap kotak berisi tepat satu charm.
          </p>
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