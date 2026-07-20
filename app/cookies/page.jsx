import Link from "next/link";

export const metadata = { title: "Cookie Policy | RefactorFlow" };

export default function CookiePolicyPage() {
  return <main className="legal-page">
    <nav className="nav shell"><Link className="brand" href="/">Refactor<span>Flow</span></Link><Link className="text-link" href="/">Back home</Link></nav>
    <article className="legal-content shell">
      <p className="kicker">Last updated: 20 July 2026</p>
      <h1>Cookie policy</h1>
      <p>RefactorFlow uses only the small amount of browser storage needed to make the product work reliably and remember choices you make.</p>
      <h2>What we store</h2>
      <p>We may store authentication details, your selected theme, editor preferences, and temporary session information in your browser. These help keep you signed in and preserve your working experience.</p>
      <h2>Why we use it</h2>
      <p>This storage is used for core functionality, security, and remembering preferences. We do not use it to sell personal behavioral data or to build advertising profiles.</p>
      <h2>Your choices</h2>
      <p>You can clear website data through your browser settings at any time. Clearing it may sign you out and reset saved preferences.</p>
      <h2>Questions</h2>
      <p>For questions about this policy or your data, contact the RefactorFlow team through the contact channel available in your account.</p>
    </article>
  </main>;
}
