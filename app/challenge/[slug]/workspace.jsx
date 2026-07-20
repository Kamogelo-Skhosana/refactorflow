"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import ChallengeEditor from "./editor";
import styles from "./challenge-workspace.module.css";

function Icon({ name, size = 16 }) {
  const icons = {
    arrowLeft: <><path d="M19 12H5M11 18l-6-6 6-6" /></>,
    clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3 2" /></>,
    check: <><circle cx="12" cy="12" r="8.5" /><path d="m8.5 12 2.2 2.2 4.8-5.1" /></>,
    xCircle: <><circle cx="12" cy="12" r="8.5" /><path d="m9 9 6 6m0-6-6 6" /></>,
    flask: <><path d="M9 3h6M10 3v6l-5 8a3 3 0 0 0 2.6 4h8.8a3 3 0 0 0 2.6-4l-5-8V3" /><path d="M8 15h8" /></>,
    lock: <><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
    unlock: <><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 7.2-2.4" /></>,
    alert: <><path d="m12 3 9 16H3L12 3Z" /><path d="M12 9v4M12 17h.01" /></>,
    lightbulb: <><path d="M9 18h6M10 22h4M8.8 15.3A7 7 0 1 1 15.2 15.3c-.8.7-1.2 1.3-1.2 2.2h-4c0-.9-.4-1.5-1.2-2.2Z" /></>,
    zap: <path d="m13 2-9 12h7l-1 8 9-12h-7l1-8Z" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></>,
    moon: <path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5 8.5 8.5 0 1 0 20.5 14.2Z" />,
    skip: <><path d="m5 5 9 7-9 7V5ZM19 5v14" /></>,
  };

  return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{icons[name]}</svg>;
}

function formatTime(seconds) {
  return String(Math.floor(seconds / 60)).padStart(2, "0") + ":" + String(seconds % 60).padStart(2, "0");
}

function functionSignature(starterCode) {
  return String(starterCode || "").split("\n").find((line) => /^\s*(def|function|public|private)/.test(line))?.trim() || String(starterCode || "").split("\n")[0] || "Function signature";
}

function functionName(signature, fallback) {
  const match = signature.match(/(?:def|function)\s+([a-zA-Z_]\w*)/);
  return (match?.[1] || fallback || "challenge").replace(/-/g, "_") + "()";
}

function resultTone(result) {
  return result?.status === "passed" ? "passed" : "failed";
}

function ResultItem({ item, expanded, onToggle }) {
  const tone = item.status === "passed" ? "passed" : item.status === "skipped" ? "skipped" : item.status === "error" ? "error" : "failed";
  const error = item.error || "";
  const canExpand = error.length > 105;
  const visibleError = expanded || !canExpand ? error : error.slice(0, 105).trim() + "...";

  return <article className={[styles.testRow, styles[tone]].join(" ")}>
    <Icon name={item.status === "passed" ? "check" : item.status === "skipped" ? "skip" : item.status === "error" ? "alert" : "xCircle"} size={14} />
    <div>
      <strong>{item.name}</strong>
      {error && <p>{visibleError} {canExpand && <button type="button" onClick={onToggle}>{expanded ? "Show less" : "Show more"}</button>}</p>}
    </div>
  </article>;
}

function ResultsTab({ result, sessionId, expandedErrors, onToggleError }) {
  if (!result) {
    return <div className={styles.resultsEmpty}><Icon name="flask" size={28} /><p>Submit your code to see test results.</p></div>;
  }

  const passed = Number(result.passed) || 0;
  const total = Math.max(Number(result.total) || 0, 1);
  const allPassed = result.status === "passed";
  const tests = Array.isArray(result.tests) && result.tests.length
    ? result.tests
    : Array.from({ length: total }, (_, index) => ({ name: "Test " + (index + 1), status: index < passed ? "passed" : "failed", error: index < passed ? "" : "A check did not pass." }));

  return <div className={styles.resultsContent}>
    <section className={[styles.resultSummary, allPassed ? styles.summaryPassed : styles.summaryFailed].join(" ")}>
      <div><Icon name={allPassed ? "check" : "xCircle"} size={16} /><strong>{allPassed ? "All tests passed." : passed + "/" + total + " tests passed."}</strong></div>
      <p>{allPassed ? "Great work - your solution is correct." : Math.max(total - passed, 0) + " tests failing - check the logic and try again."}</p>
    </section>
    <span className={styles.resultTrack}><i className={allPassed ? styles.fillPassed : styles.fillFailed} style={{ width: (passed / total) * 100 + "%" }} /></span>
    <div className={styles.testList}>{tests.map((item, index) => <ResultItem item={item} key={index} expanded={Boolean(expandedErrors[index])} onToggle={() => onToggleError(index)} />)}</div>
    {sessionId && <Link className={styles.reportLink} href={"/report/" + sessionId}>View full report &rarr;</Link>}
  </div>;
}

function HintCard({ level, seconds, content, onReveal, revealing }) {
  const unlockAt = level === 1 ? 0 : level === 2 ? 180 : 360;
  const unlocked = seconds >= unlockAt;
  const remaining = Math.max(0, unlockAt - seconds);

  if (content) {
    return <article className={[styles.hintCard, styles.hintRevealed].join(" ")}>
      <div className={styles.hintTitle}><Icon name="check" size={14} /><strong>Level {level}</strong></div>
      <p>{content}</p>
    </article>;
  }

  if (unlocked) {
    return <article className={[styles.hintCard, styles.hintAvailable].join(" ")}>
      <div className={styles.hintTitle}><Icon name="unlock" size={14} /><strong>Level {level}</strong><span>Available</span></div>
      <button type="button" onClick={() => onReveal(level)} disabled={revealing}>Reveal hint</button>
    </article>;
  }

  return <article className={[styles.hintCard, styles.hintLocked].join(" ")}>
    <div className={styles.hintTitle}><Icon name="lock" size={14} /><strong>Level {level}</strong></div>
    <p>Unlocks in <code>{formatTime(remaining)}</code></p>
  </article>;
}

function HintsTab({ seconds, revealedHints, onReveal, revealing, hintError }) {
  return <div className={styles.hintsContent}>
    <header><strong>Hints</strong><span>3 levels</span></header>
    <p className={styles.hintNote}>Hints unlock as your session progresses. Using hints does not affect your pass/fail result.</p>
    <div className={styles.hintList}>{[1, 2, 3].map((level) => <HintCard key={level} level={level} seconds={seconds} content={revealedHints[level]} onReveal={onReveal} revealing={revealing === level} />)}</div>
    {hintError && <p className={styles.hintError}>{hintError}</p>}
  </div>;
}

function Nudge({ nudge, onDismiss }) {
  if (!nudge) return null;
  const icon = nudge.type === "stuck" ? "lightbulb" : nudge.type === "flow" ? "zap" : "alert";

  return <aside className={[styles.nudge, styles["nudge" + nudge.type.replace(/^./, (letter) => letter.toUpperCase())]].join(" ")}>
    <Icon name={icon} size={18} />
    <div><strong>{nudge.title}</strong><p>{nudge.message}</p></div>
    <button type="button" aria-label="Dismiss coaching message" onClick={onDismiss}><Icon name="close" size={12} /></button>
  </aside>;
}

export default function ChallengeWorkspace({ challenge }) {
  const [dark, setDark] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(true);
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState(null);
  const [sessionId, setSessionId] = useState("");
  const [activeTab, setActiveTab] = useState("description");
  const [leftWidth, setLeftWidth] = useState(320);
  const [fontSize, setFontSize] = useState(14);
  const [revealedHints, setRevealedHints] = useState({});
  const [revealing, setRevealing] = useState(0);
  const [hintError, setHintError] = useState("");
  const [nudgesEnabled, setNudgesEnabled] = useState(true);
  const [nudge, setNudge] = useState(null);
  const [successVisible, setSuccessVisible] = useState(false);
  const [runError, setRunError] = useState("");
  const [expandedErrors, setExpandedErrors] = useState({});
  const bodyRef = useRef(null);
  const secondsRef = useRef(0);
  const nudgeCooldowns = useRef({});

  const signature = useMemo(() => functionSignature(challenge.starter_code), [challenge.starter_code]);
  const titleFunction = useMemo(() => functionName(signature, challenge.slug), [signature, challenge.slug]);
  const passed = Number(result?.passed) || 0;
  const total = Number(result?.total) || 0;
  const hasResults = Boolean(result);

  useEffect(() => {
    const preferredDark = window.localStorage.getItem("refactorflow-theme") === "dark" || document.documentElement.classList.contains("dark");
    setDark(preferredDark);
  }, []);

  useEffect(() => {
    secondsRef.current = seconds;
  }, [seconds]);

  useEffect(() => {
    if (!timerRunning || checking) return undefined;
    const interval = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(interval);
  }, [timerRunning, checking]);

  useEffect(() => {
    const receiveFontSize = (event) => {
      const size = Number(event.detail);
      if ([12, 14, 16].includes(size)) setFontSize(size);
    };
    window.addEventListener("refactorflow-font-size", receiveFontSize);
    return () => window.removeEventListener("refactorflow-font-size", receiveFontSize);
  }, []);

  useEffect(() => {
    let active = true;
    const accessToken = window.localStorage.getItem("refactorflow-access-token");
    if (!accessToken) return () => { active = false; };

    fetch("/api/challenge/" + encodeURIComponent(challenge.slug) + "/hints", {
      headers: { Authorization: "Bearer " + accessToken },
      cache: "no-store",
    })
      .then((response) => response.json().then((data) => ({ response, data })))
      .then(({ response, data }) => {
        if (active && response.ok) setNudgesEnabled(data.nudgesEnabled !== false);
      })
      .catch(() => undefined);

    return () => { active = false; };
  }, [challenge.slug]);

  useEffect(() => {
    if (!nudgesEnabled) return;
    if (seconds === 120) presentNudge("stuck");
    if (seconds === 75) presentNudge("flow");
  }, [seconds, nudgesEnabled]);

  useEffect(() => {
    if (!nudge) return undefined;
    const timeout = window.setTimeout(() => setNudge(null), nudge.type === "flow" ? 4000 : 8000);
    return () => window.clearTimeout(timeout);
  }, [nudge]);

  useEffect(() => {
    const shortcuts = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
        event.preventDefault();
        window.dispatchEvent(new Event("refactorflow-submit"));
      }
      if ((event.metaKey || event.ctrlKey) && ["1", "2", "3"].includes(event.key)) {
        event.preventDefault();
        setActiveTab({ 1: "description", 2: "results", 3: "hints" }[event.key]);
      }
      if (event.key === "Escape") setNudge(null);
    };

    window.addEventListener("keydown", shortcuts);
    return () => window.removeEventListener("keydown", shortcuts);
  }, []);

  function presentNudge(type) {
    if (!nudgesEnabled || nudge) return;
    const now = Date.now();
    if (now - (nudgeCooldowns.current[type] || 0) < 300000) return;
    nudgeCooldowns.current[type] = now;

    const messages = {
      panicPause: { title: "Take a breath.", message: "Break the problem into smaller steps - what is the very first thing the function needs to do?" },
      thrashLoop: { title: "You've rewritten quite a bit.", message: "That's okay. Write what the function should do in plain English before you type any more code." },
      stuck: { title: "Still thinking?", message: "Re-read the description - sometimes the answer is in the wording of the problem." },
      flow: { title: "You're in good flow.", message: "Keep going." },
    };

    setNudge({ type, ...messages[type] });
  }

  function toggleTheme() {
    const nextDark = !dark;
    setDark(nextDark);
    document.documentElement.classList.toggle("dark", nextDark);
    window.localStorage.setItem("refactorflow-theme", nextDark ? "dark" : "light");
    window.dispatchEvent(new Event("refactorflow-theme-change"));
  }

  function beginResize(event) {
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function resize(event) {
    if (!bodyRef.current) return;
    const bounds = bodyRef.current.getBoundingClientRect();
    setLeftWidth(Math.max(240, Math.min(480, event.clientX - bounds.left)));
  }

  function resetSession() {
    setSeconds(0);
    secondsRef.current = 0;
    setTimerRunning(true);
    setResult(null);
    setSessionId("");
    setRunError("");
    setExpandedErrors({});
    setActiveTab("description");
  }

  function handleEditing() {
    if (hasResults && !checking) setTimerRunning(true);
  }

  async function revealHint(level) {
    if (revealedHints[level]) return;
    const accessToken = window.localStorage.getItem("refactorflow-access-token");
    if (!accessToken) {
      setHintError("Please sign in again to reveal this hint.");
      return;
    }

    setRevealing(level);
    setHintError("");
    try {
      const response = await fetch("/api/challenge/" + encodeURIComponent(challenge.slug) + "/hints", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + accessToken },
        body: JSON.stringify({ level }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || typeof data.content !== "string") throw new Error(data.error || "This hint could not be loaded.");
      setRevealedHints((current) => ({ ...current, [level]: data.content }));
    } catch (error) {
      setHintError(error.message || "This hint could not be loaded.");
    } finally {
      setRevealing(0);
    }
  }

  async function submitSession(data) {
    if (checking) return;
    setChecking(true);
    setTimerRunning(false);
    setRunError("");

    const accessToken = window.localStorage.getItem("refactorflow-access-token");
    try {
      const runnerResponse = await fetch("/api/challenge/" + encodeURIComponent(challenge.slug) + "/run", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(accessToken ? { Authorization: "Bearer " + accessToken } : {}) },
        body: JSON.stringify({ code: data.submittedCode }),
      });
      const verification = await runnerResponse.json().catch(() => ({}));
      if (!runnerResponse.ok || !["passed", "failed"].includes(verification.status)) {
        throw new Error(verification.error || "The submission could not be checked.");
      }

      const durationSeconds = secondsRef.current;
      const record = { ...data, verification, slug: challenge.slug, durationSeconds, completedAt: new Date().toISOString() };
      window.localStorage.setItem("refactorflow-session-" + challenge.slug, JSON.stringify(record));

      let savedSessionId = "";
      try {
        const saveResponse = await fetch("/api/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...(accessToken ? { Authorization: "Bearer " + accessToken } : {}) },
          body: JSON.stringify({
            exerciseId: challenge.id,
            submittedCode: data.submittedCode,
            durationMs: durationSeconds * 1000,
            runResult: verification,
            metrics: {
              keystrokeCount: data.keystrokeCount,
              backspaceCount: data.backspaceCount,
              pauseCount: data.pauseEvents.length,
              longestPauseMs: Math.max(0, ...data.pauseEvents.map((event) => event.duration)),
              thrashingIndex: data.thrashingIndex,
              classification: data.classification,
              tapeAnalysis: data.tapeAnalysis,
            },
            tape: data.tape,
            rawEvents: data.rawEvents,
            pauseEvents: data.pauseEvents,
          }),
        });
        const saved = await saveResponse.json().catch(() => ({}));
        if (saveResponse.ok && typeof saved.sessionId === "string") savedSessionId = saved.sessionId;
      } catch {
        // A completed test result is still useful even if session persistence is temporarily unavailable.
      }

      setResult(verification);
      setSessionId(savedSessionId);
      setExpandedErrors({});
      setActiveTab("results");
      if (verification.status === "passed") setSuccessVisible(true);
    } catch (error) {
      setRunError(error.message || "The submission could not be checked. Please try again.");
      setTimerRunning(true);
    } finally {
      setChecking(false);
    }
  }

  const tabs = [
    { id: "description", label: "Description" },
    { id: "results", label: "Results" },
    { id: "hints", label: "Hints" },
  ];

  return <main className={[styles.page, dark ? styles.dark : ""].filter(Boolean).join(" ")}>
    {successVisible ? <div className={styles.successBanner}>All tests passed. {sessionId && <Link href={"/report/" + sessionId}>View your report &rarr;</Link>}</div> : <header className={styles.topBar}>
      <div className={styles.topLeft}>
        <Link className={styles.backLink} href="/challenge"><Icon name="arrowLeft" size={14} />Challenges</Link>
        <i className={styles.topDivider} />
        <div className={styles.identity}><code>{titleFunction}</code><strong>{challenge.title}</strong></div>
      </div>
      <div className={styles.timer}><div><Icon name="clock" size={14} /><strong>{formatTime(seconds)}</strong></div><small>Time elapsed</small></div>
      <div className={styles.topRight}>
        {hasResults && <span className={[styles.resultBadge, styles[resultTone(result)]].join(" ")}><Icon name={result.status === "passed" ? "check" : "xCircle"} size={14} />{passed}/{total} passed</span>}
        <button className={styles.themeButton} type="button" aria-label={dark ? "Switch to light mode" : "Switch to dark mode"} onClick={toggleTheme}><Icon name={dark ? "sun" : "moon"} size={16} /></button>
        <div className={styles.submitGroup}><button className={styles.submitButton} type="button" disabled={checking} onClick={() => window.dispatchEvent(new Event("refactorflow-submit"))}>{checking ? <><i className={styles.spinner} />Running tests...</> : hasResults ? "Re-submit" : "Submit"}</button><small>Ctrl/Cmd + Enter</small></div>
      </div>
    </header>}

    <section className={styles.body} ref={bodyRef} style={{ gridTemplateColumns: leftWidth + "px 4px minmax(0, 1fr)" }}>
      <aside className={styles.leftPanel}>
        <nav className={styles.tabs} aria-label="Challenge information">
          {tabs.map((tab) => <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={activeTab === tab.id ? styles.tabActive : ""}>{tab.label}{tab.id === "results" && hasResults && <span>{total}</span>}</button>)}
        </nav>
        <div className={styles.tabContent}>
          {activeTab === "description" && <div className={styles.description}><p>{challenge.description}</p><section><small>Function signature</small><pre><code>{signature}</code></pre></section></div>}
          {activeTab === "results" && <ResultsTab result={result} sessionId={sessionId} expandedErrors={expandedErrors} onToggleError={(index) => setExpandedErrors((current) => ({ ...current, [index]: !current[index] }))} />}
          {activeTab === "hints" && <HintsTab seconds={seconds} revealedHints={revealedHints} onReveal={revealHint} revealing={revealing} hintError={hintError} />}
          {runError && activeTab === "results" && <p className={styles.runError}>{runError}</p>}
        </div>
      </aside>
      <div className={styles.resizeHandle} role="separator" aria-label="Resize challenge panel" aria-orientation="vertical" onPointerDown={beginResize} onPointerMove={resize} />
      <div className={styles.editorZone}>
        <Nudge nudge={nudge} onDismiss={() => setNudge(null)} />
        <ChallengeEditor challenge={challenge} dark={dark} fontSize={fontSize} checking={checking} onRun={submitSession} onEditing={handleEditing} onBehavior={presentNudge} onReset={resetSession} />
      </div>
    </section>
  </main>;
}
