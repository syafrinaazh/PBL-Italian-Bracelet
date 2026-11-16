"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import styles from "@/app/dashboard/dashboard.module.css";
import type { Komponen } from "@/types/komponen";

type ComponentDetailFormProps = {
  item: Komponen;
  onSave: (data: Komponen, imageFile: File | null) => Promise<void> | void;
  onCancel: () => void;
};

const BASE_CATEGORIES = ["Charm", "Tali", "Pengait"];

export default function ComponentDetailForm({ item, onSave, onCancel }: ComponentDetailFormProps) {
  const [name, setName] = useState(item.name);
  const [stock, setStock] = useState(String(item.stock));
  const [category, setCategory] = useState(item.category);
  const [price, setPrice] = useState(String(item.price));
  const [description, setDescription] = useState(item.description ?? "");
  const [preview, setPreview] = useState<string | null>(item.image ?? null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const categories = BASE_CATEGORIES.includes(item.category)
    ? BASE_CATEGORIES
    : [item.category, ...BASE_CATEGORIES];

  function handleUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
    e.target.value = "";
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const priceNum = Number(price);
    const stockNum = Number(stock);

    if (!name.trim()) {
      setError("Nama komponen wajib diisi.");
      return;
    }
    if (stock === "" || Number.isNaN(stockNum) || stockNum < 0 || !Number.isInteger(stockNum)) {
      setError("Jumlah stock harus berupa bilangan bulat 0 atau lebih.");
      return;
    }
    if (!price || Number.isNaN(priceNum) || priceNum <= 0) {
      setError("Harga harus berupa angka lebih dari 0.");
      return;
    }

    setError("");
    setSaving(true);
    try {
      await onSave(
        {
          ...item,
          name: name.trim(),
          category,
          price: priceNum,
          stock: stockNum,
          description: description.trim(),
        },
        imageFile
      );
      setImageFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan perubahan.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className={styles.fForm} onSubmit={handleSubmit} noValidate>
      <label className={styles.fLabel} htmlFor="dName">Nama komponen</label>
      <input
        id="dName"
        className={styles.fInput}
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <div className={styles.dGrid}>
        <div className={styles.dCol}>
          <label className={styles.fLabel} htmlFor="dStock">Jumlah stock</label>
          <input
            id="dStock"
            type="number"
            min="0"
            className={styles.fInput}
            value={stock}
            onChange={(e) => setStock(e.target.value)}
          />
        </div>
        <div className={styles.dCol}>
          <label className={styles.fLabel} htmlFor="dCat">Kategori</label>
          <select
            id="dCat"
            className={styles.fInput}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className={styles.dCol}>
          <label className={styles.fLabel} htmlFor="dPrice">Harga (Rp)</label>
          <input
            id="dPrice"
            type="number"
            min="0"
            className={styles.fInput}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
      </div>

      <label className={styles.fLabel} htmlFor="dDesc">Deskripsi &amp; Material</label>
      <textarea
        id="dDesc"
        className={`${styles.fInput} ${styles.textarea}`}
        rows={4}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <span className={styles.fLabel}>Gambar</span>
      <div className={styles.gallery}>
        {preview && (
          <div className={styles.thumb}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt={name} />
          </div>
        )}
        <label className={styles.upload}>
          <span>+</span>
          <small>{preview ? "Ganti gambar" : "Upload gambar"}</small>
          <input type="file" accept="image/*" hidden onChange={handleUpload} />
        </label>
      </div>

      {error && <p className={styles.fError}>{error}</p>}

      <div className={styles.dActions}>
        <button type="submit" className={styles.btnPrimary} disabled={saving}>
          {saving ? "Menyimpan..." : "Simpan"}
        </button>
        <button type="button" className={styles.btnGhost} onClick={onCancel} disabled={saving}>
          Batal
        </button>
      </div>
    </form>
  );
}