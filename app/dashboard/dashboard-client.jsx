"use client";

import Link from "next/link";
import AppShell from "../components/app-shell";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import styles from "./dashboard.module.css";

function Icon({ name, size = 16 }) {
  const icons = {
    dashboard: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    code: <><path d="m8 9-3 3 3 3M16 9l3 3-3 3M14 5l-4 14" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2 2-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V20h-2.86v-.09A1.7 1.7 0 0 0 10.94 18.35a1.7 1.7 0 0 0-1.88.34L9 18.75l-2-2 .06-.06A1.7 1.7 0 0 0 7.4 14.8 1.7 1.7 0 0 0 5.84 13.77h-.09v-2.86h.09A1.7 1.7 0 0 0 7.4 9.88 1.7 1.7 0 0 0 7.06 8L7 7.94l2-2 .06.06a1.7 1.7 0 0 0 1.88.34A1.7 1.7 0 0 0 11.97 4.8v-.09h2.86v.09a1.7 1.7 0 0 0 1.03 1.54A1.7 1.7 0 0 0 17.74 6l.06-.06 2 2-.06.06a1.7 1.7 0 0 0-.34 1.88 1.7 1.7 0 0 0 1.56 1.03h.09v2.86h-.09A1.7 1.7 0 0 0 19.4 15Z" /></>,
    activity: <path d="M3 12h4l2-7 4 14 2-7h6" />,
    check: <><circle cx="12" cy="12" r="9" /><path d="m8 12 2.5 2.5L16 9" /></>,
    zap: <path d="m13 2-9 12h7l-1 8 9-12h-7l1-8Z" />,
    flame: <path d="M12 22c4.1 0 7-2.7 7-6.8 0-2.9-1.7-5.1-4-7.2.1 2-1.1 3.7-2.5 4.7.3-3.5-1.7-6.7-4.5-8.7.2 3.5-2.5 5.8-3.3 8.9C3.8 16.9 6.5 22 12 22Z" />,
    trend: <><path d="m4 16 5-5 3 3 7-8" /><path d="M14 6h5v5" /></>,
    sparkles: <><path d="m12 3 1.4 4.6L18 9l-4.6 1.4L12 15l-1.4-4.6L6 9l4.6-1.4L12 3Z" /><path d="m5 16 .7 2.3L8 19l-2.3.7L5 22l-.7-2.3L2 19l2.3-.7L5 16Z" /><path d="m19 14 .7 2.3L22 17l-2.3.7L19 20l-.7-2.3L16 17l2.3-.7L19 14Z" /></>,
    logout: <><path d="M10 17l5-5-5-5M15 12H3" /><path d="M21 19V5a2 2 0 0 0-2-2h-5" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></>,
    moon: <path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5 8.5 8.5 0 1 0 20.5 14.2Z" />,
    brain: <><path d="M9.5 4.2A3.2 3.2 0 0 0 4 6.5a3 3 0 0 0 .5 5.8 3.4 3.4 0 0 0 2.6 5.7c1.1 0 1.9-.5 2.6-1.2M14.5 4.2A3.2 3.2 0 0 1 20 6.5a3 3 0 0 1-.5 5.8 3.4 3.4 0 0 1-2.6 5.7c-1.1 0-1.9-.5-2.6-1.2M12 3v18M8 8.5c1.1 0 2 .9 2 2M16 8.5c-1.1 0-2 .9-2 2" /></>,
    refresh: <><path d="M20 11a8 8 0 0 0-14.9-3L3 10" /><path d="M3 4v6h6M4 13a8 8 0 0 0 14.9 3L21 14" /><path d="M21 20v-6h-6" /></>,
  };

  return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{icons[name]}</svg>;
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(value));
}

function formatDuration(milliseconds) {
  const seconds = Math.max(0, Math.round((milliseconds || 0) / 1000));
  const minutes = Math.floor(seconds / 60);
  return minutes ? minutes + "m " + String(seconds % 60).padStart(2, "0") + "s" : seconds + "s";
}

function classification(score) {
  if (score === null || score === undefined) return { label: "No data", color: "muted" };
  if (score <= 25) return { label: "Clean", color: "clean" };
  if (score <= 60) return { label: "Moderate", color: "moderate" };
  return { label: "Heavy", color: "heavy" };
}

function greetingFor(name) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  return greeting + ", " + name + ".";
}

function Avatar({ profile }) {
  const first = (profile.name || profile.email || "R").trim().charAt(0).toUpperCase();
  return profile.avatarUrl
    ? <img className={styles.avatar} src={profile.avatarUrl} alt="" />
    : <span className={styles.avatar} aria-label={profile.name}>{first}</span>;
}

function CarbonAd({ tier }) {
  const serve = process.env.NEXT_PUBLIC_CARBON_ADS_SERVE;

  useEffect(() => {
    if (tier !== "free" || !serve || document.getElementById("carbonads-script")) return;
    const script = document.createElement("script");
    script.id = "carbonads-script";
    script.async = true;
    script.src = "https://cdn.carbonads.com/carbon.js?serve=" + encodeURIComponent(serve) + "&placement=refactorflow";
    document.getElementById("carbonads")?.appendChild(script);
  }, [serve, tier]);

  if (tier !== "free") return null;

  return <section className={styles.adSection}>
    <p>Advertisement</p>
    <div className={styles.adContainer} id="carbonads">
      {!serve && <span>Developer tools, thoughtfully selected.</span>}
    </div>
  </section>;
}

function ThemeButton({ dark, onToggle }) {
  return <button className={styles.themeButton} type="button" onClick={onToggle} aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}>
    <Icon name={dark ? "sun" : "moon"} size={18} />
  </button>;
}

function Sidebar({ profile, dark, onToggle, onSignOut }) {
  return <aside className={styles.sidebar}>
    <div>
      <Link className={styles.wordmark} href="/">RefactorFlow</Link>
      <nav className={styles.sidebarNav} aria-label="Primary navigation">
        <Link className={styles.activeNav} href="/dashboard"><Icon name="dashboard" />Dashboard</Link>
        <Link href="/challenge"><Icon name="code" />Challenges</Link>
        <Link href="/settings"><Icon name="settings" />Settings</Link>
      </nav>
    </div>
    <div className={styles.sidebarBottom}>
      <CarbonAd tier={profile.tier} />
      <Link className={styles.profileRow} href="/settings">
        <Avatar profile={profile} />
        <span><strong>{profile.name}</strong><small>{profile.tier === "free" ? "Free" : profile.tier === "pro" ? "Pro" : "Team"}</small></span>
        <Icon name="chevron" size={14} />
      </Link>
      <button className={styles.signOut} type="button" onClick={onSignOut}><Icon name="logout" size={14} />Sign out</button>
    </div>
  </aside>;
}

function MobileNav({ profile, dark, onToggle }) {
  return <header className={styles.mobileNav}>
    <Link className={styles.wordmark} href="/">RefactorFlow</Link>
    <nav aria-label="Primary navigation">
      <Link className={styles.activeNav} href="/dashboard" aria-label="Dashboard"><Icon name="dashboard" /></Link>
      <Link href="/challenge" aria-label="Challenges"><Icon name="code" /></Link>
      <Link href="/settings" aria-label="Settings"><Icon name="settings" /></Link>
    </nav>
    <div><Avatar profile={profile} /><ThemeButton dark={dark} onToggle={onToggle} /></div>
  </header>;
}

function ChartTooltip({ active, payload, dark }) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  const category = classification(data.score);
  return <div className={[styles.chartTooltip, dark ? styles.chartTooltipDark : ""].filter(Boolean).join(" ")}>
    <p>{formatDate(data.date)}</p>
    <strong>{data.exercise}</strong>
    <b className={styles[category.color]}>{data.score}</b>
    <small className={styles[category.color]}>{category.label}</small>
  </div>;
}

function TrendCard({ trend, dark }) {
  if (trend.length < 3) {
    return <section className={styles.card + " " + styles.trendCard}>
      <div className={styles.cardHeader}><div><h2>Thrashing Index - Last 30 Sessions</h2><p>Lower is better. Trending down means you are improving.</p></div></div>
      <div className={styles.emptyTrend}><Icon name="trend" size={32} /><p>Complete 3 or more exercises to see your Thrashing Index trend.</p><Link href="/challenge">Start a challenge &rarr;</Link></div>
    </section>;
  }

  const chartData = trend.map((point) => ({ ...point, label: formatDate(point.date) }));
  return <section className={styles.card + " " + styles.trendCard}>
    <div className={styles.cardHeader}>
      <div><h2>Thrashing Index - Last 30 Sessions</h2><p>Lower is better. Trending down means you are improving.</p></div>
      <div className={styles.legend}><span><i className={styles.cleanDot} />Clean 0-25</span><span><i className={styles.moderateDot} />Moderate 26-60</span><span><i className={styles.heavyDot} />Heavy 61-100</span></div>
    </div>
    <div className={styles.chartArea}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <ReferenceArea y1={0} y2={25} fill="rgba(16,185,129,0.06)" strokeOpacity={0} />
          <ReferenceArea y1={25} y2={60} fill="rgba(245,158,11,0.04)" strokeOpacity={0} />
          <ReferenceArea y1={60} y2={100} fill="rgba(239,68,68,0.04)" strokeOpacity={0} />
          <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} interval="preserveStartEnd" />
          <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} />
          <Tooltip content={<ChartTooltip dark={dark} />} cursor={{ stroke: "rgba(16,185,129,0.25)", strokeWidth: 1 }} />
          <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2} dot={{ r: 4, fill: "#10b981", stroke: dark ? "#1a1a1a" : "#ffffff", strokeWidth: 2 }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </section>;
}

function MetricCard({ icon, label, value, detail, tone }) {
  return <article className={styles.metricCard}>
    <p><Icon name={icon} />{label}</p>
    <strong className={tone ? styles[tone] : ""}>{value}</strong>
    {detail && <small className={detail.tone ? styles[detail.tone] : ""}>{detail.text}</small>}
  </article>;
}

function StatsRow({ totals, hasSessions }) {
  const thrash = classification(totals.averageThrashing);
  return <section className={styles.statsGrid}>
    <MetricCard icon="activity" label="Sessions" value={hasSessions ? totals.sessions : "-"} detail={null} />
    <MetricCard icon="check" label="Passed" value={hasSessions ? totals.passed : "-"} detail={null} />
    <MetricCard icon="zap" label="Avg Thrash" value={hasSessions && totals.averageThrashing !== null ? totals.averageThrashing : "-"} tone={hasSessions && totals.averageThrashing !== null ? thrash.color : ""} detail={hasSessions && totals.averageThrashing !== null ? { text: thrash.label, tone: thrash.color } : null} />
    <MetricCard icon="flame" label="Streak" value={hasSessions ? totals.currentStreak + " " + (totals.currentStreak === 1 ? "day" : "days") : "-"} tone={totals.currentStreak >= 3 ? "moderate" : ""} detail={hasSessions ? { text: "Best: " + totals.bestStreak + " days" } : null} />
  </section>;
}

function RecentSessions({ sessions, onOpenReport }) {
  if (!sessions.length) {
    return <section className={styles.card + " " + styles.sessionsCard}>
      <div className={styles.cardHeader}><h2>Recent Sessions</h2><Link href="/sessions">View all &rarr;</Link></div>
      <div className={styles.emptySessions}><Icon name="code" size={32} /><p>No sessions yet. Complete your first challenge.</p><Link href="/challenge">Browse challenges &rarr;</Link></div>
    </section>;
  }

  return <section className={styles.card + " " + styles.sessionsCard}>
    <div className={styles.cardHeader}><h2>Recent Sessions</h2><Link href="/sessions">View all &rarr;</Link></div>
    <div className={styles.tableWrap}><table><thead><tr><th>Exercise</th><th>Date</th><th>Time</th><th>Result</th><th>Thrash</th></tr></thead><tbody>
      {sessions.map((session) => {
        const score = classification(session.thrashingIndex);
        return <tr key={session.id} role="link" tabIndex={0} onClick={() => onOpenReport(session.id)} onKeyDown={(event) => { if (event.key === "Enter") onOpenReport(session.id); }}>
          <td><strong>{session.title}</strong><small>{session.topic}</small></td>
          <td>{formatDate(session.createdAt)}</td>
          <td>{formatDuration(session.durationMs)}</td>
          <td><span className={session.passed ? styles.passedBadge : styles.failedBadge}>{session.passed ? "PASSED" : "FAILED"}</span></td>
          <td className={styles[score.color]}>{session.thrashingIndex === null ? "-" : session.thrashingIndex}</td>
        </tr>;
      })}
    </tbody></table></div>
  </section>;
}

function RecommendedChallenge({ challenge }) {
  if (!challenge) {
    return <section className={styles.card + " " + styles.recommendedCard}><div className={styles.allDone}><Icon name="check" size={32} /><strong>You&apos;ve completed all current challenges.</strong><p>More exercises coming soon.</p></div></section>;
  }

  const difficulty = challenge.difficulty === "fundamentals" ? "beginner" : challenge.difficulty || "beginner";
  const descriptionText = String(challenge.description || "");
  const description = descriptionText.length > 120 ? descriptionText.slice(0, 120).trim() + "..." : descriptionText;
  return <section className={styles.card + " " + styles.recommendedCard}>
    <p className={styles.upNext}>Up next</p>
    <span className={styles.topicBadge}>{challenge.language === "python" ? "Python Fundamentals" : challenge.language}</span>
    <h2>{challenge.title}</h2>
    <code>{challenge.slug.replaceAll("-", "_")}()</code>
    <p className={styles.challengeDescription}>{description}</p>
    <span className={[styles.difficulty, styles[difficulty]].filter(Boolean).join(" ")}>{difficulty}</span>
    <div className={styles.cardDivider} />
    <Link className={styles.startButton} href={"/challenge/" + challenge.slug}>Start challenge <Icon name="arrow" size={14} /></Link>
  </section>;
}

function LevelProgress({ totals }) {
  const progress = totals.nextLevelXp > totals.currentLevelFloor ? Math.min(100, ((totals.xp - totals.currentLevelFloor) / (totals.nextLevelXp - totals.currentLevelFloor)) * 100) : 100;
  const iconForBadge = { first_session: "zap", first_pass: "check", clean_coder: "sparkles", streak_7: "flame", no_hints: "brain", comeback: "refresh" };
  return <section className={styles.card + " " + styles.levelCard}>
    <div className={styles.levelInfo}><span className={styles.levelBadge}>L{totals.level}</span><p><strong>Level {totals.level}</strong><small>{Math.max(0, totals.nextLevelXp - totals.xp)} XP to Level {totals.level + 1}</small></p></div>
    <div className={styles.xpProgress}><p>{totals.xp} / {totals.nextLevelXp} XP</p><span><i style={{ width: progress + "%" }} /></span></div>
    <div className={styles.badges}><p>Recent badges</p><div>{totals.badges.length ? totals.badges.map((badge) => <span title={badge.label} key={badge.key}><Icon name={iconForBadge[badge.key] || "sparkles"} /></span>) : <small>No badges yet</small>}</div></div>
  </section>;
}

function WelcomeBanner() {
  return <section className={styles.welcomeBanner}><Icon name="sparkles" size={24} /><div><strong>Welcome to RefactorFlow</strong><p>Complete your first exercise to start building your behavioral profile. We&apos;ll track your Thrashing Index, pause patterns, and keystroke tape.</p></div><Link className={styles.startButton} href="/challenge">Start first challenge</Link></section>;
}

function DashboardSkeleton() {
  return <div className={styles.loadingContent}>
    <div className={styles.skeletonHeading} />
    <div className={styles.skeletonStats}>{[1, 2, 3, 4].map((item) => <div key={item}><i /><b /><small /></div>)}</div>
    <div className={styles.skeletonChart} />
    <div className={styles.skeletonBottom}><div /><div /></div>
  </div>;
}

export default function DashboardClient() {
  const router = useRouter();
  const [dark, setDark] = useState(false);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const preferredDark = window.localStorage.getItem("refactorflow-theme") === "dark" || document.documentElement.classList.contains("dark");
    setDark(preferredDark);

    let active = true;
    async function loadDashboard() {
      const accessToken = window.localStorage.getItem("refactorflow-access-token");
      if (!accessToken) {
        if (active) {
          setError("Please sign in to view your dashboard.");
          setLoading(false);
        }
        return;
      }

      try {
        const response = await fetch("/api/dashboard", { headers: { Authorization: "Bearer " + accessToken }, cache: "no-store" });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Your dashboard could not be loaded.");
        if (active) setDashboard(data);
      } catch (loadError) {
        if (active) setError(loadError.message || "Your dashboard could not be loaded.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadDashboard();
    return () => { active = false; };
  }, []);

  function toggleTheme() {
    const nextDark = !dark;
    setDark(nextDark);
    document.documentElement.classList.toggle("dark", nextDark);
    window.localStorage.setItem("refactorflow-theme", nextDark ? "dark" : "light");
    window.dispatchEvent(new Event("refactorflow-theme-change"));
  }

  async function signOut() {
    const accessToken = window.localStorage.getItem("refactorflow-access-token");
    if (accessToken) {
      await fetch("/api/auth/signout", { method: "POST", headers: { Authorization: "Bearer " + accessToken } }).catch(() => undefined);
    }
    ["refactorflow-access-token", "refactorflow-email", "refactorflow-show-name-prompt"].forEach((key) => window.localStorage.removeItem(key));
    router.replace("/signin");
  }

  const profile = dashboard?.profile || { name: "there", email: "", tier: "free", avatarUrl: null };

  return <AppShell className={[styles.page, dark ? styles.dark : ""].filter(Boolean).join(" ")} profile={profile} active="dashboard" dark={dark} onToggle={toggleTheme} onSignOut={signOut}>
    <section className={styles.mainPanel}>
      {loading ? <DashboardSkeleton /> : error ? <div className={styles.errorState}><Icon name="trend" size={32} /><h1>Dashboard unavailable.</h1><p>{error}</p><Link className={styles.startButton} href="/signin">Sign in</Link></div> : <div className={styles.mainInner}>
        <header className={styles.pageHeader}><div><h1>{greetingFor(profile.name)}</h1><p>Here&apos;s how your coding behavior is trending.</p></div><div><ThemeButton dark={dark} onToggle={toggleTheme} /><Link className={styles.startButton} href="/challenge">Start a challenge <Icon name="arrow" size={14} /></Link></div></header>
        {!dashboard.totals.sessions && <WelcomeBanner />}
        <StatsRow totals={dashboard.totals} hasSessions={Boolean(dashboard.totals.sessions)} />
        <TrendCard trend={dashboard.trend} dark={dark} />
        <section className={styles.twoColumn}><RecentSessions sessions={dashboard.sessions} onOpenReport={(id) => router.push("/report/" + id)} /><RecommendedChallenge challenge={dashboard.recommended} /></section>
        <LevelProgress totals={dashboard.totals} />
        <section className={styles.quickActions}><Link href="/challenge"><Icon name="code" size={14} />Browse all challenges</Link><Link href="/settings"><Icon name="settings" size={14} />Settings</Link></section>
      </div>}
    </section>
  </AppShell>;
}
