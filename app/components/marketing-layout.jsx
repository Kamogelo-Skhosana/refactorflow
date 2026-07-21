"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./marketing-layout.module.css";

function ThemeIcon({ dark }) {
  return dark
    ? <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></svg>
    : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5 8.5 8.5 0 1 0 20.5 14.2Z" /></svg>;
}

export default function MarketingLayout({ children, active = "" }) {
  const [dark, setDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setDark(window.localStorage.getItem("refactorflow-theme") === "dark" || document.documentElement.classList.contains("dark"));
  }, []);

  function toggleTheme() {
    const nextDark = !dark;
    setDark(nextDark);
    document.documentElement.classList.toggle("dark", nextDark);
    window.localStorage.setItem("refactorflow-theme", nextDark ? "dark" : "light");
    window.dispatchEvent(new Event("refactorflow-theme-change"));
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  function handleWordmarkClick(event) {
    closeMenu();
    if (window.localStorage.getItem("refactorflow-access-token")) {
      event.preventDefault();
      window.location.assign("/dashboard");
    }
  }

  return <main className={[styles.page, dark ? styles.dark : ""].filter(Boolean).join(" ")}>
    <header className={styles.header}>
      <Link className={styles.wordmark} href="/" onClick={handleWordmarkClick} aria-label="RefactorFlow home">Refactor<span>Flow</span></Link>
      <button className={styles.menuButton} type="button" aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} onClick={() => setMenuOpen((value) => !value)}>
        <i /><i />
      </button>
      <nav className={[styles.nav, menuOpen ? styles.open : ""].filter(Boolean).join(" ")} aria-label="Main navigation">
        <Link className={active === "how" ? styles.active : ""} href="/#how-it-works" onClick={closeMenu}>How it works</Link>
        <Link className={active === "pricing" ? styles.active : ""} href="/pricing" onClick={closeMenu}>Pricing</Link>
        <Link href="/#faq" onClick={closeMenu}>FAQ</Link>
        <Link href="/signin" onClick={closeMenu}>Sign in</Link>
        <Link className={styles.navCta} href="/signup" onClick={closeMenu}>Get started <span>&rarr;</span></Link>
      </nav>
      <button className={styles.themeButton} type="button" onClick={toggleTheme} aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}>
        <ThemeIcon dark={dark} />
      </button>
    </header>

    {children}

    <footer className={styles.footer}>
      <div className={styles.footerTop}>
        <Link className={styles.wordmark} href="/" onClick={handleWordmarkClick}>Refactor<span>Flow</span></Link>
        <p>Developer behavior intelligence for better practice.</p>
      </div>
      <div className={styles.footerBottom}>
        <span>&copy; 2026 RefactorFlow</span>
        <div>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/cookies">Cookies</Link>
        </div>
      </div>
    </footer>
  </main>;
}
