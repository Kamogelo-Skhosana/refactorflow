"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./minimal-state.module.css";

function ThemeIcon({ dark }) {
  return dark
    ? <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></svg>
    : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5 8.5 8.5 0 1 0 20.5 14.2Z" /></svg>;
}

export default function MinimalState({ kind, error, reset }) {
  const router = useRouter();
  const [dark, setDark] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const isMissing = kind === "not-found";

  useEffect(() => {
    setDark(window.localStorage.getItem("refactorflow-theme") === "dark" || document.documentElement.classList.contains("dark"));
    setSignedIn(Boolean(window.localStorage.getItem("refactorflow-access-token")));
    if (!isMissing && error && typeof globalThis.Sentry?.captureException === "function") globalThis.Sentry.captureException(error);
  }, [error, isMissing]);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    window.localStorage.setItem("refactorflow-theme", next ? "dark" : "light");
    window.dispatchEvent(new Event("refactorflow-theme-change"));
  }

  return <main className={[styles.page, dark ? styles.dark : ""].filter(Boolean).join(" ")}>
    <header className={styles.nav}>
      <Link href="/" className={styles.wordmark}>Refactor<span>Flow</span></Link>
      <button type="button" onClick={toggleTheme} aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}><ThemeIcon dark={dark} /></button>
    </header>
    <section className={styles.content}>
      {isMissing ? <div className={styles.ghost}>RefactorFlow</div> : <div className={styles.alert}>!</div>}
      <p className={styles.code}>{isMissing ? "404" : "SYSTEM PAUSE"}</p>
      <h1>{isMissing ? "Page not found." : "Something went wrong."}</h1>
      <p>{isMissing ? "The page you are looking for does not exist or has been moved." : "An unexpected error occurred. We have been notified and are looking into it."}</p>
      {!isMissing && process.env.NODE_ENV !== "production" && error?.message && <code className={styles.devDetail}>{error.message}</code>}
      <div className={styles.actions}>
        {isMissing ? <button className={styles.primary} type="button" onClick={() => router.back()}>&larr; Go back</button> : <button className={styles.primary} type="button" onClick={reset}>Try again</button>}
        <Link className={styles.secondary} href={isMissing ? "/" : signedIn ? "/dashboard" : "/"}>{isMissing ? "Go home" : signedIn ? "Go to dashboard" : "Go home"}</Link>
      </div>
    </section>
  </main>;
}
