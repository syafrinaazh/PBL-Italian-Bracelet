import styles from "@/app/dashboard/dashboard.module.css";

export default function StatusBadge({ status }: { status: string }) {
  return <span className={`${styles.badge} ${styles[status.toLowerCase()]}`}>{status}</span>;
}