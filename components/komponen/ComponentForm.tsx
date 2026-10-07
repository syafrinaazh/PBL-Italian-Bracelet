"use client";

import { useState, FormEvent } from "react";
import styles from "@/app/dashboard/dashboard.module.css";
import type { Komponen } from "@/types/komponen";

type ComponentFormProps = {
  onSubmit: (data: Omit<Komponen, "id">) => void;
  onCancel: () => void;
};

export default function ComponentForm({ onSubmit, onCancel }: ComponentFormProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Charm");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const priceNum = Number(price);
    const stockNum = Number(stock);

    if (!name.trim()) {
      setError("Nama komponen wajib diisi.");
      return;
    }
    if (!price || Number.isNaN(priceNum) || priceNum <= 0) {
      setError("Harga harus berupa angka lebih dari 0.");
      return;
    }
    if (stock === "" || Number.isNaN(stockNum) || stockNum < 0) {
      setError("Stok harus berupa angka 0 atau lebih.");
      return;
    }

    onSubmit({ name: name.trim(), category, price: priceNum, stock: stockNum });
  }

  return (
    <form className={styles.fForm} onSubmit={handleSubmit} noValidate>
      <label className={styles.fLabel} htmlFor="kName">Nama komponen</label>
      <input
        id="kName"
        className={styles.fInput}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Contoh: Bunga Matahari"
      />

      <label className={styles.fLabel} htmlFor="kCat">Kategori</label>
      <select
        id="kCat"
        className={styles.fInput}
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option>Charm</option>
        <option>Tali</option>
        <option>Pengait</option>
      </select>

      <label className={styles.fLabel} htmlFor="kPrice">Harga (Rp)</label>
      <input
        id="kPrice"
        type="number"
        min="0"
        className={styles.fInput}
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        placeholder="25000"
      />

      <label className={styles.fLabel} htmlFor="kStock">Stok</label>
      <input
        id="kStock"
        type="number"
        min="0"
        className={styles.fInput}
        value={stock}
        onChange={(e) => setStock(e.target.value)}
        placeholder="40"
      />

      {error && <p className={styles.fError}>{error}</p>}

      <div className={styles.fActions}>
        <button type="button" className={styles.btnGhost} onClick={onCancel}>
          Batal
        </button>
        <button type="submit" className={styles.btnPrimary}>
          Simpan
        </button>
      </div>
    </form>
  );
}