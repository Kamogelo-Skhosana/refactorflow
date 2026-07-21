"use client";

import Link from "next/link";
import { useState } from "react";
import MarketingLayout from "../components/marketing-layout";
import styles from "./pricing.module.css";

const plans = [
  {
    name: "Free",
    monthly: 0,
    description: "Build a steadier coding practice, at your own pace.",
    features: ["3 challenge sessions each week", "Session timer and test results", "Core behavior signals", "Personal progress dashboard"],
    action: "Start free",
    href: "/signup",
  },
  {
    name: "Flow",
    monthly: 12,
    description: "See the patterns behind your strongest work.",
    features: ["Unlimited challenge sessions", "Full behavioral reports", "Keystroke tape replay", "Personal trend insights", "Priority support"],
    action: "Start Flow",
    href: "/signup",
    featured: true,
  },
  {
    name: "Teams",
    monthly: null,
    description: "A shared practice space for ambitious engineering teams.",
    features: ["Everything in Flow", "Team-level insights", "Private challenge libraries", "Admin controls", "Guided onboarding"],
    action: "Talk to us",
    href: "mailto:hello@refactorflow.dev",
  },
];

function Price({ plan, annual }) {
  if (plan.monthly === null) return <strong className={styles.customPrice}>Custom</strong>;
  const amount = annual ? Math.round(plan.monthly * 0.8) : plan.monthly;
  return <p className={styles.price}><strong>{amount === 0 ? "Free" : "$" + amount}</strong>{amount > 0 && <span>/ month</span>}</p>;
}

export default function PricingClient() {
  const [annual, setAnnual] = useState(true);

  return <MarketingLayout active="pricing">
    <section className={styles.hero}>
      <p className={styles.kicker}>Simple pricing</p>
      <h1>Practice with clarity.<br /><em>Grow with evidence.</em></h1>
      <p>Start free, then choose the depth of feedback that helps you improve. Payments are processed securely with Paystack.</p>
      <div className={styles.billing} role="group" aria-label="Billing period">
        <button className={!annual ? styles.selected : ""} type="button" onClick={() => setAnnual(false)}>Monthly</button>
        <button className={annual ? styles.selected : ""} type="button" onClick={() => setAnnual(true)}>Annual <span>Save 20%</span></button>
      </div>
    </section>

    <section className={styles.plans} aria-label="RefactorFlow plans">
      {plans.map((plan) => <article className={[styles.plan, plan.featured ? styles.featured : ""].filter(Boolean).join(" ")} key={plan.name}>
        {plan.featured && <p className={styles.popular}>Most popular</p>}
        <p className={styles.planName}>{plan.name}</p>
        <Price plan={plan} annual={annual} />
        <p className={styles.planCopy}>{plan.description}</p>
        <Link className={plan.featured ? styles.primary : styles.secondary} href={plan.href}>{plan.action} <span>&rarr;</span></Link>
        <ul>
          {plan.features.map((feature) => <li key={feature}><i>&#10003;</i>{feature}</li>)}
        </ul>
      </article>)}
    </section>

    <section className={styles.answer}>
      <div>
        <p className={styles.kicker}>A fair start</p>
        <h2>Start with the work, not a credit card.</h2>
      </div>
      <p>Every account begins on Free. Upgrade only when deeper reports and unlimited practice feel useful. You can manage or cancel your subscription at any time.</p>
    </section>
  </MarketingLayout>;
}
