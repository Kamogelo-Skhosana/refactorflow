import Link from "next/link";

const plans = [
  { name: "Free", price: "R0", description: "Build a consistent reflection habit.", features: ["3 challenges per month", "Personal session summaries", "Private progress history"], action: "Start for free" },
  { name: "Flow", price: "R149", suffix: "/ month", description: "Go deeper with unlimited practice.", features: ["Unlimited challenges", "Behavior trends and streaks", "Personal coaching prompts"], action: "Choose Flow", featured: true },
  { name: "Teams", price: "Custom", description: "Create a healthier engineering practice together.", features: ["Aggregate-only team insights", "Shared challenge library", "Team onboarding support"], action: "Talk to us" },
];

export default function PricingPage() {
  return <main className="inner-page"><nav className="nav shell" aria-label="Main navigation"><Link className="brand" href="/">Refactor<span>Flow</span></Link><div className="nav-links"><a href="/#how-it-works">How it works</a><a href="/#principles">Principles</a><Link href="/pricing">Pricing</Link><Link className="text-link" href="/signin">Sign in</Link><Link className="nav-cta" href="/signup">Get started <span>&rarr;</span></Link></div></nav><section className="page-heading shell"><p className="kicker">Pricing</p><h1>Invest in a clearer<br /><em>working rhythm.</em></h1><p>Start privately, build a habit, and upgrade when RefactorFlow becomes part of your everyday practice.</p></section><section className="plans shell">{plans.map((plan) => <article className={`plan ${plan.featured ? "featured" : ""}`} key={plan.name}>{plan.featured && <span className="plan-badge">Most popular</span>}<p className="kicker">{plan.name}</p><h2>{plan.price}<small>{plan.suffix}</small></h2><p>{plan.description}</p><ul>{plan.features.map((feature) => <li key={feature}>&#10003; {feature}</li>)}</ul><Link className={plan.featured ? "primary-button" : "secondary-button"} href="/signup">{plan.action} <span>&rarr;</span></Link></article>)}</section><p className="page-note shell">All plans are designed around individual ownership of behavioral data. Team insights are aggregate-only.</p></main>;
}

