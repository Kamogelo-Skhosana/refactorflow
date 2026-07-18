"use client";
import dynamic from "next/dynamic";
import { useState } from "react";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false, loading: () => <div className="editor-loading">Loading editor&hellip;</div> });

export default function ChallengeEditor({ starterCode, slug }) {
  const [code, setCode] = useState(starterCode); const [submitted, setSubmitted] = useState(false);
  function submit(event) { event.preventDefault(); setSubmitted(true); }
  return <form className="challenge-workspace" onSubmit={submit}><div className="editor-shell"><MonacoEditor height="430px" defaultLanguage="python" theme="vs-dark" value={code} onChange={(value) => setCode(value || "")} options={{ minimap: { enabled: false }, fontSize: 14, padding: { top: 20 }, roundedSelection: false, scrollBeyondLastLine: false }} /></div><div className="editor-actions"><span className="editor-language">Python Â· {slug}</span><button className="primary-button" type="submit">Run tests <span>&rarr;</span></button></div>{submitted && <p className="submission-note" role="status">Submission captured. Test execution will connect next.</p>}</form>;
}

