import type { Order } from "@/types/order";

/* ===== DATA (ganti dengan data dari API / database) ===== */
export const stats = [
  { label: "Total pesanan", value: "128", sub: "Semua waktu" },
  { label: "Pesanan baru", value: "14", sub: "Perlu diproses" },
  { label: "Pendapatan", value: "Rp18.450.000", sub: "Bulan ini" },
  { label: "Total komponen", value: "48", sub: "Semua kategori" },
  { label: "Stok menipis", value: "6", sub: "Di bawah minimum" },
  { label: "Pengguna", value: "312", sub: "Terdaftar" },
];

export const revenue = {
  labels: ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"],
  values: [520, 650, 470, 780, 720, 980, 930],
};

export const charms = [
  { name: "Bunga", qty: 48, dark: false },
  { name: "Bintang", qty: 36, dark: false },
  { name: "Hati", qty: 30, dark: false },
  { name: "Kupu", qty: 22, dark: false },
  { name: "Bulan", qty: 15, dark: true },
];

/* Jumlah pesanan per status (semua waktu), sesuai desain */
export const orderTotals: Record<string, number> = {
  Semua: 128,
  Baru: 14,
  Diproses: 22,
  Selesai: 92,
};

/* Nama charm harus sama dengan nama di lib/komponen-data.ts supaya fotonya muncul */
export const orders: Order[] = [
  {
    id: "INV-1006", name: "Mila", date: "06 Okt 2026", item: "2 charm", total: "Rp88.000", status: "Baru",
    phone: "0812-1111-0006", address: "Jl. Soekarno Hatta No. 12, Malang", payment: "Transfer BCA",
    charms: [{ name: "XO", qty: 1 }, { name: "Bendera", qty: 1 }],
  },
  {
    id: "INV-1005", name: "Putri", date: "05 Okt 2026", item: "4 charm", total: "Rp175.000", status: "Diproses",
    phone: "0812-1111-0005", address: "Jl. Veteran No. 8, Malang", payment: "QRIS",
    charms: [
      { name: "Bintang Merah", qty: 1 }, { name: "Bintang Jatuh", qty: 1 },
      { name: "Cute", qty: 1 }, { name: "Topeng", qty: 1 },
    ],
  },
  {
    id: "INV-1004", name: "Salsa", date: "04 Okt 2026", item: "3 charm", total: "Rp120.000", status: "Diproses",
    phone: "0812-1111-0004", address: "Jl. Ijen No. 5, Malang", payment: "Transfer Mandiri",
    charms: [{ name: "CA Girl", qty: 1 }, { name: "Cute", qty: 1 }, { name: "Super Rockstar", qty: 1 }],
  },
  {
    id: "INV-1003", name: "Rani", date: "02 Okt 2026", item: "5 charm", total: "Rp210.000", status: "Selesai",
    phone: "0812-1111-0003", address: "Jl. Kawi No. 21, Malang", payment: "COD",
    charms: [
      { name: "Bintang Jatuh", qty: 1 }, { name: "Croissant", qty: 1 }, { name: "Kotak Catur", qty: 1 },
      { name: "Telur", qty: 1 }, { name: "Blessed", qty: 1 },
    ],
  },
  {
    id: "INV-1002", name: "Nadia", date: "01 Okt 2026", item: "3 charm", total: "Rp98.000", status: "Selesai",
    phone: "0812-1111-0002", address: "Jl. Semeru No. 3, Malang", payment: "QRIS",
    charms: [{ name: "Bendera", qty: 1 }, { name: "Topeng", qty: 1 }, { name: "XO", qty: 1 }],
  },
  {
    id: "INV-1001", name: "Dina", date: "29 Sep 2026", item: "4 charm", total: "Rp143.000", status: "Selesai",
    phone: "0812-1111-0001", address: "Jl. Bunga No. 17, Malang", payment: "Transfer BCA",
    charms: [
      { name: "Bendera", qty: 1 }, { name: "Bintang Merah", qty: 1 },
      { name: "Bintang Jatuh", qty: 1 }, { name: "Cute", qty: 1 },
    ],
  },
];

export const menu = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/komponen", label: "Komponen" },
  { href: "/pesanan", label: "Pesanan" },
  { href: "/laporan", label: "Laporan" },
];