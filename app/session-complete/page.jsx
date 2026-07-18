"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

function ResultCard({ verification }) {
  if (!verification) return null;
  const passed = verification.status === "passed";
  const failed = verification.status === "failed";
  const title = passed ? "All checks passed." : failed ? "Not quite yet." : "Your code was not checked.";
  const detail = passed
    ? `${verification.total} private ${verification.total === 1 ? "test" : "tests"} passed.`
    : failed
      ? `${verification.passed || 0} of ${verification.total || 0} private tests passed. Keep iterating.`
      : verification.error || "The isolated runner was unavailable for this session.";
  return <div className={`run-result ${passed ? "run-result-passed" : "run-result-pending"}`}><p className="kicker">Submission result</p><h2>{title}</h2><p>{detail}</p></div>;
}

export default function SessionCompletePage() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get("challenge");
    if (!slug) return;
    const raw = window.localStorage.getItem(`refactorflow-session-${slug}`);
    if (!raw) return;
    try { setSession(JSON.parse(raw)); } catch { window.localStorage.removeItem(`refactorflow-session-${slug}`); }
  }, []);

  if (!session) return <main className="session-complete"><Link className="rf-back" href="/dashboard"><span>r</span><span>f</span></Link><section className="session-summary shell"><p className="kicker">Session complete</p><h1>Your session was saved.</h1><Link className="primary-button" href="/challenge">Choose another challenge <span>&rarr;</span></Link></section></main>;

  const analysis = session.tapeAnalysis || {};
  return <main className="session-complete"><Link className="rf-back" href="/dashboard"><span>r</span><span>f</span></Link><section className="session-summary shell"><p className="kicker">Session complete</p><h1>Good work. Now<br /><em>notice the process.</em></h1><p className="session-intro">Your behavioral trail has been saved. This is the beginning of your RefactorFlow feedback loop.</p><ResultCard verification={session.verification} /><div className="session-metrics"><article><span className="kicker">Time spent</span><strong>{Math.floor((session.durationSeconds || 0) / 60)}:{String((session.durationSeconds || 0) % 60).padStart(2, "0")}</strong></article><article><span className="kicker">Characters written</span><strong>{session.keystrokeCount || 0}</strong></article><article><span className="kicker">Backspaces</span><strong>{session.backspaceCount || 0}</strong></article><article><span className="kicker">Thrashing index</span><strong>{session.thrashingIndex ?? "--"}</strong><small>{session.classification || "Pending analysis"}</small></article></div><div className="session-insight"><p className="kicker">First reflection</p><h2>{analysis.wasCloseEarly ? "You found a promising direction early." : "Your solution evolved through exploration."}</h2><p>{analysis.rewriteRatio ? `Your rewrite ratio was ${analysis.rewriteRatio.toFixed(1)}x. A detailed report will turn this signal into coaching.` : "Your detailed coaching report will be available after analysis."}</p></div><div className="session-actions"><Link className="primary-button" href="/challenge">Try another challenge <span>&rarr;</span></Link><Link className="secondary-button" href="/dashboard">Back to dashboard</Link></div></section></main>;
}

