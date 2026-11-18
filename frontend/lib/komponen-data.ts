import type { Komponen } from "@/types/komponen";

/* ===== DATA (ganti dengan data dari API / database) ===== */
export const komponenList: Komponen[] = [
  { id: "KMP-001", name: "Bendera", category: "Charm", price: 25000, stock: 40, image: "/charms/bendera.png", description: "Charm bendera berlapis enamel dengan bingkai stainless steel anti-karat." },
  { id: "KMP-002", name: "CA Girl", category: "Charm", price: 24000, stock: 15, image: "/charms/ca-girl.png", description: "Charm bertuliskan CA Girl dengan enamel warna dan bingkai stainless steel anti-karat." },
  { id: "KMP-003", name: "Bintang Jatuh", category: "Charm", price: 22000, stock: 0, image: "/charms/bintang-jatuh.png", description: "Charm bintang jatuh pink dengan aksen emas pada latar stainless steel." },
  { id: "KMP-004", name: "Cute", category: "Charm", price: 20000, stock: 18, image: "/charms/cute.png", description: "Charm bertuliskan Cute dengan ukiran huruf sambung pada plat stainless steel." },
  { id: "KMP-005", name: "Kotak Catur", category: "Charm", price: 21000, stock: 33, image: "/charms/kotak-catur.png", description: "Charm motif kotak catur hitam putih dengan bingkai stainless steel anti-karat." },
  { id: "KMP-006", name: "Bintang Merah", category: "Charm", price: 22000, stock: 8, image: "/charms/bintang-merah.png", description: "Charm bintang berlapis enamel dengan bingkai stainless steel anti-karat. Tersedia dalam beberapa varian warna." },
  { id: "KMP-007", name: "Croissant", category: "Charm", price: 26000, stock: 25, image: "/charms/croissant.png", description: "Charm croissant berlapis enamel kuning keemasan pada bingkai stainless steel." },
  { id: "KMP-008", name: "Blessed", category: "Charm", price: 20000, stock: 50, image: "/charms/blessed.png", description: "Charm bertuliskan Blessed dengan ukiran huruf sambung pada plat stainless steel." },
  { id: "KMP-009", name: "Topeng", category: "Charm", price: 27000, stock: 12, image: "/charms/topeng.png", description: "Charm topeng teater berlapis enamel dengan bingkai stainless steel anti-karat." },
  { id: "KMP-010", name: "XO", category: "Charm", price: 23000, stock: 45, image: "/charms/xo.png", description: "Charm hati putih bertuliskan XO berlapis enamel merah dengan bingkai stainless steel." },
  { id: "KMP-011", name: "Super Rockstar", category: "Charm", price: 25000, stock: 30, image: "/charms/super-rockstar.png", description: "Charm bertuliskan Super Rockstar berlatar enamel merah dengan aksen bintang." },
  { id: "KMP-012", name: "Telur", category: "Charm", price: 21000, stock: 60, image: "/charms/telur.png", description: "Charm telur mata sapi berlapis enamel putih dan kuning pada bingkai stainless steel." },
];

export const LOW_STOCK_LIMIT = 10;

export function getStockStatus(stock: number): "Aman" | "Menipis" | "Habis" {
  if (stock <= 0) return "Habis";
  if (stock < LOW_STOCK_LIMIT) return "Menipis";
  return "Aman";
}

export function formatRupiah(n: number): string {
  return "Rp" + n.toLocaleString("id-ID");
}