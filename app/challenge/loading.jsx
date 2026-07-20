import styles from "./challenges.module.css";

export default function LoadingChallenges() {
  return <main className={styles.page} aria-label="Loading exercises">
    <section className={styles.mainPanel}>
      <div className={styles.loadingInner}>
        <div className={styles.skeletonProgress} />
        <div className={styles.skeletonLabel} />
        <div className={styles.skeletonRows}>
          {[1, 2, 3, 4, 5, 6].map((item) => <div className={styles.skeletonRow} key={item}>
            <span className={styles.skeletonDot} />
            <span className={styles.skeletonCopy}><i className={styles.skeletonTitle} /><i className={styles.skeletonCode} /></span>
            <span className={styles.skeletonPill} />
          </div>)}
        </div>
      </div>
    </section>
  </main>;
}
