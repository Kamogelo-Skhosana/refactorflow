"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./onboarding.module.css";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false, loading: () => <div className={styles.editorLoading}>Loading editor...</div> });
const tapeDemo = "def pseudo_range(n):\n    for number in range(1, n + 1):\n        print(number)";

function ThemeIcon({ dark }) {
  return dark
    ? <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></svg>
    : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5 8.5 8.5 0 1 1 20.5 14.2Z" /></svg>;
}

function SignalCard({ title, copy, mark }) {
  return <article className={styles.signalCard}><i>{mark}</i><strong>{title}</strong><span>{copy}</span></article>;
}

function firstName(name) {
  return String(name || "").trim().split(/\s+/)[0] || "";
}

function formatTime(seconds) {
  return String(Math.floor(seconds / 60)).padStart(2, "0") + ":" + String(seconds % 60).padStart(2, "0");
}

function scoreMeta(score) {
  if (score <= 25) return { label: "Clean", className: styles.clean };
  if (score <= 60) return { label: "Moderate", className: styles.moderate };
  return { label: "Heavy", className: styles.heavy };
}

export default function OnboardingClient() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState(null);
  const [challenge, setChallenge] = useState(null);
  const [dark, setDark] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [demoText, setDemoText] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [code, setCode] = useState("");
  const [tape, setTape] = useState("");
  const [keystrokes, setKeystrokes] = useState(0);
  const [backspaces, setBackspaces] = useState(0);
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [sessionId, setSessionId] = useState("");
  const previousCode = useRef("");

  useEffect(() => {
    let mounted = true;
    const token = window.localStorage.getItem("refactorflow-access-token");
    const preferredDark = window.localStorage.getItem("refactorflow-theme") === "dark" || document.documentElement.classList.contains("dark");
    setDark(preferredDark);
    if (!token) {
      router.replace("/signin");
      return () => { mounted = false; };
    }

    Promise.all([
      fetch("/api/profile", { headers: { Authorization: "Bearer " + token }, cache: "no-store" }),
      fetch("/api/onboarding/challenge", { headers: { Authorization: "Bearer " + token }, cache: "no-store" }),
    ]).then(async ([profileResponse, challengeResponse]) => {
      const profileData = await profileResponse.json().catch(() => ({}));
      const challengeData = await challengeResponse.json().catch(() => ({}));
      if (!profileResponse.ok) throw new Error(profileData.error || "Your profile could not be loaded.");
      if (profileData.profile?.onboarded) {
        router.replace("/dashboard");
        return;
      }
      if (!challengeResponse.ok) throw new Error(challengeData.error || "The onboarding exercise could not be loaded.");
      if (!mounted) return;
      setProfile(profileData.profile);
      setChallenge(challengeData.challenge);
      setCode(challengeData.challenge.starter_code);
      previousCode.current = challengeData.challenge.starter_code;
    }).catch((reason) => {
      if (mounted) setError(reason.message || "Onboarding could not be loaded.");
    }).finally(() => {
      if (mounted) setLoading(false);
    });

    return () => { mounted = false; };
  }, [router]);

  useEffect(() => {
    if (step !== 2 || demoText.length >= tapeDemo.length) return undefined;
    const timeout = window.setTimeout(() => setDemoText(tapeDemo.slice(0, demoText.length + 1)), 80);
    return () => window.clearTimeout(timeout);
  }, [demoText, step]);

  useEffect(() => {
    if (step !== 3 || result?.status === "passed") return undefined;
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [result?.status, step]);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    window.localStorage.setItem("refactorflow-theme", next ? "dark" : "light");
    window.dispatchEvent(new Event("refactorflow-theme-change"));
  }

  async function finish() {
    const token = window.localStorage.getItem("refactorflow-access-token");
    if (!token) {
      router.replace("/signin");
      return;
    }
    try {
      const response = await fetch("/api/profile", { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: "Bearer " + token }, body: JSON.stringify({ onboarded: true }) });
      if (!response.ok) throw new Error("Your onboarding state could not be saved.");
      window.localStorage.removeItem("refactorflow-onboarding-pending");
      router.replace("/dashboard");
    } catch (reason) {
      setError(reason.message || "Your onboarding state could not be saved.");
    }
  }

  function changeCode(value) {
    const next = value || "";
    const before = previousCode.current;
    let prefix = 0;
    while (prefix < before.length && prefix < next.length && before[prefix] === next[prefix]) prefix += 1;
    let suffix = 0;
    while (suffix < before.length - prefix && suffix < next.length - prefix && before[before.length - 1 - suffix] === next[next.length - 1 - suffix]) suffix += 1;
    const inserted = next.slice(prefix, next.length - suffix);
    const removed = before.length - prefix - suffix;
    if (inserted) {
      setTape((current) => (current + inserted).slice(-250000));
      setKeystrokes((current) => current + inserted.length);
    }
    if (removed) setBackspaces((current) => current + removed);
    previousCode.current = next;
    setCode(next);
    if (result) setResult(null);
  }

  async function submitExercise() {
    if (!challenge || checking) return;
    const token = window.localStorage.getItem("refactorflow-access-token");
    setChecking(true);
    setError("");
    try {
      const response = await fetch("/api/challenge/" + encodeURIComponent(challenge.slug) + "/run", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ code }),
      });
      const verification = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(verification.error || "The exercise could not be checked.");
      setResult(verification);
      if (verification.status !== "passed") {
        setAttempts((current) => current + 1);
        return;
      }

      const saveResponse = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({
          exerciseId: challenge.id,
          submittedCode: code,
          durationMs: seconds * 1000,
          tape: tape || code,
          rawEvents: [],
          pauseEvents: [],
          runResult: verification,
          metrics: {
            keystrokeCount: keystrokes,
            backspaceCount: backspaces,
            pauseCount: 0,
            longestPauseMs: 0,
            thrashingIndex: Math.min(100, Math.round((backspaces / Math.max(keystrokes, 1)) * 100)),
            classification: "onboarding",
            tapeAnalysis: {},
          },
        }),
      });
      const saved = await saveResponse.json().catch(() => ({}));
      if (saveResponse.ok && typeof saved.sessionId === "string") setSessionId(saved.sessionId);
    } catch (reason) {
      setError(reason.message || "The exercise could not be checked.");
    } finally {
      setChecking(false);
    }
  }

  const canSkip = step !== 3 || attempts >= 3;

  if (loading) return <main className={[styles.page, dark ? styles.dark : ""].filter(Boolean).join(" ")}><div className={styles.loading}>Preparing your first practice session...</div></main>;

  const score = Math.min(100, Math.round((backspaces / Math.max(keystrokes, 1)) * 100));
  const scoreInfo = scoreMeta(score);

  return <main className={[styles.page, dark ? styles.dark : ""].filter(Boolean).join(" ")}>
    <header className={styles.topbar}>
      <Link className={styles.wordmark} href="/dashboard">Refactor<span>Flow</span></Link>
      <div>{canSkip && <button className={styles.skip} type="button" onClick={finish}>Skip for now &rarr;</button>}<button className={styles.theme} type="button" onClick={toggleTheme} aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}><ThemeIcon dark={dark} /></button></div>
    </header>

    <nav className={styles.progress} aria-label={"Onboarding step " + step + " of 4"}>
      <i style={{ width: (step / 4) * 100 + "%" }} />
      {[["Welcome", 1], ["How it works", 2], ["Your first exercise", 3], ["Done", 4]].map(([label, number]) => <span className={step >= number ? styles.current : ""} key={label}><b>{number}</b>{label}</span>)}
    </nav>

    <section className={styles.stage}>
      {step === 1 && <div className={styles.centered}>
        <div className={styles.spark}>*</div>
        <h1>{firstName(profile?.name) ? "Welcome, " + firstName(profile.name) + "." : "Welcome to RefactorFlow."}</h1>
        <p>You are about to see something most coding platforms never show you - how you actually think when you code.</p>
        <em>No speed test. No judgment. Just a mirror.</em>
        <div className={styles.signals}><SignalCard mark="~" title="Thrashing Index" copy="See how much you rewrote." /><SignalCard mark="o" title="Pause Detection" copy="Notice your thinking rhythm." /><SignalCard mark="=" title="Keystroke Tape" copy="Follow the trail you wrote." /></div>
        <button className={styles.mainButton} type="button" onClick={() => setStep(2)}>Get started <span>&rarr;</span></button>
      </div>}

      {step === 2 && <div className={styles.centered}>
        <h1>Here is what happens when you code.</h1>
        <p>Every session, three things are captured automatically.</p>
        <div className={styles.explainer}>
          <article><i>&lt;/&gt;</i><div><h2>You code in the editor</h2><p>A Monaco editor loads with starter code. There is no time limit - take as long as you need.</p></div></article>
          <article><i>=</i><div><h2>Your keystroke tape builds</h2><p>Every character you type becomes a continuous record of your thought process.</p><pre>{demoText}<b>{demoText.length < tapeDemo.length ? "|" : ""}</b></pre></div></article>
          <article><i>#</i><div><h2>Your behavioral report</h2><p>After you submit, your Thrashing Index, pauses, and tape are shown in a focused report.</p><span className={styles.miniScore}>34 &middot; Moderate</span></div></article>
        </div>
        <div className={styles.stepActions}><button className={styles.back} type="button" onClick={() => setStep(1)}>&larr; Back</button><button className={styles.mainButton} type="button" onClick={() => setStep(3)}>Got it - show me an exercise <span>&rarr;</span></button></div>
      </div>}

      {step === 3 && <div className={styles.exerciseStage}>
        <h1>Try a quick one.</h1>
        <p>This first exercise is short on purpose - we just want you to experience the editor and the report.</p>
        <section className={styles.miniEditor}>
          <header><code>{challenge?.slug?.replace(/-/g, "_")}()</code><strong>{formatTime(seconds)}</strong></header>
          <div className={styles.editorArea}><MonacoEditor height="240px" language={challenge?.language || "python"} theme={dark ? "vs-dark" : "vs"} value={code} onChange={changeCode} options={{ fontSize: 14, minimap: { enabled: false }, scrollBeyondLastLine: false, automaticLayout: true, padding: { top: 16, bottom: 16 }, ariaLabel: "Onboarding code editor" }} /></div>
        </section>
        {!result?.status || result.status !== "passed" ? <><button className={styles.mainButton} type="button" onClick={submitExercise} disabled={checking}>{checking ? "Running tests..." : "Submit code"}</button>{result && <section className={styles.inlineResult}><strong>{result.passed || 0}/{result.total || 0} tests passed</strong><span>Try again - each revision is part of the learning signal.</span></section>}{attempts >= 3 && <button className={styles.continueAnyway} type="button" onClick={() => setStep(4)}>That is okay - continue anyway <span>&rarr;</span></button>}</> : <section className={styles.success}>
          <i>&#10003;</i><h2>All {result.total || 0} tests passed.</h2><p>Your Thrashing Index was <strong className={scoreInfo.className}>{score} &middot; {scoreInfo.label}</strong>.</p><pre>{tape || code}</pre><button className={styles.mainButton} type="button" onClick={() => setStep(4)}>Continue <span>&rarr;</span></button>{sessionId && <Link href={"/report/" + sessionId}>View your report</Link>}</section>}
      </div>}

      {step === 4 && <div className={styles.centered}>
        <div className={styles.doneMark}>&#10003;</div><h1>You are set up.</h1><p>Your behavioral profile has started. Complete more exercises to see your patterns emerge over time.</p>
        <div className={styles.signals}><SignalCard mark="~" title="Thrashing Index trend" copy="Watch your score improve over 30 sessions." /><SignalCard mark="o" title="Pause patterns" copy="See whether pauses are thoughtful or panic." /><SignalCard mark="+" title="Badges and XP" copy="Earn badges for clear, steady work." /></div>
        <button className={styles.mainButton} type="button" onClick={finish}>Go to my dashboard <span>&rarr;</span></button>
      </div>}
      {error && <p className={styles.error} role="alert">{error}</p>}
    </section>
  </main>;
}
