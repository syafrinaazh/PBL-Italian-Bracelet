"use client";

import { useState } from "react";

type Props = {
  onChange: (file: File | null) => void; // file final yang dikirim ke form
};

export default function ImageEnhancer({ onChange }: Props) {
  const [original, setOriginal] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [enhancedFile, setEnhancedFile] = useState<File | null>(null);
  const [enhancedUrl, setEnhancedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setError("");
    setEnhancedFile(null);
    setEnhancedUrl(null);
    setOriginal(file);
    setOriginalUrl(file ? URL.createObjectURL(file) : null);
    onChange(file);
  };

  const handleEnhance = async () => {
    if (!original) return;
    setLoading(true);
    setProgress(0);
    setError("");

    try {
      // import dinamis supaya tidak error saat server-side render
      const { removeBackground } = await import("@imgly/background-removal");

      const cutout = await removeBackground(original, {
        progress: (_key: string, current: number, total: number) => {
          if (total) setProgress(Math.round((current / total) * 100));
        },
      });

      // taruh di atas background putih
      const bmp = await createImageBitmap(cutout);
      const canvas = document.createElement("canvas");
      canvas.width = bmp.width;
      canvas.height = bmp.height;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(bmp, 0, 0);

      const blob: Blob = await new Promise((res) =>
        canvas.toBlob((b) => res(b!), "image/jpeg", 0.92)
      );
      const file = new File([blob], "charm-enhanced.jpg", { type: "image/jpeg" });
      setEnhancedFile(file);
      setEnhancedUrl(URL.createObjectURL(blob));
      onChange(file); // otomatis pakai hasil AI
    } catch (err) {
      console.error(err);
      setError("Gagal memproses foto. Cek console browser (F12) untuk detail.");
    } finally {
      setLoading(false);
    }
  };

  const useOriginal = () => onChange(original);
  const useEnhanced = () => onChange(enhancedFile);

  return (
    <div className="space-y-3">
      <input type="file" accept="image/*" onChange={handleSelect} />

      {originalUrl && !enhancedUrl && (
        <div className="space-y-2">
          <img src={originalUrl} alt="Foto asli" className="h-40 rounded-lg object-contain" />
          <button
            type="button"
            onClick={handleEnhance}
            disabled={loading}
            className="rounded-lg bg-[#4a2c2a] px-4 py-2 text-white disabled:opacity-50"
          >
            {loading ? `Memproses... ${progress}%` : "✨ Perjelas & hapus background"}
          </button>
          {loading && (
            <p className="text-xs text-gray-500">
              Pertama kali dipakai, model AI diunduh dulu. Setelah itu lebih cepat.
            </p>
          )}
        </div>
      )}

      {enhancedUrl && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="mb-1 text-sm text-gray-500">Asli</p>
              <img src={originalUrl!} alt="Asli" className="h-40 w-full rounded-lg object-contain" />
            </div>
            <div>
              <p className="mb-1 text-sm text-gray-500">Hasil AI</p>
              <img src={enhancedUrl} alt="Hasil" className="h-40 w-full rounded-lg border object-contain" />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={useEnhanced} className="rounded-lg bg-[#4a2c2a] px-3 py-1.5 text-sm text-white">
              Pakai hasil AI
            </button>
            <button type="button" onClick={useOriginal} className="rounded-lg border px-3 py-1.5 text-sm">
              Pakai foto asli
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}