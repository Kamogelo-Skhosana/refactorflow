import Link from "next/link";
import ChallengeEditor from "./editor";

async function getChallenge(slug) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL; const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  const response = await fetch(`${url}/rest/v1/challenges?slug=eq.${encodeURIComponent(slug)}&select=*&limit=1`, { headers: { apikey: key }, cache: "no-store" });
  if (!response.ok) return null; const rows = await response.json(); return rows[0] || null;
}

export default async function ChallengeDetailPage({ params }) {
  const { slug } = await params; const challenge = await getChallenge(slug);
  if (!challenge) return <main className="challenge-detail"><nav className="dashboard-nav shell"><Link className="brand" href="/">Refactor<span>Flow</span></Link></nav><section className="empty-challenge shell"><p className="kicker">Challenge not found</p><h1>That challenge is still being shaped.</h1><Link className="secondary-button" href="/challenge">Back to challenges</Link></section></main>;
  return <main className="challenge-detail"><nav className="dashboard-nav shell"><Link className="brand" href="/">Refactor<span>Flow</span></Link><div className="dashboard-nav-links"><Link href="/challenge">All challenges</Link><Link href="/dashboard">Dashboard</Link><Link href="/settings">Settings</Link></div></nav><section className="challenge-detail-heading shell"><Link className="back-link" href="/challenge">&larr; Python fundamentals</Link><div className="challenge-detail-meta"><span className="kicker">{challenge.language} &middot; {challenge.difficulty}</span><span className="challenge-test-count">Practice challenge</span></div><h1>{challenge.title}</h1></section><section className="challenge-editor-section shell"><ChallengeEditor starterCode={challenge.starter_code} slug={challenge.slug} description={challenge.description} /></section></main>;
}

