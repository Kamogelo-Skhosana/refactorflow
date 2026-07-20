"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./signin.module.css";

function SunIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></svg>;
}

function MoonIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5 8.5 8.5 0 1 0 20.5 14.2Z" /></svg>;
}

function EyeIcon({ hidden }) {
  return hidden
    ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.1A10.9 10.9 0 0 1 12 4c5.4 0 9.5 5.2 9.5 8s-1.6 4.2-3.9 5.7M6.2 6.2C3.8 7.8 2.5 10.1 2.5 12c0 2.8 4.1 8 9.5 8 1.2 0 2.3-.2 3.3-.6" /></svg>
    : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12S6.6 4 12 4s9.5 5.2 9.5 8-4.1 8-9.5 8-9.5-5.2-9.5-8Z" /><circle cx="12" cy="12" r="3" /></svg>;
}

function ComparisonCard() {
  return <section className={styles.comparison} aria-label="How RefactorFlow sees two coding processes">
    <p className={styles.comparisonTitle}>Same answer. Different process.</p>
    <div className={styles.codePanels}>
      <article className={styles.codePanel}>
        <div className={styles.panelHeader}><span className={styles.developerA}>Developer A</span><span className={styles.badge}>&#10003; 5/5</span></div>
        <pre className={styles.codeBlock}>def is_palindrome(s):{"
"}    clean = s.lower(){"
"}    return clean == clean[::-1]</pre>
        <p className={styles.codeMetric}>4 backspaces &middot; 28s</p>
      </article>
      <article className={styles.codePanel}>
        <div className={styles.panelHeader}><span className={styles.developerB}>Developer B</span><span className={styles.badge}>&#10003; 5/5</span></div>
        <pre className={styles.codeBlock}>def is_palindrome(s):{"
"}    <del>if s == s[::-1]:</del>{"
"}    <del>return True</del>{"
"}    clean = s.lower(){"
"}    return clean == clean[::-1]</pre>
        <p className={styles.codeMetric}>47 backspaces &middot; 4m 12s</p>
      </article>
    </div>
    <p className={styles.comparisonNote}>RefactorFlow saw the difference. Your next session will too.</p>
  </section>;
}

export default function SigninForm() {
  const router = useRouter();
  const passwordRef = useRef(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [magicEmail, setMagicEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [dark, setDark] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [sendingMagic, setSendingMagic] = useState(false);
  const [signInError, setSignInError] = useState("");
  const [magicError, setMagicError] = useState("");
  const [magicSent, setMagicSent] = useState(false);

  useEffect(() => {
    const preferredDark = window.localStorage.getItem("refactorflow-theme") === "dark" || document.documentElement.classList.contains("dark");
    setDark(preferredDark);

    const fragment = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const accessToken = fragment.get("access_token");
    if (!accessToken) return;
    window.localStorage.setItem("refactorflow-access-token", accessToken);
    window.localStorage.setItem("refactorflow-show-name-prompt", "1");
    window.history.replaceState({}, document.title, window.location.pathname);
    router.replace("/dashboard");
  }, [router]);

  function toggleTheme() {
    const nextDark = !dark;
    setDark(nextDark);
    document.documentElement.classList.toggle("dark", nextDark);
    window.localStorage.setItem("refactorflow-theme", nextDark ? "dark" : "light");
    window.dispatchEvent(new Event("refactorflow-theme-change"));
  }

  function handleEmailKeyDown(event) {
    if (event.key !== "Enter") return;
    event.preventDefault();
    passwordRef.current?.focus();
  }

  async function submitPassword(event) {
    event.preventDefault();
    setSigningIn(true);
    setSignInError("");
    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setSignInError(data.error || "Invalid login credentials. Please check your email and password.");
        return;
      }
      window.localStorage.setItem("refactorflow-email", email.trim());
      if (data.session?.access_token) window.localStorage.setItem("refactorflow-access-token", data.session.access_token);
      window.localStorage.setItem("refactorflow-show-name-prompt", "1");
      router.push("/dashboard");
    } catch {
      setSignInError("We could not sign you in right now. Please try again.");
    } finally {
      setSigningIn(false);
    }
  }

  async function submitMagicLink(event) {
    event.preventDefault();
    setSendingMagic(true);
    setMagicError("");
    setMagicSent(false);
    try {
      const response = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: magicEmail }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setMagicError(data.error || "We could not send a magic link. Please try again.");
        return;
      }
      window.localStorage.setItem("refactorflow-email", magicEmail.trim());
      setMagicSent(true);
    } catch {
      setMagicError("We could not send a magic link. Please try again.");
    } finally {
      setSendingMagic(false);
    }
  }

  return <main className={[styles.page, dark ? styles.dark : ""].filter(Boolean).join(" ")}>
    <aside className={styles.brandPanel}>
      <Link className={styles.wordmark} href="/">RefactorFlow</Link>
      <div className={styles.comparisonWrap}><ComparisonCard /></div>
      <p className={styles.concepts}><span>Thrashing Index</span><span>Pause Detection</span><span>Keystroke Tape</span></p>
    </aside>

    <section className={styles.formPanel}>
      <p className={styles.mobileWordmark}>RefactorFlow</p>
      <button className={styles.themeToggle} type="button" onClick={toggleTheme} aria-label={dark ? "Switch to light mode" : "Switch to dark mode"} title={dark ? "Switch to light mode" : "Switch to dark mode"}>
        {dark ? <SunIcon /> : <MoonIcon />}
      </button>

      <div className={styles.formWrap}>
        <header className={styles.formHeader}>
          <h1>Welcome back.</h1>
          <p>Sign in to continue your session analysis.</p>
        </header>

        <form className={styles.signinForm} onSubmit={submitPassword}>
          <label className={styles.fieldLabel} htmlFor="signin-email">Email</label>
          <input className={[styles.field, signInError ? styles.fieldError : ""].filter(Boolean).join(" ")} id="signin-email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} onKeyDown={handleEmailKeyDown} required />

          <div className={styles.passwordLabelRow}><label className={styles.fieldLabel} htmlFor="signin-password">Password</label><Link href="/forgot-password">Forgot password?</Link></div>
          <div className={styles.passwordField}>
            <input className={[styles.field, signInError ? styles.fieldError : ""].filter(Boolean).join(" ")} id="signin-password" ref={passwordRef} type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder={String.fromCharCode(8226).repeat(8)} value={password} onChange={(event) => setPassword(event.target.value)} minLength={6} required />
            <button className={styles.eyeButton} type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}><EyeIcon hidden={showPassword} /></button>
          </div>

          {signInError && <p className={styles.inlineError} role="alert">{signInError}</p>}
          <button className={styles.submitButton} type="submit" disabled={signingIn} aria-label={signingIn ? "Signing in" : "Sign in"}>{signingIn ? <span className={styles.spinner} /> : "Sign in"}</button>
        </form>

        <div className={styles.divider}><span>or</span></div>

        <form className={styles.magicForm} onSubmit={submitMagicLink}>
          <p className={styles.magicLabel}>Sign in without a password</p>
          <label className={styles.srOnly} htmlFor="magic-email">Email for a magic link</label>
          <input className={[styles.field, magicError ? styles.fieldError : ""].filter(Boolean).join(" ")} id="magic-email" type="email" autoComplete="email" placeholder="Enter your email for a magic link" value={magicEmail} onChange={(event) => setMagicEmail(event.target.value)} required />
          {magicError && <p className={styles.inlineError} role="alert">{magicError}</p>}
          {magicSent ? <p className={styles.magicSuccess} role="status">&#10003; Check your inbox</p> : <button className={styles.magicButton} type="submit" disabled={sendingMagic}>{sendingMagic ? "Sending..." : "Send magic link"}</button>}
        </form>

        <p className={styles.signupPrompt}>Don&apos;t have an account? <Link href="/signup">Create one free</Link></p>
      </div>
    </section>
  </main>;
}
