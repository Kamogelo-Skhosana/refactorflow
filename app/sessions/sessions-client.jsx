"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "../components/app-shell";
import styles from "./sessions.module.css";

const PAGE_SIZE = 20;

function formatDuration(milliseconds) {
  const seconds = Math.max(0, Math.round(Number(milliseconds || 0) / 1000));
  return Math.floor(seconds / 60) + "m " + String(seconds % 60).padStart(2, "0") + "s";
}

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Recently" : new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(date);
}

function scoreMeta(score) {
  if (score <= 25) return { label: "Clean", className: styles.clean };
  if (score <= 60) return { label: "Moderate", className: styles.moderate };
  return { label: "Heavy", className: styles.heavy };
}

function ThemeIcon({ dark }) {
  return dark
    ? <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></svg>
    : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5 8.5 8.5 0 1 0 20.5 14.2Z" /></svg>;
}

export default function SessionsClient() {
  const router = useRouter();
  const [dark, setDark] = useState(false);
  const [profile, setProfile] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [resultFilter, setResultFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

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
        setSessions(Array.isArray(data.sessions) ? data.sessions : []);
      })
      .catch((reason) => setError(reason.message || "Your session history could not be loaded."))
      .finally(() => setLoading(false));
  }, [router]);

  useEffect(() => {
    const timeout = window.setTimeout(() => setQuery(searchInput.trim().toLowerCase()), 200);
    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [query, resultFilter, fromDate, toDate, sort]);

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

  const summary = useMemo(() => {
    const passed = sessions.filter((session) => session.result.status === "passed").length;
    const failed = sessions.length - passed;
    const average = sessions.length ? Math.round(sessions.reduce((total, session) => total + session.metrics.thrashingIndex, 0) / sessions.length) : 0;
    return { total: sessions.length, passed, failed, average };
  }, [sessions]);

  const filtered = useMemo(() => {
    const min = fromDate ? new Date(fromDate + "T00:00:00").getTime() : null;
    const max = toDate ? new Date(toDate + "T23:59:59").getTime() : null;
    const items = sessions.filter((session) => {
      const haystack = (session.challenge.title + " " + session.challenge.functionName).toLowerCase();
      const timestamp = new Date(session.createdAt).getTime();
      return (!query || haystack.includes(query))
        && (resultFilter === "all" || session.result.status === resultFilter)
        && (!min || timestamp >= min)
        && (!max || timestamp <= max);
    });
    return items.slice().sort((a, b) => {
      if (sort === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      if (sort === "low") return a.metrics.thrashingIndex - b.metrics.thrashingIndex;
      if (sort === "high") return b.metrics.thrashingIndex - a.metrics.thrashingIndex;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [fromDate, query, resultFilter, sessions, sort, toDate]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  if (loading) {
    return <AppShell active="" dark={dark} onToggle={toggleTheme} onSignOut={signOut}>
      <main className={styles.main}><div className={styles.loading}><i /><i /><i /><i /></div></main>
    </AppShell>;
  }

  if (error || !profile) {
    return <AppShell active="" dark={dark} onToggle={toggleTheme} onSignOut={signOut}>
      <main className={styles.main}><section className={styles.empty}><p>HISTORY</p><h1>Your history is unavailable.</h1><span>{error || "Please sign in again to view sessions."}</span><Link href="/signin">Sign in</Link></section></main>
    </AppShell>;
  }

  return <AppShell active="" profile={profile} dark={dark} onToggle={toggleTheme} onSignOut={signOut}>
    <main className={styles.main}>
      <section className={styles.content}>
        <header className={styles.header}>
          <div><p>HISTORY</p><h1>All sessions</h1><span>A complete record of every exercise you have attempted.</span></div>
          <div className={styles.headerActions}><button type="button" onClick={toggleTheme} aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}><ThemeIcon dark={dark} /></button><Link href="/dashboard">Back to dashboard &larr;</Link></div>
        </header>

        <section className={styles.filters}>
          <label className={styles.search}><span>Search</span><input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search exercises..." /></label>
          <div className={styles.resultFilters} role="group" aria-label="Result filter">{[["all", "All"], ["passed", "Passed"], ["failed", "Failed"]].map(([value, label]) => <button className={resultFilter === value ? styles.selected : ""} onClick={() => setResultFilter(value)} type="button" key={value}>{label}</button>)}</div>
          <label className={styles.date}><span>From</span><input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} /></label>
          <label className={styles.date}><span>To</span><input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} /></label>
          <label className={styles.sort}><span>Sort</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="low">Lowest Thrashing Index</option><option value="high">Highest Thrashing Index</option></select></label>
        </section>

        <section className={styles.stats}>
          <article><span>Total sessions</span><strong>{summary.total}</strong></article>
          <article><span>Passed</span><strong className={styles.clean}>{summary.passed}</strong></article>
          <article><span>Failed</span><strong className={styles.heavy}>{summary.failed}</strong></article>
          <article><span>Avg Thrash</span><strong className={scoreMeta(summary.average).className}>{summary.average}</strong></article>
        </section>

        {sessions.length === 0 ? <section className={styles.empty}><p>NO SESSIONS YET</p><h1>Your first report starts with one challenge.</h1><span>Complete your first challenge to see your session history here.</span><Link href="/challenge">Browse challenges &rarr;</Link></section> : visible.length ? <section className={styles.tableWrap}>
          <table>
            <thead><tr><th>Exercise</th><th>Date</th><th>Duration</th><th>Result</th><th>Thrash</th><th>Report</th></tr></thead>
            <tbody>{visible.map((session) => {
              const meta = scoreMeta(session.metrics.thrashingIndex);
              return <tr key={session.id}>
                <td><Link href={session.challenge.slug ? "/challenge/" + session.challenge.slug : "/challenge"} className={styles.exercise}>{session.challenge.functionName}</Link><small>{session.challenge.topic}</small></td>
                <td><time title={new Date(session.createdAt).toLocaleString()}>{formatDate(session.createdAt)}</time></td>
                <td>{formatDuration(session.durationMs)}</td>
                <td><button type="button" className={session.result.status === "passed" ? styles.passed : styles.failed} onClick={() => setResultFilter(session.result.status)}>{session.result.status.toUpperCase()}</button></td>
                <td><span className={meta.className}>{session.metrics.thrashingIndex} &middot; {meta.label}</span></td>
                <td><Link className={styles.reportLink} href={"/report/" + session.id}>&rarr; View</Link></td>
              </tr>;
            })}</tbody>
          </table>
        </section> : <section className={styles.empty}><p>NO MATCHES</p><h1>No sessions match your filters.</h1><button type="button" onClick={() => { setSearchInput(""); setResultFilter("all"); setFromDate(""); setToDate(""); setSort("newest"); }}>Clear filters</button></section>}

        {filtered.length > PAGE_SIZE && <nav className={styles.pagination} aria-label="Session history pagination"><button type="button" disabled={currentPage === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>&larr; Previous</button><span>Page {currentPage} of {totalPages}</span><button type="button" disabled={currentPage === totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>Next &rarr;</button></nav>}
      </section>
    </main>
  </AppShell>;
}
