export type Stat = { label: string; value: string; sub: string };

export type DashboardData = {
  stats: Stat[];
  revenue: { labels: string[]; values: number[] };
  charms: { name: string; qty: number; dark: boolean }[];
};

export type ReportData = {
  period: string;
  daily: { label: string; value: number }[];
  monthly: { label: string; value: number }[];
  categories: { name: string; percent: number }[];
  topCharms: { name: string; sold: number; image?: string }[];
};

async function parse(res: Response) {
  if (res.status === 401) {
    window.location.href = "/login";
    throw new Error("Sesi habis, silakan login lagi.");
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message ?? "Terjadi kesalahan pada server.");
  return data;
}

export async function fetchDashboard(): Promise<DashboardData> {
  return (await parse(await fetch("/api/stats/dashboard"))) as DashboardData;
}

export async function fetchReport(): Promise<ReportData> {
  return (await parse(await fetch("/api/stats/report"))) as ReportData;
}