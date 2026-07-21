"use client";

import Link from "next/link";
import { useEffect } from "react";
import styles from "./app-shell.module.css";

function Icon({ name, size = 16 }) {
  const icons = {
    dashboard: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    code: <><path d="m8 9-3 3 3 3M16 9l3 3-3 3M14 5l-4 14" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2 2-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V20h-2.86v-.09A1.7 1.7 0 0 0 10.94 18.35a1.7 1.7 0 0 0-1.88.34L9 18.75l-2-2 .06-.06A1.7 1.7 0 0 0 7.4 14.8 1.7 1.7 0 0 0 5.84 13.77h-.09v-2.86h.09A1.7 1.7 0 0 0 7.4 9.88 1.7 1.7 0 0 0 7.06 8L7 7.94l2-2 .06.06a1.7 1.7 0 0 0 1.88.34A1.7 1.7 0 0 0 11.97 4.8v-.09h2.86v.09a1.7 1.7 0 0 0 1.03 1.54A1.7 1.7 0 0 0 17.74 6l.06-.06 2 2-.06.06a1.7 1.7 0 0 0-.34 1.88 1.7 1.7 0 0 0 1.56 1.03h.09v2.86h-.09A1.7 1.7 0 0 0 19.4 15Z" /></>,
    history: <><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v5h5" /><path d="M12 7v5l3.5 2" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
    moon: <path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5 8.5 8.5 0 1 0 20.5 14.2Z" />,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></>,
    logout: <><path d="M10 17l5-5-5-5M15 12H3" /><path d="M21 19V5a2 2 0 0 0-2-2h-5" /></>,
  };

  return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{icons[name]}</svg>;
}

function words(value) {
  return String(value || "").replace(/[-_]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
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

function Navigation({ active, compact = false }) {
  const links = [
    { key: "dashboard", href: "/dashboard", label: "Dashboard", icon: "dashboard" },
    { key: "challenges", href: "/challenge", label: "Challenges", icon: "code" },
    { key: "settings", href: "/settings", label: "Settings", icon: "settings" },
  ];

  return <nav className={compact ? styles.mobileLinks : styles.sidebarNav} aria-label="Primary navigation">
    {links.map((item) => <Link key={item.key} className={active === item.key ? styles.activeNav : ""} href={item.href} aria-label={compact ? item.label : undefined}>
      <Icon name={item.icon} />{!compact && item.label}
    </Link>)}
  </nav>;
}

function Sidebar({ profile, active, onSignOut }) {
  return <aside className={styles.sidebar}>
    <div>
      <Link className={styles.wordmark} href="/dashboard">RefactorFlow</Link>
      <Navigation active={active} />
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

function MobileNav({ profile, active, dark, onToggle }) {
  return <header className={styles.mobileNav}>
    <Link className={styles.wordmark} href="/dashboard">RefactorFlow</Link>
    <Navigation active={active} compact />
    <div><Avatar profile={profile} /><ThemeButton dark={dark} onToggle={onToggle} /></div>
  </header>;
}

export default function AppShell({ children, className = "", profile, active, dark, onToggle, onSignOut }) {
  const safeProfile = profile || { name: "there", email: "", tier: "free", avatarUrl: null };

  return <main className={[styles.shell, dark ? styles.dark : "", className].filter(Boolean).join(" ")}>
    <Sidebar profile={safeProfile} active={active} onSignOut={onSignOut} />
    <MobileNav profile={safeProfile} active={active} dark={dark} onToggle={onToggle} />
    {children}
  </main>;
}
