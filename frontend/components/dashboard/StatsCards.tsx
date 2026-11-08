import styles from "@/app/dashboard/dashboard.module.css";
import { stats } from "@/lib/data";

export default function StatsCards() {
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