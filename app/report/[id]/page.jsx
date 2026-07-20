"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./report.module.css";

function formatDuration(milliseconds) {
  const seconds = Math.max(0, Math.round(Number(milliseconds || 0) / 1000));
  return String(Math.floor(seconds / 60)).padStart(2, "0") + ":" + String(seconds % 60).padStart(2, "0");
}

export default function ReportPage({ params }) {
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [reportId, setReportId] = useState("");

  useEffect(() => {
    let active = true;
    Promise.resolve(params).then(({ id }) => {
      if (!active) return;
      setReportId(id);
      const accessToken = window.localStorage.getItem("refactorflow-access-token");
      if (!accessToken) {
        setError("Please sign in again to view this report.");
        setLoading(false);
        return;
      }

      fetch("/api/report/" + encodeURIComponent(id), {
        headers: { Authorization: "Bearer " + accessToken },
        cache: "no-store",
      })
        .then((response) => response.json().then((data) => ({ response, data })))
        .then(({ response, data }) => {
          if (!active) return;
          if (!response.ok) throw new Error(data.error || "The report could not be loaded.");
          setReport(data);
        })
        .catch((reason) => {
          if (active) setError(reason.message || "The report could not be loaded.");
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    });
    return () => { active = false; };
  }, [params]);

  if (loading) {
    return <main className={styles.page}><section className={styles.card}><p className={styles.kicker}>Session report</p><h1>Loading your session...</h1></section></main>;
  }

  if (error || !report) {
    return <main className={styles.page}><section className={styles.card}><p className={styles.kicker}>Session report</p><h1>That report is unavailable.</h1><p>{error || "The session may not have been saved."}</p><Link className={styles.action} href="/challenge">Back to challenges</Link></section></main>;
  }

  const passed = report.result.status === "passed";
  const metrics = report.metrics;
  const challengeHref = report.challenge?.slug ? "/challenge/" + report.challenge.slug : "/challenge";

  return <main className={styles.page}>
    <header className={styles.topbar}>
      <Link href="/challenge" className={styles.back}>&larr; Challenges</Link>
      <span>Session report</span>
    </header>
    <section className={styles.card}>
      <p className={styles.kicker}>{report.challenge?.title || "Challenge session"}</p>
      <h1>{passed ? "All tests passed." : "Your session is saved."}</h1>
      <p className={styles.lead}>{passed ? "Your solution cleared every private check." : report.result.passed + " of " + report.result.total + " private checks passed. Keep iterating - every attempt is useful data."}</p>

      <div className={styles.resultLine}>
        <strong className={passed ? styles.passed : styles.failed}>{report.result.passed}/{report.result.total} passed</strong>
        <span>{formatDuration(report.durationMs)} elapsed</span>
      </div>

      <div className={styles.metrics}>
        <article><small>Characters written</small><strong>{metrics.keystrokeCount}</strong></article>
        <article><small>Backspaces</small><strong>{metrics.backspaceCount}</strong></article>
        <article><small>Pauses</small><strong>{metrics.pauseCount}</strong></article>
        <article><small>Thrashing index</small><strong>{metrics.thrashingIndex}</strong><em>{metrics.classification}</em></article>
      </div>

      <div className={styles.actions}>
        <Link className={styles.primary} href={challengeHref}>Try again</Link>
        <Link className={styles.secondary} href="/dashboard">Back to dashboard</Link>
      </div>
      <small className={styles.reference}>Report {reportId}</small>
    </section>
  </main>;
}
