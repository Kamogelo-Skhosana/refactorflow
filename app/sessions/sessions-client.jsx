"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "../components/app-shell";
import styles from "./sessions.module.css";

function formatDuration(milliseconds) {
  const seconds = Math.max(0, Math.round(Number(milliseconds || 0) / 1000));
  return String(Math.floor(seconds / 60)).padStart(2, "0") + ":" + String(seconds % 60).padStart(2, "0");
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function scoreTone(score) {
  if (score <= 25) return styles.calm;
  if (score <= 60) return styles.moderate;
  return styles.intense;
}

export default function SessionsClient() {
  const router = useRouter();
  const [dark, setDark] = useState(false);
  const [profile, setProfile] = useState(null);
  const [summary, setSummary] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const accessToken = window.localStorage.getItem("refactorflow-access-token");
    const preferredDark = window.localStorage.getItem("refactorflow-theme") === "dark" || document.documentElement.classList.contains("dark");
    setDark(preferredDark);

    if (!accessToken) {
      router.replace("/signin");
      return;
    }

    fetch("/api/sessions/history", { headers: { Authorization: "Bearer " + accessToken }, cache: "no-store" })
      .then((response) => response.json().then((data) => ({ response, data })))
      .then(({ response, data }) => {
        if (!response.ok) throw new Error(data.error || "Your session history could not be loaded.");
        setProfile(data.profile);
        setSummary(data.summary);
        setSessions(Array.isArray(data.sessions) ? data.sessions : []);
      })
      .catch((reason) => setError(reason.message || "Your session history could not be loaded."))
      .finally(() => setLoading(false));
  }, [router]);

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

  const filtered = useMemo(() => sessions.filter((session) => {
    const matchesQuery = !query.trim() || session.challenge.title.toLowerCase().includes(query.trim().toLowerCase());
    const matchesStatus = status === "all" || session.result.status === status;
    return matchesQuery && matchesStatus;
  }), [query, sessions, status]);

  if (loading) {
    return <AppShell active="sessions" dark={dark} onToggle={toggleTheme} onSignOut={signOut}>
      <section className={styles.main}>
        <div className={styles.loadingHead}><i /><i /></div>
        <div className={styles.skeletonStats}>{[1, 2, 3].map((item) => <i key={item} />)}</div>
        <div className={styles.skeletonRows}>{[1, 2, 3, 4].map((item) => <i key={item} />)}</div>
      </section>
    </AppShell>;
  }

  if (error || !profile || !summary) {
    return <AppShell active="sessions" dark={dark} onToggle={toggleTheme} onSignOut={signOut}>
      <section className={styles.emptyState}>
        <p className={styles.eyebrow}>Session history</p>
        <h1>Your history is unavailable.</h1>
        <p>{error || "Please sign in again to view your sessions."}</p>
        <Link href="/signin" className={styles.primary}>Sign in</Link>
      </section>
    </AppShell>;
  }

  return <AppShell active="sessions" profile={profile} dark={dark} onToggle={toggleTheme} onSignOut={signOut}>
    <section className={styles.main}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Practice history</p>
          <h1>Every attempt<br /><em>tells a story.</em></h1>
          <p>Review your submitted sessions, see what passed, and return to the moments that taught you something.</p>
        </div>
        <button className={styles.theme} type="button" onClick={toggleTheme} aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}>
          {dark ? "Light" : "Dark"} mode
        </button>
      </header>

      <section className={styles.stats}>
        <article><span>Sessions saved</span><strong>{summary.total}</strong><small>Across your practice history</small></article>
        <article><span>Challenges solved</span><strong>{summary.completed}</strong><small>Sessions with all tests passed</small></article>
        <article><span>Average Thrashing Index</span><strong className={scoreTone(summary.averageThrashing)}>{summary.averageThrashing}</strong><small>Lower means less reworking</small></article>
      </section>

      <div className={styles.toolbar}>
        <label className={styles.search}><span>Search</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search sessions..." /></label>
        <div className={styles.filters} role="group" aria-label="Session result">
          <button type="button" className={status === "all" ? styles.selected : ""} onClick={() => setStatus("all")}>All</button>
          <button type="button" className={status === "passed" ? styles.selected : ""} onClick={() => setStatus("passed")}>Passed</button>
          <button type="button" className={status === "failed" ? styles.selected : ""} onClick={() => setStatus("failed")}>Keep working</button>
        </div>
      </div>

      {filtered.length ? <section className={styles.list} aria-label="Session history">
        <div className={styles.listHeader}><span>Challenge</span><span>Outcome</span><span>Process</span><span /></div>
        {filtered.map((session) => <Link className={styles.row} href={"/report/" + session.id} key={session.id}>
          <div className={styles.challenge}>
            <span className={session.result.status === "passed" ? styles.check : styles.dot}>{session.result.status === "passed" ? <>&#10003;</> : String(session.result.passed).padStart(2, "0")}</span>
            <span><strong>{session.challenge.title}</strong><small>{formatDate(session.createdAt)} &middot; {formatDuration(session.durationMs)}</small></span>
          </div>
          <span className={session.result.status === "passed" ? styles.passed : styles.failed}>{session.result.passed}/{session.result.total} passed</span>
          <span className={[styles.index, scoreTone(session.metrics.thrashingIndex)].join(" ")}>TI {session.metrics.thrashingIndex}</span>
          <span className={styles.arrow}>&rarr;</span>
        </Link>)}
      </section> : <section className={styles.noResults}>
        <p>{sessions.length ? "No sessions match those filters." : "Your first session will appear here."}</p>
        {sessions.length ? <button type="button" onClick={() => { setQuery(""); setStatus("all"); }}>Clear filters</button> : <Link href="/challenge">Choose a challenge</Link>}
      </section>}
    </section>
  </AppShell>;
}
