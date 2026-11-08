import styles from "@/app/dashboard/dashboard.module.css";
import type { Order } from "@/types/order";
import StatusBadge from "./StatusBadge";

export default function OrderDetail({ order }: { order: Order }) {
  return (
    <div className={styles.mDetail}>
      <div className={styles.mRow}><span>Status</span><StatusBadge status={order.status} /></div>
      <div className={styles.mRow}><span>Pelanggan</span><b>{order.name}</b></div>
      <div className={styles.mRow}><span>No. HP</span><b>{order.phone}</b></div>
      <div className={styles.mRow}><span>Alamat</span><b className={styles.mRight}>{order.address}</b></div>
      <div className={styles.mRow}><span>Tanggal</span><b>{order.date}</b></div>
      <div className={styles.mRow}><span>Pembayaran</span><b>{order.payment}</b></div>

      <h4>Charm dipesan</h4>
      <ul className={styles.mList}>
        {order.charms.map((c) => (
          <li key={c.name}><span>{c.name}</span><b>x{c.qty}</b></li>
        ))}
      </ul>

      <div className={`${styles.mRow} ${styles.mTotal}`}><span>Total</span><b>{order.total}</b></div>
    </div>
  );
}