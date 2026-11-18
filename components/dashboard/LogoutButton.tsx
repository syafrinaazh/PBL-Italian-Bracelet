"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import styles from "@/app/dashboard/dashboard.module.css";
import Modal from "./Modal";

export default function LogoutButton() {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLogout = () => {
    // localStorage.removeItem("token"); // aktifkan kalau login-mu pakai token
    setShowConfirm(false);
    router.replace("/login");
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
              >
                Tidak
              </button>
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={handleLogout}
              >
                Iya
              </button>
            </div>
          </Modal>,
          document.body
        )}
    </>
  );
}