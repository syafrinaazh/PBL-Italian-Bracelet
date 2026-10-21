"use client";

import { useState } from "react";
import styles from "@/app/dashboard/dashboard.module.css";

const STATUS_LIST = ["Baru", "Diproses", "Selesai"];

type OrderStatusFormProps = {
  current: string;
  onSave: (status: string) => void;
};

export default function OrderStatusForm({ current, onSave }: OrderStatusFormProps) {
  const [status, setStatus] = useState(current);

  return (
    <div className={styles.sForm}>
      <label className={styles.fLabel} htmlFor="statusSelect">
        Ubah status
      </label>
      <select
        id="statusSelect"
        className={styles.fInput}
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      >
        {STATUS_LIST.map((s) => (
          <option key={s}>{s}</option>
        ))}
      </select>
      <button
        className={styles.btnPrimary}
        onClick={() => onSave(status)}
        disabled={status === current}
      >
        Simpan
      </button>
    </div>
  );
}