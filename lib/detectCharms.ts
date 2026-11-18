// Mendeteksi posisi charm pada foto yang berisi banyak charm.
// Murni JavaScript (tanpa library), dijalankan di browser pada gambar yang sudah dikecilkan.

export type Box = { x: number; y: number; w: number; h: number };

export type Detection = {
  windows: Box[]; // jendela di sekitar tiap charm (koordinat gambar kecil)
  cols: number;
  rows: number;
};

function boxBlur(src: Float32Array, w: number, h: number, r: number): Float32Array {
  const tmp = new Float32Array(w * h);
  const out = new Float32Array(w * h);
  const k = 2 * r + 1;
  for (let y = 0; y < h; y++) {
    let sum = 0;
    for (let x = -r; x <= r; x++) sum += src[y * w + Math.min(w - 1, Math.max(0, x))];
    for (let x = 0; x < w; x++) {
      tmp[y * w + x] = sum / k;
      sum += src[y * w + Math.min(w - 1, x + r + 1)] - src[y * w + Math.max(0, x - r)];
    }
  }
  for (let x = 0; x < w; x++) {
    let sum = 0;
    for (let y = -r; y <= r; y++) sum += tmp[Math.min(h - 1, Math.max(0, y)) * w + x];
    for (let y = 0; y < h; y++) {
      out[y * w + x] = sum / k;
      sum += tmp[Math.min(h - 1, y + r + 1) * w + x] - tmp[Math.max(0, y - r) * w + x];
    }
  }
  return out;
}

function percentile(arr: ArrayLike<number>, p: number): number {
  const a = Array.from(arr).sort((m, n) => m - n);
  return a[Math.min(a.length - 1, Math.floor((p / 100) * a.length))];
}

function findBands(profile: Float32Array, rel: number, minLen: number): [number, number][] {
  const n = profile.length;
  const sm = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    let s = 0;
    for (let j = -3; j <= 3; j++) s += profile[Math.min(n - 1, Math.max(0, i + j))];
    sm[i] = s / 7;
  }
  const lo = percentile(sm, 10);
  const hi = percentile(sm, 90);
  const thr = lo + rel * (hi - lo);
  const bands: [number, number][] = [];
  let start = -1;
  for (let i = 0; i <= n; i++) {
    const on = i < n && sm[i] > thr;
    if (on && start < 0) start = i;
    if (!on && start >= 0) {
      if (i - start >= minLen) bands.push([start, i]);
      start = -1;
    }
  }
  return bands;
}

function median(a: number[]): number {
  const s = [...a].sort((x, y) => x - y);
  return s.length ? s[Math.floor(s.length / 2)] : 0;
}

/**
 * rgba: piksel gambar kecil (sisi terpanjang sekitar 500px), w x h.
 * sensitivity: 0.2 (batas lebih longgar) sampai 0.6 (lebih ketat). Bawaan 0.4.
 */
export function detectCharms(
  rgba: Uint8ClampedArray | Uint8Array,
  w: number,
  h: number,
  sensitivity = 0.4
): Detection {
  const g = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    g[i] = 0.299 * rgba[i * 4] + 0.587 * rgba[i * 4 + 1] + 0.114 * rgba[i * 4 + 2];
  }
  const g2 = new Float32Array(w * h);
  for (let i = 0; i < g.length; i++) g2[i] = g[i] * g[i];
  const mu = boxBlur(g, w, h, 4);
  const mu2 = boxBlur(g2, w, h, 4);
  const sd = new Float32Array(w * h);
  for (let i = 0; i < sd.length; i++) sd[i] = Math.sqrt(Math.max(mu2[i] - mu[i] * mu[i], 0));
  const base = percentile(sd, 50);
  for (let i = 0; i < sd.length; i++) sd[i] = Math.max(0, sd[i] - base);

  const colP = new Float32Array(w);
  const rowP = new Float32Array(h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const v = sd[y * w + x];
      colP[x] += v;
      rowP[y] += v;
    }
  }

  const minLen = Math.round(0.05 * Math.max(w, h));
  const dropThin = (b: [number, number][]) => {
    const m = median(b.map(([x, y]) => y - x));
    return b.filter(([x, y]) => y - x >= 0.6 * m);
  };
  const cb = dropThin(findBands(colP, sensitivity, minLen));
  const rb = dropThin(findBands(rowP, sensitivity, minLen));
  if (!cb.length || !rb.length) return { windows: [], cols: 0, rows: 0 };

  const cx = cb.map(([a, b]) => (a + b) / 2);
  const cy = rb.map(([a, b]) => (a + b) / 2);
  const gaps = (c: number[]) => c.slice(1).map((v, i) => v - c[i]);
  const pitchX = cx.length > 1 ? median(gaps(cx)) : w * 0.5;
  const pitchY = cy.length > 1 ? median(gaps(cy)) : h * 0.5;
  const half = 0.46 * Math.min(pitchX, pitchY);

  // energi rata-rata tiap sel, untuk membuang sel yang kosong (tanpa charm)
  const cell: { box: Box; e: number }[] = [];
  for (const y of cy) {
    for (const x of cx) {
      const x0 = Math.max(0, Math.round(x - half));
      const y0 = Math.max(0, Math.round(y - half));
      const x1 = Math.min(w, Math.round(x + half));
      const y1 = Math.min(h, Math.round(y + half));
      let s = 0;
      for (let yy = y0; yy < y1; yy++) for (let xx = x0; xx < x1; xx++) s += sd[yy * w + xx];
      const area = Math.max(1, (x1 - x0) * (y1 - y0));
      cell.push({ box: { x: x0, y: y0, w: x1 - x0, h: y1 - y0 }, e: s / area });
    }
  }
  const emax = Math.max(...cell.map((c) => c.e));
  const kept = cell.filter((c) => c.e > 0.35 * emax).map((c) => c.box);

  return { windows: kept, cols: cx.length, rows: cy.length };
}

/**
 * Mencoba beberapa tingkat sensitivitas, lalu memilih hasil yang paling stabil
 * (jumlah charm yang sama bertahan di rentang sensitivitas terpanjang).
 */
export function autoDetectCharms(
  rgba: Uint8ClampedArray | Uint8Array,
  w: number,
  h: number
): Detection & { sensitivity: number } {
  const levels: number[] = [];
  for (let s = 0.15; s <= 0.5001; s += 0.05) levels.push(Math.round(s * 100) / 100);
  const results = levels.map((s) => ({ s, d: detectCharms(rgba, w, h, s) }));

  let best = { start: 0, len: 0, count: 0 };
  let i = 0;
  while (i < results.length) {
    let j = i;
    const count = results[i].d.windows.length;
    while (j + 1 < results.length && results[j + 1].d.windows.length === count) j++;
    const len = j - i + 1;
    if (count > 0 && (len > best.len || (len === best.len && count > best.count))) {
      best = { start: i, len, count };
    }
    i = j + 1;
  }
  const pick = results[best.start + Math.floor(best.len / 2)] ?? results[0];
  return { ...pick.d, sensitivity: pick.s };
}