"use client";

import styles from "./laporan.module.css";
import dash from "../dashboard/dashboard.module.css";
import Sidebar from "@/components/dashboard/Sidebar";

const dailyData = [
  { label: "Sen", value: 12 },
  { label: "Sel", value: 18 },
  { label: "Rab", value: 9 },
  { label: "Kam", value: 22 },
  { label: "Jum", value: 20 },
  { label: "Sab", value: 27 },
  { label: "Min", value: 24 },
];

const monthlyData = [
  { label: "Mei", value: 12 },
  { label: "Jun", value: 15 },
  { label: "Jul", value: 11 },
  { label: "Agu", value: 17 },
  { label: "Sep", value: 16 },
  { label: "Okt", value: 18 },
];

const categories = [
  { name: "Charm", percent: 72 },
  { name: "Link Dasar", percent: 18 },
  { name: "Kunci", percent: 10 },
];

const topCharms = [
  { name: "Bintang Merah", sold: 48, icon: "★" },
  { name: "XO", sold: 36, icon: "XO" },
  { name: "Bendera", sold: 30, icon: "⚑" },
];

const PERIOD = "Oktober 2026";

type BarChartProps = {
  data: { label: string; value: number }[];
  maxHeight: number;
  chartClass: string;
  small?: boolean;
};

function BarChart({ data, maxHeight, chartClass, small }: BarChartProps) {
  const max = Math.max(...data.map((d) => d.value));

  return (
    <>
      <div className={`${styles.chart} ${chartClass}`}>
        {data.map((d, i) => (
          <div key={d.label} className={styles.col}>
            <div className={`${styles.val} ${small ? styles.valSmall : ""}`}>
              {d.value}
            </div>
            <div
              className={`${styles.bar} ${
                i === data.length - 1 ? styles.barHighlight : ""
              }`}
              style={{ height: (d.value / max) * maxHeight }}
            />
          </div>
        ))}
      </div>
      <div className={styles.labels}>
        {data.map((d) => (
          <span key={d.label}>{d.label}</span>
        ))}
      </div>
    </>
  );
}

function buildCsv(): string {
  const sep = ";"; // titik koma agar terbaca rapi di Excel versi Indonesia
  const rows: string[][] = [
    ["Laporan Penjualan Italian Bracelet"],
    ["Periode", PERIOD],
    [],
    ["Laporan Harian (jumlah pesanan)"],
    ["Hari", "Jumlah Pesanan"],
    ...dailyData.map((d) => [d.label, String(d.value)]),
    [],
    ["Laporan Bulanan (Rp juta)"],
    ["Bulan", "Penjualan (Rp juta)"],
    ...monthlyData.map((d) => [d.label, String(d.value)]),
    [],
    ["Laporan per Kategori Komponen"],
    ["Kategori", "Persentase (%)"],
    ...categories.map((c) => [c.name, String(c.percent)]),
    [],
    ["Charm Terlaris"],
    ["Nama Charm", "Terjual"],
    ...topCharms.map((c) => [c.name, String(c.sold)]),
  ];

  return rows
    .map((row) =>
      row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(sep)
    )
    .join("\r\n");
}

export default function LaporanPage() {
  const handleDownload = () => {
    // "\uFEFF" = BOM supaya karakter seperti ★ tidak rusak di Excel
    const blob = new Blob(["\uFEFF" + buildCsv()], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "laporan-penjualan-oktober-2026.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  return (
    <div className={dash.dash}>
      <Sidebar />
      <main className={dash.main}>
        <header className={dash.top}>
          <h1>Laporan Penjualan</h1>
          <div className={styles.actions}>
            <div className={styles.period}>{PERIOD}</div>
            <button className={styles.btn} onClick={handleDownload}>
              Unduh laporan
            </button>
          </div>
        </header>

        <div className={styles.content}>
          <section className={styles.card}>
            <h3 className={styles.cardTitle}>
              Laporan Harian (jumlah pesanan)
            </h3>
            <BarChart
              data={dailyData}
              maxHeight={120}
              chartClass={styles.chartDaily}
            />
          </section>

          <div className={styles.grid2}>
            <section className={styles.card}>
              <h3 className={styles.cardTitle}>Laporan Bulanan (Rp juta)</h3>
              <BarChart
                data={monthlyData}
                maxHeight={95}
                chartClass={styles.chartMonthly}
                small
              />
            </section>

            <section className={styles.card}>
              <h3 className={styles.cardTitle}>
                Laporan per Kategori Komponen
              </h3>
              {categories.map((c) => (
                <div key={c.name} className={styles.cat}>
                  <div className={styles.catRow}>
                    <span>{c.name}</span>
                    <span>{c.percent}%</span>
                  </div>
                  <div className={styles.track}>
                    <div
                      className={styles.fill}
                      style={{ width: `${c.percent}%` }}
                    />
                  </div>
                </div>
              ))}

              <div className={styles.sub}>Charm terlaris</div>
              {topCharms.map((c) => (
                <div key={c.name} className={styles.item}>
                  <div className={styles.thumb}>{c.icon}</div>
                  <div>
                    <b>{c.name}</b>
                    <small>{c.sold} terjual</small>
                  </div>
                </div>
              ))}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}