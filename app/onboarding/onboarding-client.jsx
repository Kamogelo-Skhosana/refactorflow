"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./onboarding.module.css";

const goals = [
  { id: "habits", label: "Build steadier coding habits", note: "I want a clearer practice rhythm." },
  { id: "interviews", label: "Prepare for technical interviews", note: "I want to understand my problem-solving process." },
  { id: "growth", label: "Sharpen my fundamentals", note: "I want better feedback after each attempt." },
];

export default function OnboardingClient() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("habits");
  const [nudges, setNudges] = useState(true);
  const [dark, setDark] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const accessToken = window.localStorage.getItem("refactorflow-access-token");
    const preferredDark = window.localStorage.getItem("refactorflow-theme") === "dark" || document.documentElement.classList.contains("dark");
    setDark(preferredDark);

    if (!accessToken) {
      router.replace("/signin");
      return;
    }

    fetch("/api/profile", { headers: { Authorization: "Bearer " + accessToken }, cache: "no-store" })
      .then((response) => response.json().then((data) => ({ response, data })))
      .then(({ response, data }) => {
        if (!response.ok) throw new Error(data.error || "Your profile could not be loaded.");
        setName(window.localStorage.getItem("refactorflow-display-name") || data.profile?.name || "");
        setNudges(data.profile?.nudgesEnabled !== false);
      })
      .catch((reason) => setError(reason.message || "Your setup could not be loaded."))
      .finally(() => setLoading(false));
  }, [router]);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    window.localStorage.setItem("refactorflow-theme", next ? "dark" : "light");
    window.dispatchEvent(new Event("refactorflow-theme-change"));
  }

  async function saveProfile(nextStep) {
    const accessToken = window.localStorage.getItem("refactorflow-access-token");
    if (!accessToken) {
      router.replace("/signin");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + accessToken },
        body: JSON.stringify({ displayName: name.trim(), nudgesEnabled: nudges }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Your preferences could not be saved.");
      window.localStorage.setItem("refactorflow-display-name", data.profile?.name || name.trim());
      window.localStorage.setItem("refactorflow-learning-goal", goal);
      if (nextStep) {
        setStep(nextStep);
      } else {
        window.localStorage.removeItem("refactorflow-onboarding-pending");
        window.localStorage.removeItem("refactorflow-show-name-prompt");
        router.replace("/dashboard");
      }
    } catch (reason) {
      setError(reason.message || "Your preferences could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <main className={[styles.page, dark ? styles.dark : ""].filter(Boolean).join(" ")}><div className={styles.loading}>Preparing your practice space...</div></main>;

  return <main className={[styles.page, dark ? styles.dark : ""].filter(Boolean).join(" ")}>
    <header className={styles.header}>
      <Link className={styles.wordmark} href="/">Refactor<span>Flow</span></Link>
      <button type="button" className={styles.theme} onClick={toggleTheme}>{dark ? "Light" : "Dark"} mode</button>
    </header>

    <section className={styles.wrap}>
      <aside className={styles.intro}>
        <p>YOUR PRACTICE SPACE</p>
        <h1>Make each<br /><em>attempt count.</em></h1>
        <span>RefactorFlow starts with your process, not a score.</span>
        <div className={styles.steps}>{[1, 2, 3].map((number) => <i className={number <= step ? styles.complete : ""} key={number}><b>{String(number).padStart(2, "0")}</b><small>{number === 1 ? "Profile" : number === 2 ? "Focus" : "Preferences"}</small></i>)}</div>
      </aside>

      <section className={styles.card}>
        <p className={styles.count}>Step {step} of 3</p>
        {step === 1 && <>
          <h2>What should we call you?</h2>
          <p>This name will appear on your dashboard and practice reports.</p>
          <label htmlFor="onboarding-name">Display name</label>
          <input id="onboarding-name" value={name} onChange={(event) => setName(event.target.value)} maxLength="100" placeholder="Your name" autoComplete="name" />
          <button className={styles.primary} type="button" onClick={() => saveProfile(2)} disabled={!name.trim() || saving}>{saving ? "Saving..." : "Continue"} <span>&rarr;</span></button>
        </>}
        {step === 2 && <>
          <h2>What brings you here?</h2>
          <p>Choose a starting point. You can change your focus anytime.</p>
          <div className={styles.goals}>
            {goals.map((item) => <button type="button" onClick={() => setGoal(item.id)} className={goal === item.id ? styles.goalSelected : ""} key={item.id}><strong>{item.label}</strong><span>{item.note}</span><i>{goal === item.id ? "&#10003;" : ""}</i></button>)}
          </div>
          <div className={styles.actions}><button className={styles.back} type="button" onClick={() => setStep(1)}>Back</button><button className={styles.primary} type="button" onClick={() => setStep(3)}>Continue <span>&rarr;</span></button></div>
        </>}
        {step === 3 && <>
          <h2>Choose your coaching style.</h2>
          <p>Contextual nudges can help when you get stuck. They are always optional.</p>
          <button className={styles.preference} type="button" onClick={() => setNudges((value) => !value)}><span><strong>Practice nudges</strong><small>Gentle guidance during a challenge</small></span><i className={nudges ? styles.switchOn : ""}><b /></i></button>
          <div className={styles.ready}><strong>Ready when you are.</strong><p>Start with a challenge. We will turn the work into feedback you can use.</p></div>
          <div className={styles.actions}><button className={styles.back} type="button" onClick={() => setStep(2)}>Back</button><button className={styles.primary} type="button" onClick={() => saveProfile(0)} disabled={saving}>{saving ? "Finishing..." : "Enter RefactorFlow"} <span>&rarr;</span></button></div>
        </>}
        {error && <p className={styles.error} role="alert">{error}</p>}
      </section>
    </section>
  </main>;
}
