"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import styles from "@/app/dashboard/dashboard.module.css";
import { komponenList } from "@/lib/komponen-data";
import Sidebar from "@/components/dashboard/Sidebar";
import ComponentDetailForm from "@/components/komponen/ComponentDetailForm";

export default function DetailKomponenPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [notice, setNotice] = useState("");

  const item = komponenList.find((k) => k.id === params.id);

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

        {!item ? (
          <section className={styles.card}>
            <p className={styles.empty}>Komponen tidak ditemukan.</p>
          </section>
        ) : (
          <section className={`${styles.card} ${styles.detailCard}`}>
            {notice && <p className={styles.notice}>{notice}</p>}
            <ComponentDetailForm
              item={item}
              onSave={() =>
                setNotice("Perubahan berhasil disimpan (sementara, belum tersambung ke database).")
              }
              onCancel={() => router.push("/komponen")}
            />
          </section>
        )}
      </main>
    </div>
  );
}