"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "@/app/dashboard/dashboard.module.css";
import { menu } from "@/lib/data";

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>ITALIAN BRACELET</div>
      <nav className={styles.nav}>
        {menu.map((m) => (
          <Link key={m.href} href={m.href} className={pathname === m.href ? styles.active : ""}>
            {m.label}
          </Link>
        ))}
      </nav>
      <Link href="/login" className={styles.logout}>Logout</Link>
    </aside>
  );
}