"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./report.module.css";

function formatDuration(milliseconds) {
  const seconds = Math.max(0, Math.round(Number(milliseconds || 0) / 1000));
  return Math.floor(seconds / 60) + "m " + String(seconds % 60).padStart(2, "0") + "s";
}

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Recently" : new Intl.DateTimeFormat(undefined, { month: "long", day: "numeric", year: "numeric" }).format(date);
}

function scoreMeta(score) {
  if (score <= 25) return { label: "Clean", className: styles.clean, copy: "Your edits stayed focused and your solution took a clear path." };
  if (score <= 60) return { label: "Moderate", className: styles.moderate, copy: "You explored before settling into the approach that worked." };
  return { label: "Heavy", className: styles.heavy, copy: "There was a lot of rewriting. That is a useful pattern to notice next time." };
}

function pauseDuration(pause) {
  return Math.max(0, Number(pause?.duration ?? pause?.durationMs ?? 0));
}

function ThemeIcon({ dark }) {
  return dark
    ? <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></svg>
    : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5 8.5 8.5 0 1 0 20.5 14.2Z" /></svg>;
}

function AdFooter() {
  const serve = process.env.NEXT_PUBLIC_CARBON_ADS_SERVE;
  useEffect(() => {
    if (!serve || document.getElementById("report-carbon-ad")) return;
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://cdn.carbonads.com/carbon.js?serve=" + encodeURIComponent(serve) + "&placement=refactorflowreport";
    document.getElementById("report-carbon-ad")?.appendChild(script);
  }, [serve]);

  return <aside className={styles.ad}>
    <p>Advertisement</p>
    <div id="report-carbon-ad">{!serve && <span>Developer tools, thoughtfully selected.</span>}</div>
  </aside>;
}

export default function ReportPage({ params }) {
  const router = useRouter();
  const [report, setReport] = useState(null);
  const [profile, setProfile] = useState(null);
  const [dark, setDark] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tapeOpen, setTapeOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    const accessToken = window.localStorage.getItem("refactorflow-access-token");
    const preferredDark = window.localStorage.getItem("refactorflow-theme") === "dark" || document.documentElement.classList.contains("dark");
    setDark(preferredDark);

    if (!accessToken) {
      router.replace("/signin");
      return () => { mounted = false; };
    }

    Promise.resolve(params).then(({ id }) => Promise.all([
      fetch("/api/report/" + encodeURIComponent(id), { headers: { Authorization: "Bearer " + accessToken }, cache: "no-store" }),
      fetch("/api/profile", { headers: { Authorization: "Bearer " + accessToken }, cache: "no-store" }),
    ]))
      .then(async ([reportResponse, profileResponse]) => {
        const reportData = await reportResponse.json().catch(() => ({}));
        const profileData = await profileResponse.json().catch(() => ({}));
        if (!reportResponse.ok) throw new Error(reportData.error || "The report could not be loaded.");
        if (!mounted) return;
        setReport(reportData);
        setProfile(profileData.profile || { tier: "free" });
      })
      .catch((reason) => {
        if (mounted) setError(reason.message || "The report could not be loaded.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, [params, router]);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    window.localStorage.setItem("refactorflow-theme", next ? "dark" : "light");
    window.dispatchEvent(new Event("refactorflow-theme-change"));
  }

  const pauseSummary = useMemo(() => {
    const pauses = Array.isArray(report?.pauses) ? report.pauses : [];
    const thoughtful = pauses.filter((pause) => pauseDuration(pause) >= 2000 && pauseDuration(pause) < 8000).length;
    const panic = pauses.filter((pause) => pauseDuration(pause) >= 8000).length;
    return { total: pauses.length, thoughtful, panic };
  }, [report]);

  if (loading) {
    return <main className={[styles.page, dark ? styles.dark : ""].filter(Boolean).join(" ")}><div className={styles.loading}><i /><i /><i /></div></main>;
  }

  if (error || !report) {
    return <main className={[styles.page, dark ? styles.dark : ""].filter(Boolean).join(" ")}>
      <header className={styles.nav}><Link href="/challenge">&larr; Back to challenges</Link><button type="button" onClick={toggleTheme}><ThemeIcon dark={dark} /></button></header>
      <section className={styles.empty}><p>Session report</p><h1>That report is unavailable.</h1><span>{error || "The session may not have been saved."}</span><Link href="/sessions">View sessions</Link></section>
    </main>;
  }

  const passed = report.result.status === "passed";
  const score = report.metrics.thrashingIndex;
  const meta = scoreMeta(score);
  const tape = report.tape || "";
  const visibleTape = tapeOpen || tape.length <= 500 ? tape : tape.slice(0, 500);
  const tests = report.result.tests.length ? report.result.tests : Array.from({ length: report.result.total }, (_, index) => ({ name: "Test " + (index + 1), status: index < report.result.passed ? "passed" : "failed", error: "" }));
  const resultSummary = report.result.passed + "/" + report.result.total + " tests passed";
  const challengeHref = report.challenge?.slug ? "/challenge/" + report.challenge.slug : "/challenge";

  return <main className={[styles.page, dark ? styles.dark : ""].filter(Boolean).join(" ")}>
    <header className={styles.nav}>
      <Link href="/challenge">&larr; Back to challenges</Link>
      <button type="button" aria-label={dark ? "Switch to light mode" : "Switch to dark mode"} onClick={toggleTheme}><ThemeIcon dark={dark} /></button>
    </header>

    <article className={styles.content}>
      <section className={styles.reportHeader}>
        <p>SESSION REPORT &middot; {formatDate(report.createdAt)}</p>
        <h1>{report.challenge?.title || "Practice challenge"}</h1>
        <code>{report.challenge?.slug?.replace(/-/g, "_") || "challenge"}()</code>
        <div className={passed ? styles.passBadge : styles.failBadge}>{passed ? "PASSED" : "NEEDS ANOTHER PASS"}</div>
        <span>Completed in {formatDuration(report.durationMs)}</span>
      </section>

      <section className={styles.scoreCard}>
        <p>THRASHING INDEX</p>
        <strong className={meta.className}>{score}</strong>
        <span className={meta.className}>{meta.label}</span>
        <small>You backspaced {report.metrics.backspaceCount} times and recorded {pauseSummary.panic} panic pause{pauseSummary.panic === 1 ? "" : "s"}.</small>
        <div className={styles.scale} aria-label={"Thrashing Index " + score + " out of 100"}>
          <i style={{ left: "calc(" + score + "% - 6px)" }} className={meta.className} />
        </div>
        <em>{meta.copy}</em>
      </section>

      <section className={styles.section}>
        <header><h2>Your coding trail</h2><p>Every character you typed, in order - including what you overwrote.</p></header>
        <pre className={styles.tape}>{tape ? visibleTape : "Your keystroke tape was not available for this session."}</pre>
        {tape.length > 500 && <button className={styles.tapeToggle} type="button" onClick={() => setTapeOpen((value) => !value)}>{tapeOpen ? "Collapse \u2191" : "Show full tape \u2193"}</button>}
      </section>

      <section className={styles.section}>
        <header><h2>Pause analysis</h2><p>Pauses are signals, not mistakes. They help you see the rhythm behind an attempt.</p></header>
        <div className={styles.pauseGrid}>
          <article><span>Total pauses</span><strong>{pauseSummary.total}</strong><small>all recorded pauses</small></article>
          <article><span>Thoughtful</span><strong>{pauseSummary.thoughtful}</strong><small>between 2 and 8 seconds</small></article>
          <article><span>Panic pauses</span><strong>{pauseSummary.panic}</strong><small>8 seconds or longer</small></article>
        </div>
        <p className={styles.insight}>{pauseSummary.panic ? "You had " + pauseSummary.panic + " panic pause" + (pauseSummary.panic === 1 ? "" : "s") + ". Consider breaking the problem into a smaller first step." : pauseSummary.thoughtful ? "You had " + pauseSummary.thoughtful + " thoughtful pause" + (pauseSummary.thoughtful === 1 ? "" : "s") + " - a sign that you were thinking before typing." : "No significant pauses - you worked at a steady, confident pace."}</p>
      </section>

      <section className={styles.section}>
        <header><h2>Test results</h2><p className={passed ? styles.passedText : styles.failedText}>{resultSummary}</p></header>
        <div className={styles.tests}>{tests.map((test, index) => <article className={styles["test" + test.status.replace(/^./, (letter) => letter.toUpperCase())] || styles.testFailed} key={index}>
          <i>{test.status === "passed" ? <>&#10003;</> : test.status === "skipped" ? "&ndash;" : "!"}</i>
          <div><strong>{test.name}</strong>{test.error && <small>{test.error}</small>}</div>
        </article>)}</div>
      </section>

      <section className={styles.section}>
        <header><h2>Hints used</h2></header>
        {report.hints.length ? <div className={styles.hints}>{report.hints.map((hint, index) => <p key={index}><strong>Level {hint.level}</strong><span>revealed during your practice</span></p>)}</div> : <div className={styles.noHints}><strong>No hints used</strong><span>You completed this exercise without revealing a hint.</span></div>}
      </section>

      <section className={styles.coach}>
        <p>AI COACH</p>
        <h2>AI coaching coming soon.</h2>
        <span>When enabled, this space will turn your Thrashing Index, pauses, and early rewrites into a short, practical debrief.</span>
      </section>

      <section className={styles.next}>
        <div><p>NEXT STEPS</p><h2>Keep the feedback loop moving.</h2></div>
        <div className={styles.actions}><Link className={styles.primary} href={challengeHref}>Try again <span>&rarr;</span></Link><Link className={styles.secondary} href="/challenge">Next challenge</Link><Link className={styles.secondary} href="/dashboard">Dashboard</Link></div>
      </section>

      {profile?.tier === "free" && <AdFooter />}
    </article>
  </main>;
}
