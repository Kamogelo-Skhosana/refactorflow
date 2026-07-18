import Link from "next/link";

const metrics = [["Sessions completed", "12", "+3 this week"], ["Thoughtful pauses", "68%", "+12% this month"], ["Current streak", "6 days", "Keep the loop going"]];

export const metadata = { title: "Dashboard | RefactorFlow" };

export default function DashboardPage() {
  return <main className="dashboard-page"><nav className="dashboard-nav shell"><Link className="brand" href="/">Refactor<span>Flow</span></Link><div className="dashboard-nav-links"><Link href="/challenge">Challenges</Link><Link href="/report">Reports</Link><Link href="/settings">Settings</Link><Link className="text-link" href="/signin">Sign out</Link></div></nav><section className="dashboard-hero shell"><div><p className="kicker">Your workspace</p><h1>Good to see you<br /><em>thinking clearly.</em></h1><p>Use today&apos;s challenge to keep building a more deliberate coding rhythm.</p></div><Link className="primary-button" href="/challenge">Start a challenge <span>&rarr;</span></Link></section><section className="metrics shell">{metrics.map(([label, value, note]) => <article className="metric" key={label}><span className="kicker">{label}</span><strong>{value}</strong><p>{note}</p></article>)}</section><section className="dashboard-grid shell"><article className="dashboard-panel challenge-panel"><div><p className="kicker">Next up</p><h2>Refactor under pressure</h2><p>Practice noticing the first moment you want to rewrite. Take a breath, name the hypothesis, then make the smallest useful change.</p></div><Link className="secondary-button" href="/challenge">View challenge <span>&rarr;</span></Link></article><article className="dashboard-panel"><p className="kicker">Your reflection</p><h2>Progress is a process.</h2><p>Your latest report is ready to review. See where your pauses helped and where you rushed.</p><Link className="secondary-button" href="/report">Open latest report <span>&rarr;</span></Link></article></section></main>;
}

