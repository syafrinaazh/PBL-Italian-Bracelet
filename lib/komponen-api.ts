import type { Komponen } from "@/types/komponen";

type Row = {
  id: number;
  name: string;
  category_name: string | null;
  price: string | number;
  stock: number;
  image_url: string | null;
  description: string | null;
};

// Mengubah baris dari database menjadi bentuk Komponen yang dipakai tampilan
export function toKomponen(r: Row): Komponen {
  return {
    id: String(r.id),
    name: r.name,
    category: r.category_name ?? "Tanpa kategori",
    price: Number(r.price),
    stock: r.stock,
    image: r.image_url ?? undefined,
    description: r.description ?? undefined,
  };
}

async function parse(res: Response) {
  if (res.status === 401) {
    window.location.href = "/login";
    throw new Error("Sesi habis, silakan login lagi.");
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message ?? "Terjadi kesalahan pada server.");
  return data;
}

export async function fetchKomponen(): Promise<Komponen[]> {
  const data = await parse(await fetch("/api/products?limit=100"));
  // API mengurutkan dari yang terbaru; dibalik supaya urutannya seperti semula
  return (data.data as Row[]).map(toKomponen).reverse();
}

export async function createKomponen(
  item: Omit<Komponen, "id">,
  imageFile: File | null
): Promise<Komponen> {
  const form = new FormData();
  form.append("name", item.name);
  form.append("category", item.category);
  form.append("price", String(item.price));
  form.append("stock", String(item.stock));
  if (item.description) form.append("description", item.description);
  if (imageFile) form.append("image", imageFile);
  return toKomponen(await parse(await fetch("/api/products", { method: "POST", body: form })));
}

export async function deleteKomponen(id: string): Promise<void> {
  await parse(await fetch(`/api/products/${id}`, { method: "DELETE" }));
}