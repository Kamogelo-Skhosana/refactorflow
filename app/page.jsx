import Link from "next/link";

const features = [
  ["01", "See the shape of your thinking", "RefactorFlow surfaces the pauses, rewrites, and patterns behind every coding session."],
  ["02", "Turn friction into a practice", "Small, focused challenges help you build a more deliberate way to solve problems."],
  ["03", "Keep your progress private", "Your behavioral data belongs to you. Insight stays personal, useful, and actionable."],
];

export default function HomePage() {
  return (
    <main>
      <nav className="nav shell" aria-label="Main navigation">
        <Link className="brand" href="/">Refactor<span>Flow</span></Link>
        <div className="nav-links">
          <a href="#how-it-works">How it works</a>
          <a href="#principles">Principles</a>
          <Link className="text-link" href="/signin">Sign in</Link>
          <Link className="nav-cta" href="/signup">Get started <span>â†—</span></Link>
        </div>
      </nav>

      <section className="hero shell">
        <div className="hero-copy">
          <p className="kicker"><span className="pulse" /> Developer self-awareness, made practical</p>
          <h1>Code with more <em>clarity.</em></h1>
          <p className="hero-text">RefactorFlow is a metacognitive workspace for developers who want to understand not only what they build, but how they think while building it.</p>
          <div className="hero-actions">
            <Link className="primary-button" href="/signup">Start building better <span>â†—</span></Link>
            <Link className="secondary-button" href="/signin">I already have an account</Link>
          </div>
          <p className="microcopy">Free to start Â· No credit card required</p>
        </div>
        <div className="hero-visual" aria-label="Abstract visualization of coding reflection">
          <div className="orbit orbit-one" /><div className="orbit orbit-two" />
          <div className="visual-card"><span className="visual-label">TODAY&apos;S SIGNAL</span><strong>Make space<br />for the <i>next</i> idea.</strong><div className="visual-line"><span /><span /><span /><span /><span /></div><small>Thoughtful pause Â· 00:08</small></div>
          <div className="annotation annotation-top">less rush <span>â†’</span></div><div className="annotation annotation-bottom">more intent <span>â†—</span></div>
        </div>
      </section>

      <section className="statement shell" id="principles"><p>Most tools measure your output.<br /><strong>RefactorFlow helps you notice the process.</strong></p></section>

      <section className="features shell" id="how-it-works">
        {features.map(([number, title, text]) => <article className="feature" key={number}><span className="feature-number">{number}</span><h2>{title}</h2><p>{text}</p></article>)}
      </section>

      <section className="closing shell"><p className="kicker">A better loop starts here</p><h2>Make your process<br /><em>visible.</em></h2><Link className="primary-button" href="/signup">Create your free workspace <span>â†—</span></Link></section>
      <footer className="footer shell"><Link className="brand" href="/">Refactor<span>Flow</span></Link><p>Built for thoughtful builders.</p><p>Â© 2026 RefactorFlow</p></footer>
    </main>
  );
}

