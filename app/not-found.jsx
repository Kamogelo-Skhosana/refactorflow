import Link from "next/link";
import MarketingLayout from "./components/marketing-layout";
import styles from "./error-page.module.css";

export default function NotFound() {
  return <MarketingLayout>
    <section className={styles.page}>
      <div className={styles.card}>
        <p className={styles.code}>404 / LOST IN THE FLOW</p>
        <h1>This route took<br />a wrong turn.</h1>
        <p>The page you are looking for may have moved, or it may never have existed. Your work is still safe.</p>
        <div className={styles.actions}>
          <Link className={styles.primary} href="/">Back home</Link>
          <Link className={styles.secondary} href="/challenge">Browse challenges</Link>
        </div>
      </div>
    </section>
  </MarketingLayout>;
}
