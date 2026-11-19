"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import styles from "@/app/dashboard/dashboard.module.css";
import type { Komponen } from "@/types/komponen";

type ComponentFormProps = {
  onSubmit: (data: Omit<Komponen, "id">, imageFile: File | null) => void;
  onCancel: () => void;
};

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 2 * 1024 * 1024; // 2 MB

export default function ComponentForm({ onSubmit, onCancel }: ComponentFormProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Charm");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [inputKey, setInputKey] = useState(0); // untuk mengosongkan input file
  const [error, setError] = useState("");

  // Bersihkan alamat sementara pratinjau saat diganti atau form ditutup
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function clearImage() {
    setImageFile(null);
    setPreview(null);
    setInputKey((k) => k + 1);
  }

  function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setError("");

    if (!file) {
      clearImage();
      return;
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Foto harus berformat JPG, PNG, atau WEBP.");
      clearImage();
      return;
    }
    if (file.size > MAX_SIZE) {
      setError("Ukuran foto maksimal 2 MB.");
      clearImage();
      return;
    }

    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  }

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

    onSubmit(
      { name: name.trim(), category, price: priceNum, stock: stockNum },
      imageFile
    );
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

      <label className={styles.fLabel} htmlFor="kImage">Foto (opsional)</label>
      <input
        key={inputKey}
        id="kImage"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className={styles.fInput}
        onChange={handleFile}
      />
      {preview && (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Pratinjau foto komponen"
            style={{ width: 96, height: 96, objectFit: "cover", borderRadius: 12 }}
          />
          <button type="button" className={styles.btnGhost} onClick={clearImage}>
            Hapus foto
          </button>
        </div>
      )}

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