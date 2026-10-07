"use client";

import { useEffect, useState } from "react";
import styles from "@/app/dashboard/dashboard.module.css";
import { orders as initialOrders, orderTotals } from "@/lib/data";
import type { Order } from "@/types/order";
import Sidebar from "@/components/dashboard/Sidebar";
import Modal from "@/components/dashboard/Modal";
import OrderDetail from "@/components/dashboard/OrderDetail";
import OrdersListTable from "@/components/pesanan/OrderListTable";
import OrderStatusForm from "@/components/pesanan/OrderStatusForm";

const TABS = ["Semua", "Baru", "Diproses", "Selesai"];

const PILL_CLASS: Record<string, string> = {
  Semua: styles.pillAll,
  Baru: styles.pillBaru,
  Diproses: styles.pillProses,
  Selesai: styles.pillSelesai,
};

export default function PesananPage() {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("Semua");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = orders.find((o) => o.id === selectedId) ?? null;

  const filtered = orders.filter((o) => {
    const q = query.trim().toLowerCase();
    const matchQuery =
      !q || o.id.toLowerCase().includes(q) || o.name.toLowerCase().includes(q);
    const matchTab = tab === "Semua" || o.status === tab;
    return matchQuery && matchTab;
  });

  /* Angka tab dari total desain, lalu disesuaikan kalau status ada yang diubah */
  function countOf(t: string) {
    if (t === "Semua") return orderTotals.Semua;
    let n = orderTotals[t];
    orders.forEach((o) => {
      const first = initialOrders.find((x) => x.id === o.id)?.status;
      if (first && first !== o.status) {
        if (first === t) n--;
        if (o.status === t) n++;
      }
    });
    return n;
  }

  function handleSave(status: string) {
    if (!selectedId) return;
    setOrders((prev) =>
      prev.map((o) => (o.id === selectedId ? { ...o, status } : o))
    );
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setSelectedId(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className={styles.dash}>
      <Sidebar />
      <main className={styles.main}>
        <header className={styles.toolbar}>
          <h1>Manajemen Pesanan</h1>
          <div className={styles.toolbarActions}>
            <input
              className={`${styles.search} ${styles.searchWide}`}
              type="search"
              placeholder="Cari ID atau pelanggan"
              aria-label="Cari pesanan"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </header>

        <div className={styles.pills}>
          {TABS.map((t) => (
            <button
              key={t}
              className={`${styles.pill} ${PILL_CLASS[t]} ${tab === t ? styles.pillActive : ""}`}
              onClick={() => setTab(t)}
            >
              {t} {countOf(t)}
            </button>
          ))}
        </div>

        <section className={styles.card}>
          {filtered.length === 0 ? (
            <p className={styles.empty}>Pesanan tidak ditemukan.</p>
          ) : (
            <OrdersListTable list={filtered} onDetail={(o) => setSelectedId(o.id)} />
          )}
        </section>
      </main>

      {selected && (
        <Modal title={`Detail ${selected.id}`} onClose={() => setSelectedId(null)}>
          <OrderDetail order={selected} />
          <OrderStatusForm
            key={`${selected.id}-${selected.status}`}
            current={selected.status}
            onSave={handleSave}
          />
        </Modal>
      )}
    </div>
  );
}