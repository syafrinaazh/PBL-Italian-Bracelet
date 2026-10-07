"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/app/dashboard/dashboard.module.css";
import type { Komponen } from "@/types/komponen";
import { komponenList } from "@/lib/komponen-data";
import Sidebar from "@/components/dashboard/Sidebar";
import Modal from "@/components/dashboard/Modal";
import ComponentCard from "@/components/komponen/ComponentCard";
import ComponentForm from "@/components/komponen/ComponentForm";

export default function KomponenPage() {
  const router = useRouter();
  const [items, setItems] = useState<Komponen[]>(komponenList);
  const [query, setQuery] = useState("");
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showAdd, setShowAdd] = useState(false);

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

  function confirmDelete() {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Hapus ${selectedIds.length} komponen yang dipilih?`)) return;
    setItems((prev) => prev.filter((k) => !selectedIds.includes(k.id)));
    cancelDelete();
  }

  function handleAdd(data: Omit<Komponen, "id">) {
    setItems((prev) => [...prev, { id: `KMP-${Date.now()}`, ...data }]);
    setShowAdd(false);
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

        {filtered.length === 0 ? (
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