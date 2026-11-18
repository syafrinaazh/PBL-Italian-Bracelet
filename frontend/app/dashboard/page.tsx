"use client";

import { useEffect, useState } from "react";
import styles from "./dashboard.module.css";
import type { Order } from "@/types/order";
import { fetchOrders } from "@/lib/order-api";
import { fetchDashboard, type DashboardData } from "@/lib/stats-api";
import Sidebar from "@/components/dashboard/Sidebar";
import StatsCards from "@/components/dashboard/StatsCards";
import RevenueChart from "@/components/dashboard/RevenueChart";
import BestSellerChart from "@/components/dashboard/BestSellerChart";
import OrdersTable from "@/components/dashboard/OrdersTable";
import OrderDetail from "@/components/dashboard/OrderDetail";
import Modal from "@/components/dashboard/Modal";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [selected, setSelected] = useState<Order | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchDashboard(), fetchOrders()])
      .then(([d, o]) => {
        if (cancelled) return;
        setData(d);
        setOrders(o);
      })
      .catch((e) => {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : "Gagal memuat dashboard.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

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

        {loading ? (
          <p className={styles.empty}>Memuat dashboard...</p>
        ) : loadError || !data ? (
          <p className={styles.empty}>{loadError || "Data tidak tersedia."}</p>
        ) : (
          <>
            <StatsCards stats={data.stats} />

            <section className={styles.charts}>
              <div className={`${styles.card} ${styles.chart}`}>
                <div className={styles.chartTitle}>Pendapatan 7 hari terakhir (Rp ribu)</div>
                <RevenueChart revenue={data.revenue} />
              </div>
              <div className={`${styles.card} ${styles.chart}`}>
                <div className={styles.chartTitle}>Charm terlaris (terjual)</div>
                <BestSellerChart charms={data.charms} />
              </div>
            </section>

            <section className={styles.card}>
              <div className={styles.tableHead}>
                <h2>Pesanan terbaru</h2>
                <button className={styles.linkBtn} onClick={() => setShowAll(true)}>Lihat semua</button>
              </div>
              <OrdersTable list={orders.slice(0, 4)} onDetail={setSelected} />
            </section>
          </>
        )}
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