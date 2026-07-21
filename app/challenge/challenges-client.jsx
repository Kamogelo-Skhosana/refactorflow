"use client";

import Link from "next/link";
import AppShell from "../components/app-shell";
import { useEffect, useMemo, useState } from "react";
import styles from "./challenges.module.css";

function Icon({ name, size = 16 }) {
  const icons = {
    dashboard: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    code: <><path d="m8 9-3 3 3 3M16 9l3 3-3 3M14 5l-4 14" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2 2-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V20h-2.86v-.09A1.7 1.7 0 0 0 10.94 18.35a1.7 1.7 0 0 0-1.88.34L9 18.75l-2-2 .06-.06A1.7 1.7 0 0 0 7.4 14.8 1.7 1.7 0 0 0 5.84 13.77h-.09v-2.86h.09A1.7 1.7 0 0 0 7.4 9.88 1.7 1.7 0 0 0 7.06 8L7 7.94l2-2 .06.06a1.7 1.7 0 0 0 1.88.34A1.7 1.7 0 0 0 11.97 4.8v-.09h2.86v.09a1.7 1.7 0 0 0 1.03 1.54A1.7 1.7 0 0 0 17.74 6l.06-.06 2 2-.06.06a1.7 1.7 0 0 0-.34 1.88 1.7 1.7 0 0 0 1.56 1.03h.09v2.86h-.09A1.7 1.7 0 0 0 19.4 15Z" /></>,
    search: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></>,
    searchOff: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4M8.5 8.5l5 5" /></>,
    clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3 2" /></>,
    checkCircle: <><circle cx="12" cy="12" r="8.5" fill="currentColor" stroke="currentColor" /><path d="m8.5 12 2.2 2.2 4.8-5.1" stroke="#ffffff" strokeWidth="2.2" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
    moon: <path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5 8.5 8.5 0 1 0 20.5 14.2Z" />,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></>,
    logout: <><path d="M10 17l5-5-5-5M15 12H3" /><path d="M21 19V5a2 2 0 0 0-2-2h-5" /></>,
  };

  return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{icons[name]}</svg>;
}

function difficultyFor(value) {
  const difficulty = String(value || "").toLowerCase();
  if (difficulty === "advanced" || difficulty === "hard") return "advanced";
  if (difficulty === "intermediate" || difficulty === "medium") return "intermediate";
  return "beginner";
}

function words(value) {
  return String(value || "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function functionName(challenge) {
  const match = String(challenge.starter_code || "").match(/^\s*def\s+([a-zA-Z_]\w*)\s*\(/m);
  return (match?.[1] || String(challenge.slug || "").replace(/-/g, "_")) + "()";
}

function topicFor(challenge) {
  return words(challenge.language) + " " + String.fromCharCode(8212) + " " + words(challenge.difficulty || "fundamentals");
}

function classification(score) {
  if (score <= 25) return "clean";
  if (score <= 60) return "moderate";
  return "heavy";
}

function Avatar({ profile }) {
  const initial = String(profile.name || profile.email || "R").trim().charAt(0).toUpperCase();
  return profile.avatarUrl
    ? <img className={styles.avatar} src={profile.avatarUrl} alt="" />
    : <span className={styles.avatar} aria-label={profile.name || "Profile"}>{initial}</span>;
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

function Sidebar({ profile, onSignOut }) {
  return <aside className={styles.sidebar}>
    <div>
      <Link className={styles.wordmark} href="/dashboard">RefactorFlow</Link>
      <nav className={styles.sidebarNav} aria-label="Primary navigation">
        <Link href="/dashboard"><Icon name="dashboard" />Dashboard</Link>
        <Link className={styles.activeNav} href="/challenge"><Icon name="code" />Challenges</Link>
        <Link href="/settings"><Icon name="settings" />Settings</Link>
      </nav>
    </div>
    <div className={styles.sidebarBottom}>
      <CarbonAd tier={profile.tier} />
      <Link className={styles.profileRow} href="/settings">
        <Avatar profile={profile} />
        <span><strong>{profile.name}</strong><small>{profile.tier === "free" ? "Free" : words(profile.tier)}</small></span>
        <Icon name="chevron" size={14} />
      </Link>
      <button className={styles.signOut} type="button" onClick={onSignOut}><Icon name="logout" size={14} />Sign out</button>
    </div>
  </aside>;
}

function MobileNav({ profile, dark, onToggle }) {
  return <header className={styles.mobileNav}>
    <Link className={styles.wordmark} href="/dashboard">RefactorFlow</Link>
    <nav aria-label="Primary navigation">
      <Link href="/dashboard" aria-label="Dashboard"><Icon name="dashboard" /></Link>
      <Link className={styles.activeNav} href="/challenge" aria-label="Challenges"><Icon name="code" /></Link>
      <Link href="/settings" aria-label="Settings"><Icon name="settings" /></Link>
    </nav>
    <div><Avatar profile={profile} /><ThemeButton dark={dark} onToggle={onToggle} /></div>
  </header>;
}

function Filters({ value, difficulty, onValueChange, onDifficultyChange }) {
  const filters = ["all", "beginner", "intermediate", "advanced"];

  return <div className={styles.filters}>
    <label className={styles.searchBox}>
      <Icon name="search" size={15} />
      <input value={value} onChange={(event) => onValueChange(event.target.value)} placeholder="Search exercises..." aria-label="Search exercises" />
    </label>
    <div className={styles.filterOptions} aria-label="Difficulty filter">
      {filters.map((item) => <button key={item} type="button" onClick={() => onDifficultyChange(item)} className={[styles.filterButton, difficulty === item ? styles["filter" + words(item).replace(/\s/g, "")] : ""].filter(Boolean).join(" ")}>
        {words(item)}
      </button>)}
    </div>
  </div>;
}

function ProgressBar({ completed, total }) {
  const percentage = total ? Math.round((completed / total) * 100) : 0;
  return <section className={styles.progressCard}>
    <strong>{completed} of {total} exercises completed</strong>
    <span className={styles.progressTrack}><i style={{ width: percentage + "%" }} /></span>
    <b>{percentage}%</b>
  </section>;
}

function ExerciseList({ challenges, completedIds, bestScores, onClear }) {
  const groups = challenges.reduce((result, challenge) => {
    const topic = topicFor(challenge);
    if (!result[topic]) result[topic] = [];
    result[topic].push(challenge);
    return result;
  }, {});

  if (!challenges.length) {
    return <section className={styles.emptyState}>
      <Icon name="searchOff" size={32} />
      <p>No exercises match your search.</p>
      <button type="button" onClick={onClear}>Clear filters</button>
    </section>;
  }

  return <div className={styles.topicList}>
    {Object.entries(groups).map(([topic, items]) => <section className={styles.topicSection} key={topic}>
      <header className={styles.topicHeader}><p>{topic}</p><span /></header>
      <div className={styles.exerciseRows}>
        {items.map((challenge) => {
          const completed = completedIds.has(challenge.id);
          const score = bestScores[challenge.id];
          const scoreTone = score === undefined ? "" : classification(score);
          const difficulty = difficultyFor(challenge.difficulty);
          const number = String(challenge.position).padStart(2, "0");

          return <Link className={[styles.exerciseRow, completed ? styles.completed : ""].filter(Boolean).join(" ")} href={"/challenge/" + challenge.slug} key={challenge.id} aria-label={"Open " + challenge.title}>
            <span className={styles.exerciseNumber}>{completed ? <Icon name="checkCircle" size={17} /> : number}</span>
            <span className={styles.exerciseInfo}><strong>{challenge.title}</strong><small>{functionName(challenge)}</small></span>
            <span className={[styles.difficultyBadge, styles[difficulty]].join(" ")}>{difficulty}</span>
            <span className={styles.timed}><Icon name="clock" size={12} />Timed</span>
            {score !== undefined && <span className={[styles.thrashingBadge, styles[scoreTone]].join(" ")}>TI: {score}</span>}
            <Icon name="chevron" size={16} />
          </Link>;
        })}
      </div>
    </section>)}
  </div>;
}

export default function ChallengesClient({ challenges }) {
  const [dark, setDark] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("all");
  const [progress, setProgress] = useState({
    profile: { name: "there", email: "", tier: "free", avatarUrl: null },
    completedExerciseIds: [],
    bestThrashingByExercise: {},
  });

  useEffect(() => {
    const preferredDark = window.localStorage.getItem("refactorflow-theme") === "dark" || document.documentElement.classList.contains("dark");
    setDark(preferredDark);

    const timer = window.setTimeout(() => setSearch(searchInput.trim().toLowerCase()), 200);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let active = true;

    async function loadProgress() {
      const accessToken = window.localStorage.getItem("refactorflow-access-token");
      if (!accessToken) return;

      try {
        const response = await fetch("/api/challenges/progress", {
          headers: { Authorization: "Bearer " + accessToken },
          cache: "no-store",
        });
        const data = await response.json().catch(() => ({}));
        if (response.ok && active) setProgress(data);
      } catch {
        // The public exercise list remains available if progress cannot be refreshed.
      }
    }

    loadProgress();
    return () => { active = false; };
  }, []);

  const preparedChallenges = useMemo(() => challenges.map((challenge, index) => ({ ...challenge, position: index + 1 })), [challenges]);
  const filteredChallenges = useMemo(() => preparedChallenges.filter((challenge) => {
    const functionLabel = functionName(challenge).toLowerCase();
    const matchesSearch = !search || String(challenge.title).toLowerCase().includes(search) || functionLabel.includes(search);
    return matchesSearch && (difficulty === "all" || difficultyFor(challenge.difficulty) === difficulty);
  }), [preparedChallenges, search, difficulty]);

  const completedIds = useMemo(() => new Set(progress.completedExerciseIds || []), [progress.completedExerciseIds]);
  const completedCount = useMemo(() => preparedChallenges.filter((challenge) => completedIds.has(challenge.id)).length, [preparedChallenges, completedIds]);

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
    window.location.assign("/signin");
  }

  function clearFilters() {
    setSearchInput("");
    setDifficulty("all");
  }

  return <AppShell className={[styles.page, dark ? styles.dark : ""].filter(Boolean).join(" ")} profile={progress.profile} active="challenges" dark={dark} onToggle={toggleTheme} onSignOut={signOut}>
    <section className={styles.mainPanel}>
      <div className={styles.mainInner}>
        <header className={styles.pageHeader}>
          <div>
            <p className={styles.eyebrow}>Exercises</p>
            <h1>Choose a challenge.</h1>
            <p>Each exercise is timed. Your keystrokes, pauses, and rewrites are tracked throughout - not just whether you pass.</p>
          </div>
          <ThemeButton dark={dark} onToggle={toggleTheme} />
        </header>
        <Filters value={searchInput} difficulty={difficulty} onValueChange={setSearchInput} onDifficultyChange={setDifficulty} />
        <ProgressBar completed={completedCount} total={preparedChallenges.length} />
        <ExerciseList challenges={filteredChallenges} completedIds={completedIds} bestScores={progress.bestThrashingByExercise || {}} onClear={clearFilters} />
      </div>
    </section>
  </AppShell>;
}
