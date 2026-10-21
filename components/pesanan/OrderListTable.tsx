"use client";

import styles from "@/app/dashboard/dashboard.module.css";
import type { Order } from "@/types/order";
import { komponenList } from "@/lib/komponen-data";
import StatusBadge from "@/components/dashboard/StatusBadge";

type OrdersListTableProps = {
  list: Order[];
  onDetail: (o: Order) => void;
};

function imageOf(name: string) {
  return komponenList.find((k) => k.name === name)?.image;
}

function CharmThumbs({ order }: { order: Order }) {
  const thumbs = order.charms.flatMap((c) =>
    Array.from({ length: c.qty }, (_, i) => ({ key: `${c.name}-${i}`, name: c.name }))
  );

  return (
    <div className={styles.charmCell}>
      {thumbs.map((t) => {
        const src = imageOf(t.name);
        return (
          <span key={t.key} className={styles.charmThumb} title={t.name}>
            {src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={src} alt={t.name} />
            ) : (
              t.name.charAt(0)
            )}
          </span>
        );
      })}
      <span className={styles.charmCount}>{order.item}</span>
    </div>
  );
}

export default function OrdersListTable({ list, onDetail }: OrdersListTableProps) {
  return (
    <div className={styles.tableWrap}>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Pelanggan</th>
            <th>Tanggal</th>
            <th>Charm</th>
            <th>Total</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {list.map((o) => (
            <tr key={o.id}>
              <td>{o.id}</td>
              <td>{o.name}</td>
              <td>{o.date}</td>
              <td><CharmThumbs order={o} /></td>
              <td>{o.total}</td>
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