"use client";

import Link from "next/link";
import { useState } from "react";
import MarketingLayout from "../components/marketing-layout";
import styles from "./pricing.module.css";

const plans = [
  {
    name: "Free",
    label: "Always free",
    monthly: 0,
    description: "Build the habit before you pay for more depth.",
    included: ["5 most recent sessions", "Basic Thrashing Index score", "Timed coding exercises", "Static hints", "Non-intrusive ads outside the editor"],
    excluded: ["Full session history", "Keystroke tape", "Pause analysis", "AI session debrief"],
    action: "Get started free",
    href: "/signup",
  },
  {
    name: "Pro",
    label: "Most popular",
    monthly: 12,
    description: "Understand how you code, not just whether you passed.",
    included: ["No ads, ever", "Full session history", "Keystroke tape visualization", "Thoughtful and panic pause analysis", "Thrashing Index trend", "AI session debrief when available", "Exportable progress dashboard", "Real-time coaching nudges"],
    action: "Start Pro",
    href: "/signup?plan=pro",
    featured: true,
  },
  {
    name: "Enterprise",
    label: "Coming soon",
    monthly: null,
    description: "A privacy-first practice system for cohorts and teams.",
    included: ["Aggregate cohort dashboards", "No individual surveillance", "Admin console", "Custom exercise library", "Onboarding acceleration reports", "Priority support and SLA"],
    action: "Join the waitlist",
    href: "mailto:hello@refactorflow.dev?subject=RefactorFlow%20Enterprise%20waitlist",
  },
];

function Price({ plan, annual }) {
  if (plan.monthly === null) return <p className={styles.enterprisePrice}><strong>$30-50</strong><span>/ seat / month</span><small>Minimum 5 seats</small></p>;
  if (plan.monthly === 0) return <p className={styles.price}><strong>Free</strong><span>/ month</span></p>;
  return annual
    ? <p className={styles.price}><strong>$96</strong><span>/ year</span><small>$8 / month equivalent</small></p>
    : <p className={styles.price}><strong>$12</strong><span>/ month</span></p>;
}

export default function PricingClient() {
  const [annual, setAnnual] = useState(true);

  return <MarketingLayout active="pricing">
    <section className={styles.hero}>
      <p className={styles.kicker}>Pricing</p>
      <h1>Start free. Upgrade<br />when you are <em>ready.</em></h1>
      <p>Three tiers. One goal: understand how you code. No credit card to get started. Your behavioral data always belongs to you.</p>
      <div className={styles.billing} role="group" aria-label="Billing period">
        <button className={!annual ? styles.selected : ""} type="button" onClick={() => setAnnual(false)}>Monthly</button>
        <button className={annual ? styles.selected : ""} type="button" onClick={() => setAnnual(true)}>Annual <span>Save 33%</span></button>
      </div>
    </section>

    <section className={styles.plans} aria-label="RefactorFlow plans">
      {plans.map((plan) => <article className={[styles.plan, plan.featured ? styles.featured : ""].filter(Boolean).join(" ")} key={plan.name}>
        <p className={plan.featured ? styles.popular : styles.planLabel}>{plan.label}</p>
        <h2>{plan.name}</h2>
        <Price plan={plan} annual={annual} />
        <p className={styles.planCopy}>{plan.description}</p>
        <Link className={plan.featured ? styles.primary : styles.secondary} href={plan.href}>{plan.action} <span>&rarr;</span></Link>
        <div className={styles.featureBlock}>
          <p>What you get</p>
          <ul>{plan.included.map((feature) => <li key={feature}><i>&#10003;</i>{feature}</li>)}</ul>
          {plan.excluded && <ul className={styles.excluded}>{plan.excluded.map((feature) => <li key={feature}><i>&times;</i>{feature}</li>)}</ul>}
        </div>
        {plan.featured && <small className={styles.noLock}>Cancel anytime &middot; No lock-in</small>}
      </article>)}
    </section>

    <section className={styles.bootcamp}>
      <div><p className={styles.kicker}>Also coming soon</p><h2>Bootcamp &amp; university licensing.</h2></div>
      <div><p>Give learners feedback on the process behind every attempt, without exposing individual behavioral data.</p><a href="mailto:hello@refactorflow.dev?subject=RefactorFlow%20education%20interest">Express interest <span>&rarr;</span></a></div>
    </section>
  </MarketingLayout>;
}
