"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useSessionStore } from "../../../lib/session-store";
import { analyzeTape } from "../../../lib/tape-analyzer";
import { classifyThrashingIndex, computeThrashingIndex } from "../../../lib/metrics";
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false, loading: () => <div className="editor-loading">Loading editor&hellip;</div> });

export default function ChallengeEditor({ starterCode, started, time, exerciseId, onSubmit }) {
  const previousValue = useRef(starterCode); const [submitted, setSubmitted] = useState(false); const [dark, setDark] = useState(false); const session = useSessionStore();
  useEffect(() => { const update = () => setDark(document.documentElement.classList.contains("dark")); update(); window.addEventListener("refactorflow-theme-change", update); return () => window.removeEventListener("refactorflow-theme-change", update); }, []);
  useEffect(() => { if (started) { session.initSession(exerciseId, starterCode); previousValue.current = starterCode; } }, [started]);
  useEffect(() => { if (!started) return undefined; const timer = window.setInterval(() => { const last = useSessionStore.getState().lastKeystrokeAt; if (!last) return; const elapsed = Date.now() - last; if (elapsed >= 2000) useSessionStore.getState().recordPause(elapsed); }, 500); return () => window.clearInterval(timer); }, [started]);
  function change(value) { const next = value || ""; session.onEditorChange(next, previousValue.current); previousValue.current = next; }
  function submit(event) { event.preventDefault(); const state = useSessionStore.getState(); const thrashingIndex = computeThrashingIndex(state); const tapeAnalysis = analyzeTape(state.tape, state.code); setSubmitted(true); onSubmit({ ...state, submittedCode: state.code, thrashingIndex, classification: classifyThrashingIndex(thrashingIndex), tapeAnalysis }); }
  return <form className="editor-form" onSubmit={submit}><div className="editor-header"><span className="editor-language">{started ? "Challenge in progress" : "Python workspace"}</span>{started && <span className="challenge-timer">{time}</span>}</div><div className={`editor-shell ${!started ? "editor-locked" : ""}`}><MonacoEditor height="100%" defaultLanguage="python" theme={dark ? "vs-dark" : "light"} value={started ? session.code : starterCode} onChange={change} options={{ readOnly: !started, minimap: { enabled: false }, fontSize: 14, padding: { top: 20 }, scrollBeyondLastLine: false }} /></div><div className="editor-actions"><span className="editor-language">{started ? "Ready when you are" : "Press Start to unlock the editor"}</span><button className="primary-button" type="submit" disabled={!started}>Run task <span>&rarr;</span></button></div>{submitted && <p className="submission-note">Behavioral session captured.</p>}</form>;
}

