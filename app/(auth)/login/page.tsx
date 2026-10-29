"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Cormorant_Garamond } from "next/font/google";
import styles from "./login.module.css";

const ADMIN_EMAIL = "adminitabracelet@gmail.com";
const ADMIN_PASSWORD = "Bracelet123#";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

/* ---------- Halaman login ---------- */
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (
      email.trim().toLowerCase() === ADMIN_EMAIL &&
      password === ADMIN_PASSWORD
    ) {
      router.push("/dashboard"); // ganti ke halaman tujuan setelah login
    } else {
      setError("Email atau password salah. Coba periksa lagi.");
      setLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        {/* Panel kiri: foto + brand */}
        <aside className={styles.hero}>
          <Image
            src="/login-bracelet.jpeg"
            alt="Italian bracelet emas dengan charm di tepi laut"
            fill
            priority
            sizes="(max-width: 900px) 100vw, 55vw"
            className={styles.heroImg}
          />
          <div className={styles.overlay} />

          <p className={styles.brand}>Italian Bracelet</p>

          <div className={styles.copy}>
            <h1 className={`${styles.title} ${display.className}`}>
              Kelola toko gelang custom-mu.
            </h1>
            <p className={styles.sub}>
              Pantau pesanan, atur stok charm, dan lihat laporan penjualan dalam
              satu panel.
            </p>
          </div>

          <p className={styles.note}>Panel khusus admin</p>
        </aside>

        {/* Panel kanan: form */}
        <div className={styles.formSide}>
          <form className={styles.form} onSubmit={handleSubmit}>
            <h2 className={`${styles.formTitle} ${display.className}`}>
              Selamat datang kembali
            </h2>
            <p className={styles.formSub}>
              Masuk untuk membuka dashboard toko.
            </p>

            <label className={styles.label} htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className={styles.input}
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              suppressHydrationWarning
            />

            <label className={styles.label} htmlFor="password">
              Password
            </label>
            <div className={styles.passwordWrap}>
              <input
                id="password"
                type={show ? "text" : "password"}
                className={styles.input}
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                suppressHydrationWarning
              />
              <button
                type="button"
                className={styles.toggle}
                onClick={() => setShow((s) => !s)}
                aria-label={show ? "Sembunyikan password" : "Tampilkan password"}
              >
                {show ? "Sembunyikan" : "Lihat"}
              </button>
            </div>

            {error && (
              <p className={styles.error} role="alert">
                {error}
              </p>
            )}

            <button type="submit" className={styles.submit} disabled={loading}>
              {loading ? "Memproses..." : "Login"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}