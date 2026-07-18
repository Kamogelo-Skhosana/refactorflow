import Link from "next/link";

async function getChallenges() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return [];
  const response = await fetch(`${url}/rest/v1/challenges?select=*,challenge_tests(*)&order=created_at.asc`, { headers: { apikey: key }, cache: "no-store" });
  return response.ok ? response.json() : [];
}

export default async function ChallengesPage() {
  const challenges = await getChallenges();
  return <main className="challenges-page"><nav className="dashboard-nav shell"><Link className="brand" href="/">Refactor<span>Flow</span></Link><div className="dashboard-nav-links"><Link href="/dashboard">Dashboard</Link><Link href="/settings">Settings</Link><Link className="text-link" href="/signin">Sign out</Link></div></nav><section className="challenges-heading shell"><p className="kicker">Python fundamentals</p><h1>Practice the<br /><em>next small step.</em></h1><p>Five focused challenges from the fundamentals set. Every challenge includes its own tests.</p></section><section className="challenge-list shell">{challenges.map((challenge) => <article className="challenge-card" key={challenge.id}><div className="challenge-card-top"><span className="kicker">{challenge.language} Â· {challenge.difficulty}</span><span className="challenge-test-count">{challenge.challenge_tests?.length || 0} test</span></div><h2>{challenge.title}</h2><p>{challenge.description}</p><pre><code>{challenge.starter_code}</code></pre><Link className="secondary-button" href={`/challenge/${challenge.slug}`}>Open challenge <span>&rarr;</span></Link></article>)}</section>{challenges.length === 0 && <p className="empty-challenges shell">Connect Supabase to load your Python challenges.</p>}</main>;
}

