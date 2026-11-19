import styles from "@/app/dashboard/dashboard.module.css";
import type { Stat } from "@/lib/stats-api";

export default function StatsCards({ stats }: { stats: Stat[] }) {
  return (
    <section className={styles.stats}>
      {stats.map((s) => (
        <div key={s.label} className={styles.card}>
          <div className={styles.statLabel}>{s.label}</div>
          <div className={styles.statValue}>{s.value}</div>
          <div className={styles.statSub}>{s.sub}</div>
        </div>
      ))}
    </section>
  );
}