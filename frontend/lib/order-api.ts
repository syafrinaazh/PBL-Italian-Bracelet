import type { Order } from "@/types/order";

async function parse(res: Response) {
  if (res.status === 401) {
    window.location.href = "/login";
    throw new Error("Sesi habis, silakan login lagi.");
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message ?? "Terjadi kesalahan pada server.");
  return data;
}

export async function fetchOrders(): Promise<Order[]> {
  const data = await parse(await fetch("/api/orders"));
  return data.data as Order[];
}

export async function updateOrderStatus(id: string, status: string): Promise<Order> {
  return (await parse(
    await fetch(`/api/orders/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
  )) as Order;
}