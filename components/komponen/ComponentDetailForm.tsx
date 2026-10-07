"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import styles from "@/app/dashboard/dashboard.module.css";
import type { Komponen } from "@/types/komponen";

type ComponentDetailFormProps = {
  item: Komponen;
  onSave: (data: Komponen) => void;
  onCancel: () => void;
};

export default function ComponentDetailForm({ item, onSave, onCancel }: ComponentDetailFormProps) {
  const [name, setName] = useState(item.name);
  const [stock, setStock] = useState(String(item.stock));
  const [category, setCategory] = useState(item.category);
  const [price, setPrice] = useState(String(item.price));
  const [description, setDescription] = useState(item.description ?? "");
  const [images, setImages] = useState<string[]>(item.images ?? (item.image ? [item.image] : []));
  const [error, setError] = useState("");

  function handleUpload(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const urls = files.map((f) => URL.createObjectURL(f));
    setImages((prev) => [...prev, ...urls]);
    e.target.value = "";
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const priceNum = Number(price);
    const stockNum = Number(stock);

    if (!name.trim()) {
      setError("Nama komponen wajib diisi.");
      return;
    }
    if (stock === "" || Number.isNaN(stockNum) || stockNum < 0) {
      setError("Jumlah stock harus berupa angka 0 atau lebih.");
      return;
    }
    if (!price || Number.isNaN(priceNum) || priceNum <= 0) {
      setError("Harga harus berupa angka lebih dari 0.");
      return;
    }

    setError("");
    onSave({
      ...item,
      name: name.trim(),
      category,
      price: priceNum,
      stock: stockNum,
      description: description.trim(),
      images,
      image: images[0],
    });
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
            <option>Charm</option>
            <option>Tali</option>
            <option>Pengait</option>
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
        {images.map((src, i) => (
          <div key={`${src}-${i}`} className={styles.thumb}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={`${name} ${i + 1}`} />
            <button
              type="button"
              className={styles.thumbRemove}
              onClick={() => removeImage(i)}
              aria-label="Hapus gambar"
            >
              ×
            </button>
          </div>
        ))}
        <label className={styles.upload}>
          <span>+</span>
          <small>Upload gambar</small>
          <input type="file" accept="image/*" multiple hidden onChange={handleUpload} />
        </label>
      </div>

      {error && <p className={styles.fError}>{error}</p>}

      <div className={styles.dActions}>
        <button type="submit" className={styles.btnPrimary}>Simpan</button>
        <button type="button" className={styles.btnGhost} onClick={onCancel}>Batal</button>
      </div>
    </form>
  );
}