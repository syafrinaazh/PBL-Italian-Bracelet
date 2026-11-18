"use client";

import styles from "@/app/dashboard/dashboard.module.css";

type ModalProps = {
  title: string;
  onClose: () => void;
  wide?: boolean;
  children: React.ReactNode;
};

export default function Modal({ title, onClose, wide, children }: ModalProps) {
  return (
    <div className={styles.mOverlay} onClick={onClose}>
      <div
        className={`${styles.mBox} ${wide ? styles.mWide : ""}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className={styles.mHead}>
          <h3>{title}</h3>
          <button className={styles.mClose} onClick={onClose} aria-label="Tutup">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}