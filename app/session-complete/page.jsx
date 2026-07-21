"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import MarketingLayout from "../components/marketing-layout";
import styles from "./session-complete.module.css";

function formatDuration(seconds) {
  const safe = Math.max(0, Number(seconds) || 0);
  return String(Math.floor(safe / 60)).padStart(2, "0") + ":" + String(safe % 60).padStart(2, "0");
}

export default function SessionCompletePage() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const sessionId = query.get("sessionId");
    if (sessionId) {
      window.location.replace("/report/" + encodeURIComponent(sessionId));
      return;
    }
    const slug = query.get("challenge");
    if (!slug) return;
    try {
      const raw = window.localStorage.getItem("refactorflow-session-" + slug);
      if (raw) setSession(JSON.parse(raw));
    } catch {
      window.localStorage.removeItem("refactorflow-session-" + slug);
    }
  }, []);

  const verification = session?.verification;
  const passed = verification?.status === "passed";
  const total = Number(verification?.total) || 0;
  const completed = Boolean(verification);

  return <MarketingLayout>
    <section className={styles.page}>
      <div className={styles.card}>
        <p className={styles.eyebrow}>Session complete</p>
        <h1>{passed ? "Good work.<br /><em>Notice the process.</em>" : completed ? "The work is saved.<br /><em>Keep the thread.</em>" : "Your session<br /><em>is ready.</em>"}</h1>
        <p className={styles.lead}>{passed ? "Your code passed every check. The next useful step is understanding the habits that got you there." : completed ? "Your attempt is part of your history. You can return to the challenge or choose a fresh one whenever you are ready." : "Choose a challenge when you are ready to start your next focused practice session."}</p>
        {completed && <div className={styles.summary}>
          <span>{passed ? <>&#10003;</> : "!"}</span>
          <div><strong>{passed ? "All checks passed" : (verification.passed || 0) + " of " + total + " checks passed"}</strong><small>{formatDuration(session?.durationSeconds)} in focus</small></div>
          <em>TI {session?.thrashingIndex ?? "--"}</em>
        </div>}
        <div className={styles.actions}>
          <Link className={styles.primary} href="/challenge">Choose a challenge <span>&rarr;</span></Link>
          <Link className={styles.secondary} href="/sessions">View sessions</Link>
        </div>
      </div>
    </section>
  </MarketingLayout>;
}
