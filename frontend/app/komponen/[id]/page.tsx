"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import styles from "@/app/dashboard/dashboard.module.css";
import type { Komponen } from "@/types/komponen";
import { fetchKomponenById, updateKomponen } from "@/lib/komponen-api";
import Sidebar from "@/components/dashboard/Sidebar";
import ComponentDetailForm from "@/components/komponen/ComponentDetailForm";

export default function DetailKomponenPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<Komponen | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetchKomponenById(params.id)
      .then((data) => {
        if (!cancelled) setItem(data);
      })
      .catch((e) => {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : "Gagal memuat data.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  async function handleSave(data: Komponen, imageFile: File | null) {
    const { id, ...rest } = data;
    const updated = await updateKomponen(id, rest, imageFile);
    setItem(updated);
    setNotice("Perubahan berhasil disimpan.");
  }

  return (
    <div className={styles.dash}>
      <Sidebar />
      <main className={styles.main}>
        <header className={styles.top}>
          <div>
            <Link href="/komponen" className={styles.crumb}>
              ← Manajemen Komponen
            </Link>
            <h1>Detail Komponen</h1>
          </div>
          <div className={styles.admin}>
            <span>Admin Toko</span>
            <div className={styles.avatar}>A</div>
          </div>
        </header>

        {loading ? (
          <section className={styles.card}>
            <p className={styles.empty}>Memuat komponen...</p>
          </section>
        ) : loadError || !item ? (
          <section className={styles.card}>
            <p className={styles.empty}>{loadError || "Komponen tidak ditemukan."}</p>
          </section>
        ) : (
          <section className={`${styles.card} ${styles.detailCard}`}>
            {notice && <p className={styles.notice}>{notice}</p>}
            <ComponentDetailForm
              key={`${item.id}-${item.image ?? ""}-${item.name}`}
              item={item}
              onSave={handleSave}
              onCancel={() => router.push("/komponen")}
            />
          </section>
        )}
      </main>
    </div>
  );
}