"use client";

import styles from "@/app/dashboard/dashboard.module.css";
import type { Komponen } from "@/types/komponen";
import { formatRupiah, getStockStatus } from "@/lib/komponen-data";
import StatusBadge from "@/components/dashboard/StatusBadge";

type ComponentCardProps = {
  item: Komponen;
  selectMode: boolean;
  selected: boolean;
  onClick: (id: string) => void;
};

export default function ComponentCard({ item, selectMode, selected, onClick }: ComponentCardProps) {
  return (
    <div
      className={`${styles.compCard} ${selectMode ? styles.compSelectable : ""} ${selected ? styles.compSelected : ""}`}
      onClick={() => onClick(item.id)}
    >
      <div className={styles.compImg}>
        {item.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.image} alt={item.name} />
        ) : (
          <span className={styles.compPlaceholder}>{item.name.charAt(0)}</span>
        )}
        {selectMode && <span className={styles.compCheck}>{selected ? "✓" : ""}</span>}
      </div>
      <div className={styles.compName}>{item.name}</div>
      <div className={styles.compMeta}>
        {item.category} · {formatRupiah(item.price)}
      </div>
      <div className={styles.compFoot}>
        <StatusBadge status={getStockStatus(item.stock)} />
        <span>Stok {item.stock}</span>
      </div>
    </div>
  );
}