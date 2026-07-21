"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "../../components/app-shell";
import styles from "./report.module.css";

function formatDuration(milliseconds) {
  const seconds = Math.max(0, Math.round(Number(milliseconds || 0) / 1000));
  return String(Math.floor(seconds / 60)).padStart(2, "0") + ":" + String(seconds % 60).padStart(2, "0");
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  return new Intl.DateTimeFormat(undefined, { weekday: "short", month: "long", day: "numeric" }).format(date);
}

function tone(score) {
  if (score <= 25) return { label: "Calm flow", className: styles.calm };
  if (score <= 60) return { label: "Active iteration", className: styles.moderate };
  return { label: "Heavy rewrites", className: styles.intense };
}

export default function ReportPage({ params }) {
  const router = useRouter();
  const [report, setReport] = useState(null);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    let active = true;
    const accessToken = window.localStorage.getItem("refactorflow-access-token");
    const preferredDark = window.localStorage.getItem("refactorflow-theme") === "dark" || document.documentElement.classList.contains("dark");
    setDark(preferredDark);

    if (!accessToken) {
      router.replace("/signin");
      return () => { active = false; };
    }

    Promise.resolve(params).then(({ id }) => Promise.all([
      fetch("/api/report/" + encodeURIComponent(id), { headers: { Authorization: "Bearer " + accessToken }, cache: "no-store" }),
      fetch("/api/profile", { headers: { Authorization: "Bearer " + accessToken }, cache: "no-store" }),
    ])).then(async ([reportResponse, profileResponse]) => {
      const reportData = await reportResponse.json().catch(() => ({}));
      const profileData = await profileResponse.json().catch(() => ({}));
      if (!reportResponse.ok) throw new Error(reportData.error || "The report could not be loaded.");
      if (!active) return;
      setReport(reportData);
      setProfile(profileData.profile || { name: "there", email: "", tier: "free", avatarUrl: null });
    }).catch((reason) => {
      if (active) setError(reason.message || "The report could not be loaded.");
    }).finally(() => {
      if (active) setLoading(false);
    });

    return () => { active = false; };
  }, [params, router]);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    window.localStorage.setItem("refactorflow-theme", next ? "dark" : "light");
    window.dispatchEvent(new Event("refactorflow-theme-change"));
  }

  function signOut() {
    window.localStorage.removeItem("refactorflow-access-token");
    window.localStorage.removeItem("refactorflow-email");
    window.localStorage.removeItem("refactorflow-show-name-prompt");
    router.replace("/signin");
  }

  if (loading) {
    return <AppShell active="sessions" dark={dark} onToggle={toggleTheme} onSignOut={signOut}>
      <section className={styles.loading}><i /><i /><i /></section>
    </AppShell>;
  }

  if (error || !report) {
    return <AppShell active="sessions" dark={dark} onToggle={toggleTheme} onSignOut={signOut}>
      <section className={styles.empty}>
        <p>Session report</p><h1>That report is unavailable.</h1><span>{error || "The session may not have been saved."}</span>
        <Link href="/sessions">Back to sessions</Link>
      </section>
    </AppShell>;
  }

  const passed = report.result.status === "passed";
  const metrics = report.metrics;
  const index = tone(metrics.thrashingIndex);
  const challengeHref = report.challenge?.slug ? "/challenge/" + report.challenge.slug : "/challenge";

  return <AppShell active="sessions" profile={profile} dark={dark} onToggle={toggleTheme} onSignOut={signOut}>
    <main className={styles.main}>
      <header className={styles.header}>
        <div>
          <Link href="/sessions" className={styles.back}>&larr; All sessions</Link>
          <p className={styles.eyebrow}>Session report &middot; {formatDate(report.createdAt)}</p>
          <h1>{passed ? "You solved it." : "The work is saved."}</h1>
          <p>{passed ? "Your solution passed every private test. The real value is in noticing how you got there." : report.result.passed + " of " + report.result.total + " tests passed. Every revision is part of the signal, not a setback."}</p>
        </div>
        <button className={styles.theme} type="button" onClick={toggleTheme}>{dark ? "Light" : "Dark"} mode</button>
      </header>

      <section className={passed ? styles.outcomePass : styles.outcomeFail}>
        <div><span>{passed ? "&#10003;" : "!"}</span><p>{passed ? "All tests passed" : "Keep iterating"}</p></div>
        <strong>{report.result.passed}/{report.result.total}</strong>
        <small>private tests passed</small>
        <em>{formatDuration(report.durationMs)} in focus</em>
      </section>

      <section className={styles.metrics}>
        <article><span>Thrashing Index</span><strong className={index.className}>{metrics.thrashingIndex}</strong><small className={index.className}>{index.label}</small></article>
        <article><span>Characters written</span><strong>{metrics.keystrokeCount}</strong><small>across this session</small></article>
        <article><span>Backspaces</span><strong>{metrics.backspaceCount}</strong><small>moments of revision</small></article>
        <article><span>Pauses</span><strong>{metrics.pauseCount}</strong><small>longest: {formatDuration(metrics.longestPauseMs)}</small></article>
      </section>

      <section className={styles.reflection}>
        <div>
          <p className={styles.eyebrow}>A small reflection</p>
          <h2>{metrics.thrashingIndex <= 25 ? "You kept a remarkably steady line of thought." : metrics.thrashingIndex <= 60 ? "You explored a few paths before settling into the answer." : "You did a lot of rewriting. That is useful information for the next round."}</h2>
        </div>
        <p>{passed ? "The test result confirms the solution. The report captures the process you can carry into the next challenge." : "Return to the challenge when you are ready. Your next attempt will add a new chapter to this practice story."}</p>
      </section>

      <section className={styles.actions}>
        <Link className={styles.primary} href={challengeHref}>{passed ? "Try it again" : "Continue challenge"} <span>&rarr;</span></Link>
        <Link className={styles.secondary} href="/challenge">Choose another</Link>
        <Link className={styles.textLink} href="/sessions">View session history</Link>
      </section>
    </main>
  </AppShell>;
}
