"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import styles from "@/app/dashboard/dashboard.module.css";
import Modal from "./Modal";

export default function LogoutButton() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      // minta backend menghapus cookie token
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      setShowConfirm(false);
      // reload penuh supaya cache router bersih dan proxy.ts baca cookie terbaru
      window.location.href = "/login";
    }
  };

  return (
    <>
      <button
        type="button"
        className={styles.logout}
        onClick={() => setShowConfirm(true)}
      >
        Logout
      </button>

      {showConfirm &&
        createPortal(
          <Modal title="Logout" onClose={() => setShowConfirm(false)}>
            <p>Anda Yakin Untuk Logout?</p>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 12,
                marginTop: 16,
              }}
            >
              <button
                type="button"
                className={styles.btnGhost}
                onClick={() => setShowConfirm(false)}
                disabled={loading}
              >
                Tidak
              </button>
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={handleLogout}
                disabled={loading}
              >
                {loading ? "Keluar..." : "Iya"}
              </button>
            </div>
          </Modal>,
          document.body
        )}
    </>
  );
}