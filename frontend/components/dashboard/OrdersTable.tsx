"use client";

import styles from "@/app/dashboard/dashboard.module.css";
import type { Order } from "@/types/order";
import StatusBadge from "./StatusBadge";

type OrdersTableProps = {
  list: Order[];
  onDetail: (o: Order) => void;
};

export default function OrdersTable({ list, onDetail }: OrdersTableProps) {
  return (
    <div className={styles.tableWrap}>
      <table>
        <thead>
          <tr><th>ID</th><th>Pelanggan</th><th>Tanggal</th><th>Item</th><th>Total</th><th>Status</th><th></th></tr>
        </thead>
        <tbody>
          {list.map((o) => (
            <tr key={o.id}>
              <td>{o.id}</td><td>{o.name}</td><td>{o.date}</td><td>{o.item}</td><td>{o.total}</td>
              <td><StatusBadge status={o.status} /></td>
              <td>
                <button className={`${styles.detail} ${styles.linkBtn}`} onClick={() => onDetail(o)}>
                  Detail
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}