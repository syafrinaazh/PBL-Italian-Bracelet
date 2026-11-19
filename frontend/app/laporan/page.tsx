"use client";

import { useEffect, useState } from "react";
import styles from "./laporan.module.css";
import dash from "../dashboard/dashboard.module.css";
import Sidebar from "@/components/dashboard/Sidebar";
import { fetchReport, type ReportData } from "@/lib/stats-api";

type BarChartProps = {
  data: { label: string; value: number }[];
  maxHeight: number;
  chartClass: string;
  small?: boolean;
};

function BarChart({ data, maxHeight, chartClass, small }: BarChartProps) {
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <>
      <div className={`${styles.chart} ${chartClass}`}>
        {data.map((d, i) => (
          <div key={`${d.label}-${i}`} className={styles.col}>
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
        {data.map((d, i) => (
          <span key={`${d.label}-${i}`}>{d.label}</span>
        ))}
      </div>
    </>
  );
}

function buildCsv(r: ReportData): string {
  const sep = ";"; // titik koma agar terbaca rapi di Excel versi Indonesia
  const rows: string[][] = [
    ["Laporan Penjualan Italian Bracelet"],
    ["Periode", r.period],
    [],
    ["Laporan Harian (jumlah pesanan)"],
    ["Hari", "Jumlah Pesanan"],
    ...r.daily.map((d) => [d.label, String(d.value)]),
    [],
    ["Laporan Bulanan (Rp juta)"],
    ["Bulan", "Penjualan (Rp juta)"],
    ...r.monthly.map((d) => [d.label, String(d.value)]),
    [],
    ["Laporan per Kategori Komponen"],
    ["Kategori", "Persentase (%)"],
    ...r.categories.map((c) => [c.name, String(c.percent)]),
    [],
    ["Charm Terlaris"],
    ["Nama Charm", "Terjual"],
    ...r.topCharms.map((c) => [c.name, String(c.sold)]),
  ];

  return rows
    .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(sep))
    .join("\r\n");
}

export default function LaporanPage() {
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetchReport()
      .then((d) => {
        if (!cancelled) setReport(d);
      })
      .catch((e) => {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : "Gagal memuat laporan.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleDownload = () => {
    if (!report) return;
    // "\uFEFF" = BOM supaya karakter khusus tidak rusak di Excel
    const blob = new Blob(["\uFEFF" + buildCsv(report)], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `laporan-penjualan-${report.period.toLowerCase().replace(" ", "-")}.csv`;
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
            <div className={styles.period}>{report?.period ?? ""}</div>
            <button className={styles.btn} onClick={handleDownload} disabled={!report}>
              Unduh laporan
            </button>
          </div>
        </header>

        {loading ? (
          <p className={dash.empty}>Memuat laporan...</p>
        ) : loadError || !report ? (
          <p className={dash.empty}>{loadError || "Data tidak tersedia."}</p>
        ) : (
          <div className={styles.content}>
            <section className={styles.card}>
              <h3 className={styles.cardTitle}>Laporan Harian (jumlah pesanan)</h3>
              <BarChart data={report.daily} maxHeight={120} chartClass={styles.chartDaily} />
            </section>

            <div className={styles.grid2}>
              <section className={styles.card}>
                <h3 className={styles.cardTitle}>Laporan Bulanan (Rp juta)</h3>
                <BarChart
                  data={report.monthly}
                  maxHeight={95}
                  chartClass={styles.chartMonthly}
                  small
                />
              </section>

              <section className={styles.card}>
                <h3 className={styles.cardTitle}>Laporan per Kategori Komponen</h3>
                {report.categories.length === 0 && (
                  <p className={dash.empty}>Belum ada penjualan bulan ini.</p>
                )}
                {report.categories.map((c) => (
                  <div key={c.name} className={styles.cat}>
                    <div className={styles.catRow}>
                      <span>{c.name}</span>
                      <span>{c.percent}%</span>
                    </div>
                    <div className={styles.track}>
                      <div className={styles.fill} style={{ width: `${c.percent}%` }} />
                    </div>
                  </div>
                ))}

                <div className={styles.sub}>Charm terlaris</div>
                {report.topCharms.map((c) => (
                  <div key={c.name} className={styles.item}>
                    <div className={styles.thumb}>
                      {c.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={c.image}
                          alt={c.name}
                          style={{ width: "100%", height: "100%", objectFit: "contain" }}
                        />
                      ) : (
                        c.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <b>{c.name}</b>
                      <small>{c.sold} terjual</small>
                    </div>
                  </div>
                ))}
              </section>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}