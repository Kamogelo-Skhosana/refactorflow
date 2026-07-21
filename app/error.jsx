"use client";

import Link from "next/link";
import { useEffect } from "react";
import MarketingLayout from "./components/marketing-layout";
import styles from "./error-page.module.css";

export default function ErrorPage({ error, reset }) {
  useEffect(() => {
    console.error("RefactorFlow route error:", error);
  }, [error]);

  return <MarketingLayout>
    <section className={styles.page}>
      <div className={styles.card}>
        <p className={styles.code}>SYSTEM PAUSE</p>
        <h1>Something interrupted the flow.</h1>
        <p>Nothing needs to be fixed by you. Try the page again, or head back to a familiar place.</p>
        <div className={styles.actions}>
          <button className={styles.primary} type="button" onClick={reset}>Try again</button>
          <Link className={styles.secondary} href="/dashboard">Dashboard</Link>
        </div>
      </div>
    </section>
  </MarketingLayout>;
}
