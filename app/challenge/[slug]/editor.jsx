"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSessionStore } from "../../../lib/session-store";
import { analyzeTape } from "../../../lib/tape-analyzer";
import { classifyThrashingIndex, computeThrashingIndex } from "../../../lib/metrics";
import styles from "./challenge-workspace.module.css";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <div className={styles.editorLoading}>Loading editor&hellip;</div>,
});

function Icon({ name, size = 14 }) {
  const icons = {
    rotate: <><path d="M20 11a8 8 0 0 0-14.9-3L3 10" /><path d="M3 4v6h6M4 13a8 8 0 0 0 14.9 3L21 14" /><path d="M21 20v-6h-6" /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{icons[name]}</svg>;
}

export default function ChallengeEditor({ challenge, dark, fontSize, checking, onRun, onEditing, onBehavior, onReset }) {
  const code = useSessionStore((state) => state.code);
  const initSession = useSessionStore((state) => state.initSession);
  const [initialized, setInitialized] = useState(false);
  const [resetArmed, setResetArmed] = useState(false);
  const previousValue = useRef(challenge.starter_code);
  const resetTimer = useRef(null);

  useEffect(() => {
    initSession(challenge.id, challenge.starter_code);
    previousValue.current = challenge.starter_code;
    setInitialized(true);
    return () => {
      if (resetTimer.current) window.clearTimeout(resetTimer.current);
    };
  }, [challenge.id, challenge.starter_code, initSession]);

  useEffect(() => {
    if (checking) return undefined;
    const pauseTimer = window.setInterval(() => {
      const state = useSessionStore.getState();
      const last = state.lastKeystrokeAt;
      if (!last) return;
      const elapsed = Date.now() - last;
      if (elapsed < 2000) return;
      state.recordPause(elapsed);
      if (elapsed >= 8000) onBehavior?.("panicPause");
    }, 500);

    return () => window.clearInterval(pauseTimer);
  }, [checking, onBehavior]);

  const submit = useCallback(async () => {
    if (checking || !initialized) return;
    const state = useSessionStore.getState();
    const thrashingIndex = computeThrashingIndex(state);
    const tapeAnalysis = analyzeTape(state.tape, state.code);
    await onRun({
      ...state,
      submittedCode: state.code,
      thrashingIndex,
      classification: classifyThrashingIndex(thrashingIndex),
      tapeAnalysis,
    });
  }, [checking, initialized, onRun]);

  useEffect(() => {
    const requestSubmit = () => { void submit(); };
    window.addEventListener("refactorflow-submit", requestSubmit);
    return () => window.removeEventListener("refactorflow-submit", requestSubmit);
  }, [submit]);

  function handleChange(value) {
    if (checking || !initialized) return;
    const next = value || "";
    const state = useSessionStore.getState();
    state.onEditorChange(next, previousValue.current);
    previousValue.current = next;
    const updated = useSessionStore.getState();
    if (updated.backspaceCount >= 12 && updated.backspaceCount / Math.max(updated.keystrokeCount, 1) >= 0.35) {
      onBehavior?.("thrashLoop");
    }
    onEditing?.();
  }

  function resetCode() {
    if (!resetArmed) {
      setResetArmed(true);
      resetTimer.current = window.setTimeout(() => setResetArmed(false), 3000);
      return;
    }

    if (resetTimer.current) window.clearTimeout(resetTimer.current);
    setResetArmed(false);
    initSession(challenge.id, challenge.starter_code);
    previousValue.current = challenge.starter_code;
    onReset?.();
  }

  return <section className={styles.editorPanel}>
    <div className={styles.editorToolbar}>
      <span className={styles.languageBadge}>{String(challenge.language || "python").replace(/^./, (letter) => letter.toUpperCase())} 3</span>
      <div className={styles.editorControls}>
        {[12, 14, 16].map((size) => <button className={fontSize === size ? styles.fontActive : ""} type="button" key={size} onClick={() => window.dispatchEvent(new CustomEvent("refactorflow-font-size", { detail: size }))}>{size}</button>)}
        <i className={styles.toolbarDivider} />
        <button className={styles.resetButton} type="button" onClick={resetCode}><Icon name="rotate" size={11} />{resetArmed ? "Reset code?" : "Reset"}</button>
      </div>
    </div>
    <div className={styles.monacoWrap}>
      <MonacoEditor
        height="100%"
        width="100%"
        language={challenge.language || "python"}
        theme={dark ? "vs-dark" : "vs"}
        value={initialized ? code : challenge.starter_code}
        onChange={handleChange}
        options={{
          readOnly: checking,
          fontSize,
          minimap: { enabled: false },
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          wordWrap: "off",
          padding: { top: 16, bottom: 16 },
          renderWhitespace: "none",
          folding: false,
          automaticLayout: true,
          overviewRulerLanes: 0,
          hideCursorInOverviewRuler: true,
          scrollbar: { verticalScrollbarSize: 6, horizontalScrollbarSize: 6 },
          ariaLabel: "Code editor",
        }}
      />
    </div>
  </section>;
}
