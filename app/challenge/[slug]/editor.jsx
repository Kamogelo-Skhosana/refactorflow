"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useSessionStore } from "../../../lib/session-store";
import { analyzeTape } from "../../../lib/tape-analyzer";
import { classifyThrashingIndex, computeThrashingIndex } from "../../../lib/metrics";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false, loading: () => <div className="editor-loading">Loading editor&hellip;</div> });

export default function ChallengeEditor({ starterCode, started, checking, time, exerciseId, onRunStart, onSubmit }) {
  const previousValue = useRef(starterCode);
  const [dark, setDark] = useState(false);
  const [runError, setRunError] = useState("");
  const session = useSessionStore();

  useEffect(() => {
    const update = () => setDark(document.documentElement.classList.contains("dark"));
    update();
    window.addEventListener("refactorflow-theme-change", update);
    return () => window.removeEventListener("refactorflow-theme-change", update);
  }, []);

  useEffect(() => {
    if (started) {
      session.initSession(exerciseId, starterCode);
      previousValue.current = starterCode;
    }
  }, [started, exerciseId, starterCode]);

  useEffect(() => {
    if (!started) return undefined;
    const timer = window.setInterval(() => {
      const last = useSessionStore.getState().lastKeystrokeAt;
      if (!last) return;
      const elapsed = Date.now() - last;
      if (elapsed >= 2000) useSessionStore.getState().recordPause(elapsed);
    }, 500);
    return () => window.clearInterval(timer);
  }, [started]);

  function change(value) {
    if (!started || checking) return;
    const next = value || "";
    session.onEditorChange(next, previousValue.current);
    previousValue.current = next;
  }

  async function submit(event) {
    event.preventDefault();
    if (!started || checking) return;
    const state = useSessionStore.getState();
    const thrashingIndex = computeThrashingIndex(state);
    const tapeAnalysis = analyzeTape(state.tape, state.code);
    setRunError("");
    onRunStart();
    try {
      await onSubmit({ ...state, submittedCode: state.code, thrashingIndex, classification: classifyThrashingIndex(thrashingIndex), tapeAnalysis });
    } catch {
      setRunError("Your submission could not be checked. Please try again.");
    }
  }

  const hasActiveCode = started || checking;
  return <form className="editor-form" onSubmit={submit}>
    <div className="editor-header"><span className="editor-language">{checking ? "Checking your solution" : started ? "Challenge in progress" : "Python workspace"}</span>{started && <span className="challenge-timer">{time}</span>}</div>
    <div className={`editor-shell ${!started ? "editor-locked" : ""}`}><MonacoEditor height="100%" defaultLanguage="python" theme={dark ? "vs-dark" : "light"} value={hasActiveCode ? session.code : starterCode} onChange={change} options={{ readOnly: !started || checking, minimap: { enabled: false }, fontSize: 14, padding: { top: 20 }, scrollBeyondLastLine: false }} /></div>
    <div className="editor-actions"><span className="editor-language">{checking ? "Running private tests in isolation" : started ? "Ready when you are" : "Press Start to unlock the editor"}</span><button className="primary-button" type="submit" disabled={!started || checking}>{checking ? "Checking&hellip;" : <>Run task <span>&rarr;</span></>}</button></div>
    {runError && <p className="submission-note">{runError}</p>}
  </form>;
}

