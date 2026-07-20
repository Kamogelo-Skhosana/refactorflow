"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ChallengeEditor from "./editor";

export default function ChallengeWorkspace({ challenge }) {
  const router = useRouter();
  const [started, setStarted] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [leftWidth, setLeftWidth] = useState(50);
  const splitRef = useRef(null);
  const secondsRef = useRef(0);

  useEffect(() => {
    secondsRef.current = seconds;
  }, [seconds]);

  useEffect(() => {
    if (!started) return undefined;
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [started]);

  const time = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

  function resize(event) {
    if (!splitRef.current) return;
    const bounds = splitRef.current.getBoundingClientRect();
    setLeftWidth(Math.min(75, Math.max(25, ((event.clientX - bounds.left) / bounds.width) * 100)));
  }

  function startChallenge() {
    secondsRef.current = 0;
    setSeconds(0);
    setStarted(true);
  }

  function beginCheck() {
    setStarted(false);
    setIsChecking(true);
  }

  async function finishSession(data) {
    const accessToken = window.localStorage.getItem("refactorflow-access-token");
    let verification;
    try {
      const response = await fetch(`/api/challenge/${encodeURIComponent(challenge.slug)}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
        body: JSON.stringify({ code: data.submittedCode }),
      });
      const result = await response.json().catch(() => ({}));
      verification = response.ok
        ? result
        : { status: result.status || "error", passed: 0, failed: 0, total: 0, error: result.error || "The submission could not be checked." };
    } catch {
      verification = { status: "error", passed: 0, failed: 0, total: 0, error: "The submission could not be checked." };
    }

    const durationSeconds = secondsRef.current;
    const record = { ...data, verification, slug: challenge.slug, durationSeconds, completedAt: new Date().toISOString() };
    window.localStorage.setItem(`refactorflow-session-${challenge.slug}`, JSON.stringify(record));
    fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
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
    }).catch(() => undefined);
    setIsChecking(false);
    router.push(`/session-complete?challenge=${encodeURIComponent(challenge.slug)}`);
  }

  return <div className="challenge-split" ref={splitRef} style={{ gridTemplateColumns: `${leftWidth}% 8px minmax(0, 1fr)` }}>
    <div className="problem-pane">
      <div className="problem-prose" dangerouslySetInnerHTML={{ __html: challenge.description }} />
      <button className="primary-button start-button" type="button" onClick={startChallenge} disabled={started || isChecking}>
        {isChecking ? "Checking&hellip;" : started ? "Challenge started" : "Start"}
      </button>
    </div>
    <div className="split-divider" role="separator" aria-label="Resize description and editor" aria-orientation="vertical" onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); event.currentTarget.onpointermove = resize; }} onPointerUp={(event) => { event.currentTarget.releasePointerCapture(event.pointerId); event.currentTarget.onpointermove = null; }} />
    <div className="workspace-pane"><div className="workspace-editor"><ChallengeEditor starterCode={challenge.starter_code} started={started} checking={isChecking} time={time} exerciseId={challenge.id} onRunStart={beginCheck} onSubmit={finishSession} /></div></div>
  </div>;
}

