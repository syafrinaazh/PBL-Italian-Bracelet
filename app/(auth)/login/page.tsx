"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";

const ADMIN_EMAIL = "adminitabracelet@gmail.com";
const ADMIN_PASSWORD = "Bracelet123#";

export default function LoginAdminPage() {
  const router = useRouter();
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [msg, setMsg] = useState("");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!user.trim() || !pass) {
      setMsg("Isi email/username dan password dulu.");
      return;
    }

    if (user.trim() !== ADMIN_EMAIL || pass !== ADMIN_PASSWORD) {
      setMsg("Email/username atau password salah.");
      return;
    }

    setMsg("");
    localStorage.setItem("isAdmin", "true");
    router.push("/dashboard");
  }

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.brand}>Italian Bracelet</div>

        <div className={styles.mid}>
          <div className={styles.swatches} aria-hidden="true">
            <span></span>
            <span className={styles.s2}></span>
            <span></span>
            <span></span>
            <span className={styles.s5}></span>
            <span></span>
          </div>
          <h1>Kelola toko gelang custom-mu.</h1>
          <p>
            Pantau pesanan, atur stok charm, dan lihat laporan penjualan dalam
            satu panel.
          </p>
        </div>

        <small>Panel khusus admin</small>
      </section>

      <main className={styles.panel}>
        <h2>Login</h2>

        <form id="loginForm" className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <input
              type="text"
              placeholder="Email/Username"
              autoComplete="username"
              aria-label="Email atau username"
              value={user}
              onChange={(e) => setUser(e.target.value)}
            />
          </div>

          <div className={`${styles.field} ${styles.pw}`}>
            <svg className={styles.icon} viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
              <path
                d="M7 10V8a5 5 0 0 1 10 0v2h1a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h1zm2 0h6V8a3 3 0 0 0-6 0v2z"
                opacity=".95"
              />
            </svg>
            <input
              type="password"
              placeholder="Password"
              autoComplete="current-password"
              aria-label="Password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
            />
          </div>

          <div className={styles.msg} role="alert">
            {msg}
          </div>
        </form>

        <div className={styles.actions}>
          <button className={styles.btn} type="submit" form="loginForm">
            Login
          </button>
        </div>
      </main>
    </div>
  );
}