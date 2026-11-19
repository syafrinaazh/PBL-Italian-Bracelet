"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/app/dashboard/dashboard.module.css";
import type { Komponen } from "@/types/komponen";
import {
  fetchKomponen,
  createKomponen,
  deleteKomponen,
} from "@/lib/komponen-api";
import Sidebar from "@/components/dashboard/Sidebar";
import Modal from "@/components/dashboard/Modal";
import ComponentCard from "@/components/komponen/ComponentCard";
import ComponentForm from "@/components/komponen/ComponentForm";

export default function KomponenPage() {
  const router = useRouter();
  const [items, setItems] = useState<Komponen[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchKomponen()
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch((e) => {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : "Gagal memuat data.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = items.filter((k) =>
    k.name.toLowerCase().includes(query.trim().toLowerCase())
  );

  function handleCardClick(id: string) {
    if (!deleteMode) {
      router.push(`/komponen/${id}`);
      return;
    }
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function cancelDelete() {
    setDeleteMode(false);
    setSelectedIds([]);
  }

  async function confirmDelete() {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Hapus ${selectedIds.length} komponen yang dipilih?`)) return;

    const results = await Promise.allSettled(selectedIds.map((id) => deleteKomponen(id)));
    const deleted = selectedIds.filter((_, i) => results[i].status === "fulfilled");
    setItems((prev) => prev.filter((k) => !deleted.includes(k.id)));
    if (deleted.length < selectedIds.length) {
      window.alert("Sebagian komponen gagal dihapus. Coba lagi.");
    }
    cancelDelete();
  }

  async function handleAdd(data: Omit<Komponen, "id">, imageFile: File | null) {
    try {
      const created = await createKomponen(data, imageFile);
      setItems((prev) => [...prev, created]);
      setShowAdd(false);
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Gagal menyimpan komponen.");
    }
  }

  return (
    <div className={styles.dash}>
      <Sidebar />
      <main className={styles.main}>
        <header className={styles.toolbar}>
          <h1>Manajemen Komponen</h1>
          <div className={styles.toolbarActions}>
            <input
              className={styles.search}
              type="search"
              placeholder="Cari komponen"
              aria-label="Cari komponen"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {deleteMode ? (
              <>
                <button className={styles.btnGhost} onClick={cancelDelete}>
                  Batal
                </button>
                <button
                  className={styles.btnDanger}
                  onClick={confirmDelete}
                  disabled={selectedIds.length === 0}
                >
                  Hapus ({selectedIds.length})
                </button>
              </>
            ) : (
              <button className={styles.btnGhost} onClick={() => setDeleteMode(true)}>
                Hapus
              </button>
            )}
            <button className={styles.btnPrimary} onClick={() => setShowAdd(true)}>
              + Tambah komponen
            </button>
          </div>
        </header>

        {deleteMode && (
          <p className={styles.hint}>Klik kartu yang ingin dihapus, lalu tekan tombol Hapus.</p>
        )}

        {loading ? (
          <p className={styles.empty}>Memuat komponen...</p>
        ) : loadError ? (
          <p className={styles.empty}>{loadError}</p>
        ) : filtered.length === 0 ? (
          <p className={styles.empty}>Komponen tidak ditemukan.</p>
        ) : (
          <section className={styles.compGrid}>
            {filtered.map((k) => (
              <ComponentCard
                key={k.id}
                item={k}
                selectMode={deleteMode}
                selected={selectedIds.includes(k.id)}
                onClick={handleCardClick}
              />
            ))}
          </section>
        )}
      </main>

      {showAdd && (
        <Modal title="Tambah komponen" onClose={() => setShowAdd(false)}>
          <ComponentForm onSubmit={handleAdd} onCancel={() => setShowAdd(false)} />
        </Modal>
      )}
    </div>
  );
}