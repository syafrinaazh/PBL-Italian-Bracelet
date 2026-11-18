"use client";

import { useEffect, useState } from "react";
import styles from "./dashboard.module.css";
import { orders } from "@/lib/data";
import type { Order } from "@/types/order";
import Sidebar from "@/components/dashboard/Sidebar";
import StatsCards from "@/components/dashboard/StatsCards";
import RevenueChart from "@/components/dashboard/RevenueChart";
import BestSellerChart from "@/components/dashboard/BestSellerChart";
import OrdersTable from "@/components/dashboard/OrdersTable";
import OrderDetail from "@/components/dashboard/OrderDetail";
import Modal from "@/components/dashboard/Modal";

export default function DashboardPage() {
  const [showAll, setShowAll] = useState(false);
  const [selected, setSelected] = useState<Order | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      if (selected) setSelected(null);
      else setShowAll(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);

  return (
    <div className={styles.dash}>
      <Sidebar />
      <main className={styles.main}>
        <header className={styles.top}>
          <h1>Dashboard &amp; Overview</h1>
          <div className={styles.admin}><span>Admin Toko</span><div className={styles.avatar}>A</div></div>
        </header>

        <StatsCards />

        <section className={styles.charts}>
          <div className={`${styles.card} ${styles.chart}`}>
            <div className={styles.chartTitle}>Pendapatan 7 hari terakhir (Rp ribu)</div>
            <RevenueChart />
          </div>
          <div className={`${styles.card} ${styles.chart}`}>
            <div className={styles.chartTitle}>Charm terlaris (terjual)</div>
            <BestSellerChart />
          </div>
        </section>

        <section className={styles.card}>
          <div className={styles.tableHead}>
            <h2>Pesanan terbaru</h2>
            <button className={styles.linkBtn} onClick={() => setShowAll(true)}>Lihat semua</button>
          </div>
          <OrdersTable list={orders.slice(0, 4)} onDetail={setSelected} />
        </section>
      </main>

      {showAll && (
        <Modal title={`Semua pesanan (${orders.length})`} onClose={() => setShowAll(false)} wide>
          <OrdersTable list={orders} onDetail={setSelected} />
        </Modal>
      )}

      {selected && (
        <Modal title={`Detail ${selected.id}`} onClose={() => setSelected(null)}>
          <OrderDetail order={selected} />
        </Modal>
      )}
    </div>
  );
}