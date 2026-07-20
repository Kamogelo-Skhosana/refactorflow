"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./landing.module.css";

const faqs = [
  {
    question: "Is my behavioral data private?",
    answer: "Yes - completely. Your keystroke tape, pause events, and session metrics belong to you. We never share individual data with employers, instructors, or third parties without your explicit opt-in. Enterprise dashboards only show aggregate cohort trends, never individual employee data.",
  },
  {
    question: "How is the Thrashing Index calculated?",
    answer: "The Thrashing Index is a composite score from 0-100 derived from your backspace rate, panic pauses, and rewrite frequency. Thoughtful pauses reduce the score. Lower is better: 0-25 is Clean, 26-60 Moderate, and 61-100 Heavy.",
  },
  {
    question: "What is the Keystroke Tape?",
    answer: "The keystroke tape is an append-only record of every character typed during a session. It shows your cognitive trail: attempts, false starts, rewrites, and moments of clarity in chronological order.",
  },
  {
    question: "Does using hints affect my score?",
    answer: "No. Hints never affect your Thrashing Index or pass/fail result. A hint is recorded only for your own reference in the session report.",
  },
  {
    question: "What languages does RefactorFlow support?",
    answer: "Python 3 is available now. The behavioral system is language-agnostic, so Java and more languages can follow as the exercise library expands.",
  },
  {
    question: "Will this replace my current coding practice platform?",
    answer: "No. RefactorFlow measures how you practise, not whether you practise. Think of it as behavioral insight that becomes more useful across your coding sessions.",
  },
  {
    question: "Can I cancel my Pro subscription?",
    answer: "Yes, at any time. Cancellation takes effect at the end of the billing period, so you keep Pro access until then. Billing controls will be available in Settings through Paystack.",
  },
];

const plans = {
  free: [
    [true, "5 most recent sessions"],
    [true, "Basic Thrashing Index score"],
    [true, "Timed coding exercises"],
    [true, "Static hints"],
    [true, "Non-intrusive ads outside the editor"],
    [false, "Full session history"],
    [false, "Keystroke tape visualization"],
    [false, "Pause analysis"],
    [false, "AI session debrief"],
    [false, "Exportable dashboard"],
  ],
  pro: [
    [true, "Everything in Free"],
    [true, "No ads ever"],
    [true, "Full session history"],
    [true, "Keystroke tape visualization"],
    [true, "Thoughtful vs panic pause analysis"],
    [true, "Thrashing Index trend chart"],
    [true, "AI-generated session debrief"],
    [true, "Exportable progress dashboard"],
    [true, "Real-time coaching nudges"],
    [true, "Adaptive hint system"],
  ],
  enterprise: [
    "Everything in Pro",
    "Aggregate cohort dashboards",
    "No individual surveillance",
    "Admin console",
    "Custom exercise library",
    "Onboarding acceleration reports",
    "Priority support + SLA",
  ],
};

function Icon({ name, size = 16 }) {
  const icons = {
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    zap: <path d="m13 2-9 12h7l-1 8 9-12h-7l1-8Z" />,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
    moon: <path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5 8.5 8.5 0 1 0 20.5 14.2Z" />,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    code: <><path d="m8 9-3 3 3 3M16 9l3 3-3 3M14 5l-4 14" /></>,
    activity: <path d="M3 12h4l2-7 4 14 2-7h6" />,
    trend: <><path d="m4 16 5-5 3 3 7-8" /><path d="M14 6h5v5" /></>,
    clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3 2" /></>,
    file: <><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v5h5M9 13h6M9 17h5" /></>,
    brain: <><path d="M9.5 4.2A3.2 3.2 0 0 0 4 6.5a3 3 0 0 0 .5 5.8 3.4 3.4 0 0 0 2.6 5.7c1.1 0 1.9-.5 2.6-1.2M14.5 4.2A3.2 3.2 0 0 1 20 6.5a3 3 0 0 1-.5 5.8 3.4 3.4 0 0 1-2.6 5.7c-1.1 0-1.9-.5-2.6-1.2M12 3v18M8 8.5c1.1 0 2 .9 2 2M16 8.5c-1.1 0-1.9.9-1.9 2" /></>,
    alert: <><path d="m12 3 9 16H3L12 3Z" /><path d="M12 9v4M12 17h.01" /></>,
    check: <><circle cx="12" cy="12" r="8.5" /><path d="m8.5 12 2.2 2.2 4.8-5.1" /></>,
    x: <path d="m6 6 12 12M18 6 6 18" />,
    chevron: <path d="m7 10 5 5 5-5" />,
  };

  return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{icons[name]}</svg>;
}

function Reveal({ children, className = "" }) {
  return <div className={[styles.reveal, className].filter(Boolean).join(" ")}>{children}</div>;
}

function PrimaryButton({ href = "/signup", children, className = "" }) {
  return <Link className={[styles.primaryButton, className].filter(Boolean).join(" ")} href={href}>{children}<Icon name="arrow" size={16} /></Link>;
}

function ComparisonCode({ variant }) {
  if (variant === "clean") {
    return <pre className={styles.codeBlock}><code><span className={styles.keyword}>def</span> <span className={styles.function}>pseudo_range</span>(<span className={styles.parameter}>n</span>):{"\n"}    <span className={styles.keyword}>for</span> <span className={styles.parameter}>i</span> <span className={styles.keyword}>in</span> <span className={styles.builtin}>range</span>(<span className={styles.number}>1</span>, <span className={styles.parameter}>n</span> + <span className={styles.number}>1</span>):{"\n"}        <span className={styles.function}>print</span>(<span className={styles.parameter}>i</span>)</code></pre>;
  }

  return <pre className={styles.codeBlock}><code><span className={styles.keyword}>def</span> <span className={styles.function}>pseudo_range</span>(<span className={styles.parameter}>n</span>):{"\n"}    <span className={styles.strike}>for i in range(n):</span>{"\n"}    <span className={styles.strike}>    print(i)</span>{"\n"}    <span className={styles.faded}>passfor i in range(1</span>{"\n"}    <span className={styles.faded}>for i in range(1, n)</span>{"\n"}    <span className={styles.keyword}>for</span> <span className={styles.parameter}>i</span> <span className={styles.keyword}>in</span> <span className={styles.builtin}>range</span>(<span className={styles.number}>1</span>, <span className={styles.parameter}>n</span> + <span className={styles.number}>1</span>):{"\n"}        <span className={styles.function}>print</span>(<span className={styles.parameter}>i</span>)</code></pre>;
}

function DeveloperPanel({ name, variant }) {
  const clean = variant === "clean";
  return <article className={styles.developerPanel}>
    <div className={styles.panelLabel}><span>{name}</span><b><Icon name="check" size={12} />5/5 passed</b></div>
    <ComparisonCode variant={variant} />
    <div className={styles.metricRow}>
      <span><b>{clean ? "4" : "41"}</b>backspaces</span>
      <span><b>{clean ? "28s" : "4m 12s"}</b>elapsed</span>
      <span><b>{clean ? "1.2x" : "6.8x"}</b>rewrite ratio</span>
    </div>
    <div className={styles.thrashLabel}>Thrashing Index</div>
    <div className={styles.thrashValue}><strong className={clean ? styles.clean : styles.moderate}>{clean ? "12" : "61"}</strong><span className={clean ? styles.cleanPill : styles.moderatePill}>{clean ? "Clean" : "Moderate"}</span></div>
  </article>;
}

function HeroVisual() {
  return <div className={styles.heroVisual}>
    <div className={styles.windowBar}><i /><i /><i /><span>Session Report - pseudo_range()</span></div>
    <div className={styles.comparisonBody}><DeveloperPanel name="Developer A" variant="clean" /><DeveloperPanel name="Developer B" variant="rewrite" /></div>
    <div className={styles.comparisonFooter}>Both passed. <b>RefactorFlow</b> saw the difference.</div>
  </div>;
}

function SignalCard({ kind, icon, title, description, children }) {
  return <article className={[styles.signalCard, styles[kind]].join(" ")}>
    <span className={styles.signalMark}>{kind === "thrashing" ? "TI" : kind === "pauses" ? "P" : "KT"}</span>
    <Icon name={icon} size={28} />
    <h3>{title}</h3>
    <p>{description}</p>
    {children}
  </article>;
}

function FeatureList({ items, muted = false }) {
  return <ul className={[styles.featureList, muted ? styles.featureMuted : ""].filter(Boolean).join(" ")}>{items.map((item) => {
    const included = Array.isArray(item) ? item[0] : true;
    const label = Array.isArray(item) ? item[1] : item;
    return <li key={label}><Icon name={included ? "check" : "x"} size={14} />{label}</li>;
  })}</ul>;
}

export default function LandingClient() {
  const [dark, setDark] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const [billing, setBilling] = useState("monthly");

  useEffect(() => {
    const preferred = window.localStorage.getItem("refactorflow-theme") === "dark" || document.documentElement.classList.contains("dark");
    setDark(preferred);
    document.documentElement.classList.toggle("dark", preferred);

    const onScroll = () => setScrolled(window.scrollY > 40);
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add(styles.revealed);
    }), { threshold: 0.1 });
    document.querySelectorAll("." + styles.reveal).forEach((element) => observer.observe(element));
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    window.localStorage.setItem("refactorflow-theme", next ? "dark" : "light");
    window.localStorage.setItem("refactorflow-theme-preference", next ? "dark" : "light");
    window.dispatchEvent(new Event("refactorflow-theme-change"));
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  const proPrice = billing === "monthly" ? "$12" : "$8";
  const proSuffix = billing === "monthly" ? "/ month" : "/ month";
  const proNote = billing === "monthly" ? "Cancel anytime" : "$96 billed annually";

  return <main className={[styles.page, dark ? styles.dark : ""].filter(Boolean).join(" ")}>
    <nav className={[styles.nav, scrolled ? styles.navScrolled : ""].filter(Boolean).join(" ")}>
      <div className={styles.navInner}>
        <Link className={styles.wordmark} href="/">RefactorFlow</Link>
        <div className={styles.navLinks}><a href="#how-it-works">How it works</a><a href="#pricing">Pricing</a><a href="#faq">FAQ</a></div>
        <div className={styles.navActions}>
          <button className={styles.themeButton} type="button" onClick={toggleTheme} aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}><Icon name={dark ? "sun" : "moon"} size={18} /></button>
          <Link className={styles.signIn} href="/signin">Sign in</Link>
          <Link className={styles.navCta} href="/signup">Start for free</Link>
        </div>
        <button className={styles.menuButton} type="button" onClick={() => setMenuOpen(true)} aria-label="Open menu"><Icon name="menu" size={21} /></button>
      </div>
    </nav>

    <div className={[styles.mobileMenu, menuOpen ? styles.mobileMenuOpen : ""].join(" ")} aria-hidden={!menuOpen}>
      <div><Link className={styles.wordmark} href="/" onClick={closeMenu}>RefactorFlow</Link><button type="button" onClick={closeMenu} aria-label="Close menu"><Icon name="close" size={23} /></button></div>
      <nav><a href="#how-it-works" onClick={closeMenu}>How it works</a><a href="#pricing" onClick={closeMenu}>Pricing</a><a href="#faq" onClick={closeMenu}>FAQ</a><Link href="/signin" onClick={closeMenu}>Sign in</Link><Link className={styles.mobileCta} href="/signup" onClick={closeMenu}>Start for free</Link></nav>
    </div>

    <section className={styles.hero}>
      <div className={styles.heroInner}>
        <div className={styles.heroBadge}><Icon name="zap" size={13} />Developer behavior intelligence</div>
        <h1>Same answer.<br />Completely different <span className={styles.underlined}>process<svg viewBox="0 0 180 12" preserveAspectRatio="none" aria-hidden="true"><path d="M2 8c22-7 35 3 56-1s38-7 59-2 39-4 61-2" /></svg></span>.</h1>
        <p className={styles.heroCopy}>Every coding platform asks one question: did your solution pass? RefactorFlow asks a better one - how did you get there.</p>
        <div className={styles.heroActions}><PrimaryButton>Start for free</PrimaryButton><a className={styles.secondaryButton} href="#how-it-works">See how it works</a></div>
        <HeroVisual />
        <p className={styles.heroNote}>No credit card required <span>&middot;</span> Free to start <span>&middot;</span> Your data stays yours</p>
      </div>
    </section>

    <section className={styles.proofBar}>
      <div className={styles.proofInner}>
        {[["0", "direct competitors in behavioral coding analytics"], ["$0", "current market investment in this category"], ["6", "stakeholders validated the concept"], ["4hrs", "avg time junior devs thrash before asking for help"]].map(([value, label], index) => <div className={styles.proofItem} key={label}><strong>{value}</strong><span>{label}</span>{index < 3 && <i />}</div>)}
      </div>
    </section>

    <Reveal className={styles.problemSection}>
      <div className={styles.splitSection}>
        <div className={styles.problemCopy}><p className={styles.eyebrow}>The problem</p><h2>Every platform checks if your code works.<br />None of them show you how you think.</h2><p>There are over 30 million software developers worldwide. Every year, developers spend billions of hours learning, practicing, and improving. Yet nearly every coding platform evaluates them the same way: did the solution pass? That&apos;s it.</p><p>Imagine two developers solve the same problem. One understands it immediately, writes clean code, and finishes confidently. The other spends 30 minutes rewriting, backspacing, getting stuck, and debugging. Traditional platforms treat them as identical because both eventually pass.</p><blockquote>&quot;You don&apos;t know if your code is a beautiful, sturdy house or a house of cards held together by duct tape and AI prompts.&quot;<cite>- Bootcamp Graduate / Frontend Developer</cite></blockquote></div>
        <div className={styles.platformComparison}>
          <article><div className={styles.passRow}><span><b className={styles.avatarA}>A</b><em>Dev A</em><i><Icon name="check" size={12} />Passed</i></span><span><b className={styles.avatarB}>B</b><em>Dev B</em><i><Icon name="check" size={12} />Passed</i></span></div><small>What most platforms see:</small><strong>Both passed.</strong></article>
          <div className={styles.downArrow}>&darr;</div>
          <article className={styles.behaviorCard}><div><span>Dev A</span><b className={styles.clean}>Thrashing Index: 12 &middot; Clean &middot; 28s</b></div><div><span>Dev B</span><b className={styles.moderate}>Thrashing Index: 61 &middot; Moderate &middot; 4m 12s</b></div><small>What RefactorFlow sees:</small><strong>A completely different story.</strong></article>
        </div>
      </div>
    </Reveal>

    <Reveal className={styles.howSection} id="how-it-works">
      <p className={styles.eyebrow}>How it works</p><h2>From first keystroke to actionable insight.</h2><p className={styles.sectionLead}>Three steps. One session. A complete picture of how you code.</p>
      <div className={styles.steps}>
        {[["01", "code", "Code in the editor", "Choose an exercise and start coding in the Monaco editor. Timed sessions include adaptive hints if you get stuck."], ["02", "activity", "Behavior is captured", "Every keystroke, pause, and rewrite is recorded in real time. Your coding trail builds as you work."], ["03", "trend", "See how you think", "Your Thrashing Index, pause patterns, and keystroke tape become a report that improves over time."]].map(([number, icon, title, text], index) => <article className={styles.step} key={number}><span>{number}</span><div><Icon name={icon} size={32} /></div><h3>{title}</h3><p>{text}</p>{index < 2 && <i className={styles.stepLine}><Icon name="arrow" size={15} /></i>}</article>)}
      </div>
    </Reveal>

    <Reveal className={styles.signalsSection}>
      <p className={styles.eyebrow}>The three signals</p><h2>What RefactorFlow measures.</h2><p className={styles.sectionLead}>Behavioral data that no pass/fail system can see.</p>
      <div className={styles.signals}>
        <SignalCard kind="thrashing" icon="zap" title="Thrashing Index" description="A composite score from 0-100. Derived from your backspace rate, panic pauses, and rewrite frequency. Lower means cleaner thinking."><div className={styles.bands}><span><i className={styles.dotGreen} />0-25 <b>Clean</b></span><span><i className={styles.dotAmber} />26-60 <b>Moderate</b></span><span><i className={styles.dotRed} />61-100 <b>Heavy</b></span></div></SignalCard>
        <SignalCard kind="pauses" icon="clock" title="Pause Detection" description="Not all pauses are equal. We distinguish thoughtful architecture from the moments when your confidence starts to spiral."><div className={styles.bands}><span><i className={styles.dotAmber} />2-8 seconds <b><Icon name="brain" size={12} />Thoughtful</b></span><span><i className={styles.dotRed} />8+ seconds <b><Icon name="alert" size={12} />Panic</b></span></div></SignalCard>
        <SignalCard kind="tape" icon="file" title="Keystroke Tape" description="Every character you type is appended forward. The tape reveals every attempt, detour, and moment of clarity."><div className={styles.tapePreview}><code>def double(num):{"\n"}  <span>pass</span><b>return num * 2</b></code><small>starter code &middot; new attempt</small></div></SignalCard>
      </div>
    </Reveal>

    <Reveal className={styles.pricingSection} id="pricing">
      <p className={styles.eyebrow}>Pricing</p><h2>Start free. Upgrade when you&apos;re ready.</h2><p className={styles.sectionLead}>No credit card required to get started.</p>
      <div className={styles.billingToggle}><button type="button" className={billing === "monthly" ? styles.billingActive : ""} onClick={() => setBilling("monthly")}>Monthly</button><button type="button" className={billing === "annual" ? styles.billingActive : ""} onClick={() => setBilling("annual")}>Annual <b>Save 33%</b></button></div>
      <div className={styles.pricingCards}>
        <article className={styles.priceCard}><p>Free</p><h3>$0 <small>/ month</small></h3><span>Always free</span><Link href="/signup" className={styles.outlineCta}>Get started free</Link><FeatureList items={plans.free} /></article>
        <article className={[styles.priceCard, styles.proCard].join(" ")}><b className={styles.popular}>Most popular</b><p>Pro</p><h3>{proPrice} <small>{proSuffix}</small></h3>{billing === "annual" && <del>$12</del>}<span>{proNote}</span><Link href="/signup" className={styles.proCta}>Start Pro</Link><FeatureList items={plans.pro} /></article>
        <article className={[styles.priceCard, styles.enterpriseCard].join(" ")}><b className={styles.comingSoon}>Coming soon</b><p>Enterprise</p><h3>$30-50 <small>/ seat / month</small></h3><span>Min. 5 seats</span><a className={styles.outlineCta} href="mailto:hello@refactorflow.com">Join the waitlist</a><FeatureList items={plans.enterprise} muted /></article>
      </div>
      <p className={styles.bundleNote}>Bootcamp bundling and university site licensing - coming soon. <a href="mailto:hello@refactorflow.com">Express interest &rarr;</a></p>
    </Reveal>

    <Reveal className={styles.faqSection} id="faq">
      <p className={styles.eyebrow}>FAQ</p><h2>Questions we get a lot.</h2>
      <div className={styles.faqList}>{faqs.map((faq, index) => <article key={faq.question}><button type="button" aria-expanded={openFaq === index} onClick={() => setOpenFaq(openFaq === index ? -1 : index)}><span>{faq.question}</span><Icon name="chevron" size={18} /></button><div className={openFaq === index ? styles.answerOpen : styles.answer}><p>{faq.answer}</p></div></article>)}</div>
    </Reveal>

    <section className={styles.finalCta}>
      <div><h2>Your next solution will pass either way.<br />See how you got <span className={styles.underlined}>there<svg viewBox="0 0 120 12" preserveAspectRatio="none" aria-hidden="true"><path d="M2 8c18-7 29 3 43-1s27-7 40-2 22-4 33-2" /></svg></span>.</h2><p>Free to start. No credit card. Your data stays yours.</p><PrimaryButton className={styles.finalButton}>Start for free</PrimaryButton><small>Already have an account? <Link href="/signin">Sign in</Link></small></div>
    </section>

    <footer className={styles.footer}>
      <div className={styles.footerTop}><div><Link className={styles.footerWordmark} href="/">RefactorFlow</Link><p>Measure how you code, not just whether you pass.</p></div><nav><a href="#how-it-works">How it works</a><a href="#pricing">Pricing</a><a href="#faq">FAQ</a><Link href="/signin">Sign in</Link><Link href="/signup">Start free</Link></nav><div className={styles.legalLinks}><Link href="/privacy">Privacy Policy</Link><Link href="/terms">Terms of Service</Link><Link href="/cookies">Cookie Policy</Link></div></div>
      <div className={styles.footerBottom}><span>&copy; 2026 RefactorFlow. All rights reserved.</span><em>Built for developers who want to understand how they think.</em></div>
    </footer>
  </main>;
}
