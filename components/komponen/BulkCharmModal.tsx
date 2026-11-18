"use client";

import { useState } from "react";
import SmartCharmSplitter, { BulkItem } from "./SmartCharmSplitter";

// SESUAIKAN: alamat endpoint simpan komponen di backend kamu
const API_URL = `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/api/komponen`;

type Props = {
  open: boolean;
  onClose: () => void;
  onSaved: () => void; // dipanggil setelah semua tersimpan (untuk refresh daftar)
};

export default function BulkCharmModal({ open, onClose, onSaved }: Props) {
  const [error, setError] = useState("");

  if (!open) return null;

  const handleSave = async (items: BulkItem[]) => {
    setError("");
    let gagal = 0;

    for (const it of items) {
      const fd = new FormData();
      fd.append("nama", it.nama);
      fd.append("kategori", "Charm");
      fd.append("harga", String(it.harga));
      fd.append("stok", String(it.stok));
      fd.append("foto", it.file);

      try {
        const res = await fetch(API_URL, {
          method: "POST",
          body: fd,
          credentials: "include", // hapus kalau backend tidak pakai cookie login
        });
        if (!res.ok) gagal++;
      } catch {
        gagal++;
      }
    }

    if (gagal > 0) {
      setError(`${gagal} dari ${items.length} komponen gagal disimpan. Cek endpoint dan login kamu.`);
      return;
    }
    onSaved();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#4a2c2a]">Tambah banyak charm dari 1 foto</h2>
          <button type="button" onClick={onClose} className="rounded-lg border px-3 py-1 text-sm">
            Tutup
          </button>
        </div>

        <SmartCharmSplitter onSave={handleSave} />

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}