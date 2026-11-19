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
          <button
            type="button"
            className={styles.mClose}
            onClick={onClose}
            aria-label="Tutup"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}