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

export const orders: Order[] = [
  {
    id: "INV-1006", name: "Mila", date: "06 Okt 2026", item: "2 charm", total: "Rp88.000", status: "Baru",
    phone: "0812-1111-0006", address: "Jl. Soekarno Hatta No. 12, Malang", payment: "Transfer BCA",
    charms: [{ name: "Bunga", qty: 1 }, { name: "Bulan", qty: 1 }],
  },
  {
    id: "INV-1005", name: "Putri", date: "05 Okt 2026", item: "4 charm", total: "Rp175.000", status: "Diproses",
    phone: "0812-1111-0005", address: "Jl. Veteran No. 8, Malang", payment: "QRIS",
    charms: [{ name: "Bintang", qty: 2 }, { name: "Hati", qty: 2 }],
  },
  {
    id: "INV-1004", name: "Salsa", date: "04 Okt 2026", item: "3 charm", total: "Rp120.000", status: "Diproses",
    phone: "0812-1111-0004", address: "Jl. Ijen No. 5, Malang", payment: "Transfer Mandiri",
    charms: [{ name: "Kupu", qty: 1 }, { name: "Bunga", qty: 2 }],
  },
  {
    id: "INV-1003", name: "Rani", date: "02 Okt 2026", item: "5 charm", total: "Rp210.000", status: "Selesai",
    phone: "0812-1111-0003", address: "Jl. Kawi No. 21, Malang", payment: "COD",
    charms: [{ name: "Hati", qty: 3 }, { name: "Bulan", qty: 2 }],
  },
  {
    id: "INV-1002", name: "Dewi", date: "30 Sep 2026", item: "2 charm", total: "Rp90.000", status: "Selesai",
    phone: "0812-1111-0002", address: "Jl. Semeru No. 3, Malang", payment: "QRIS",
    charms: [{ name: "Bintang", qty: 2 }],
  },
  {
    id: "INV-1001", name: "Nadia", date: "28 Sep 2026", item: "6 charm", total: "Rp255.000", status: "Selesai",
    phone: "0812-1111-0001", address: "Jl. Bunga No. 17, Malang", payment: "Transfer BCA",
    charms: [{ name: "Bunga", qty: 3 }, { name: "Kupu", qty: 3 }],
  },
];

export const menu = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/komponen", label: "Komponen" },
  { href: "/pesanan", label: "Pesanan" },
  { href: "/laporan", label: "Laporan" },
];