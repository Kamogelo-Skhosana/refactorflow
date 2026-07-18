"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false, loading: () => <div className="editor-loading">Loading editor&hellip;</div> });

export default function ChallengeEditor({ starterCode, slug, description }) {
  const [code, setCode] = useState(starterCode); const [started, setStarted] = useState(false); const [seconds, setSeconds] = useState(0); const [submitted, setSubmitted] = useState(false);
  useEffect(() => { if (!started) return undefined; const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000); return () => window.clearInterval(timer); }, [started]);
  const time = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  function submit(event) { event.preventDefault(); setSubmitted(true); }
  return <div className="challenge-workspace"><div className="challenge-description"><span className="kicker">Problem statement</span><p>{description}</p><button className="primary-button start-button" type="button" onClick={() => setStarted(true)} disabled={started}>{started ? "Challenge started" : "Start"}</button></div><form onSubmit={submit}><div className="editor-header"><span className="editor-language">Python &middot; {slug}</span>{started && <span className="challenge-timer" aria-label="Challenge timer">{time}</span>}</div><div className={`editor-shell ${!started ? "editor-locked" : ""}`}><MonacoEditor height="520px" defaultLanguage="python" theme="vs-dark" value={code} onChange={(value) => setCode(value || "")} options={{ readOnly: !started, minimap: { enabled: false }, fontSize: 14, padding: { top: 20 }, roundedSelection: false, scrollBeyondLastLine: false }} /></div><div className="editor-actions"><span className="editor-language">{started ? "Ready when you are" : "Press Start to unlock the editor"}</span><button className="primary-button" type="submit" disabled={!started}>Run tests <span>&rarr;</span></button></div>{submitted && <p className="submission-note" role="status">Submission captured. Test execution will connect next.</p>}</form></div>;
}

