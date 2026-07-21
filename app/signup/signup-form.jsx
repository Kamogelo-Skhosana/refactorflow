"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./signup.module.css";

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

function CheckIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4.5 4.5L19 7" /></svg>;
}

function passwordStrength(value) {
  if (!value) return null;
  if (value.length < 8) return { bars: 1, label: "Weak", color: "red" };
  const letters = /[a-z]/i.test(value);
  const numbers = /\d/.test(value);
  const symbols = /[^a-z0-9]/i.test(value);
  if (letters && numbers && symbols) return { bars: 4, label: "Strong", color: "green" };
  if (letters && numbers) return { bars: 3, label: "Good", color: "blue" };
  return { bars: 2, label: "Fair", color: "amber" };
}

function handleWordmarkClick(event) {
  if (window.localStorage.getItem("refactorflow-access-token")) {
    event.preventDefault();
    window.location.assign("/dashboard");
  }
}

function SessionReportPreview() {
  return <section className={styles.reportCard} aria-label="Example RefactorFlow session report">
    <header className={styles.reportHeader}>
      <span>Session Report</span>
      <code>pseudo_range()</code>
    </header>

    <div className={styles.reportSection}>
      <p className={styles.reportLabel}>Thrashing Index</p>
      <strong className={styles.indexValue}>34</strong>
      <span className={styles.moderateBadge}>Moderate</span>
      <p className={styles.reportCopy}>You backspaced 34% of your keystrokes and had 1 panic pause.</p>
    </div>

    <div className={styles.reportSection}>
      <p className={styles.reportLabel}>Keystroke Tape</p>
      <pre className={styles.tape}><span>def pseudo_range(n):</span><br /><span>    for i in range(1, n + 1):</span><br /><span className={styles.tapeMuted}>    passfor i in range(1i in range(1, n +</span><br /><span className={styles.tapeFinal}>    for i in range(1, n + 1):</span><br /><span className={styles.tapeFinal}>        print(i)</span></pre>
      <p className={styles.tapeLink}>Show full tape &darr;</p>
    </div>

    <div className={styles.reportSection}>
      <p className={styles.reportLabel}>Test Results</p>
      <div className={styles.testsPassed}><span className={styles.testDots} aria-hidden="true"><i /><i /><i /><i /><i /></span><strong>5/5 tests passed</strong></div>
    </div>

    <p className={styles.reportFooter}>Your first session generates a report like this.</p>
  </section>;
}

export default function SignupForm() {
  const router = useRouter();
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmRef = useRef(null);
  const termsRef = useRef(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [magicEmail, setMagicEmail] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [dark, setDark] = useState(false);
  const [creating, setCreating] = useState(false);
  const [sendingMagic, setSendingMagic] = useState(false);
  const [formError, setFormError] = useState("");
  const [magicError, setMagicError] = useState("");
  const [magicSent, setMagicSent] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const preferredDark = window.localStorage.getItem("refactorflow-theme") === "dark" || document.documentElement.classList.contains("dark");
    setDark(preferredDark);
  }, []);

  function toggleTheme() {
    const nextDark = !dark;
    setDark(nextDark);
    document.documentElement.classList.toggle("dark", nextDark);
    window.localStorage.setItem("refactorflow-theme", nextDark ? "dark" : "light");
    window.dispatchEvent(new Event("refactorflow-theme-change"));
  }

  function focusNext(event, ref) {
    if (event.key !== "Enter") return;
    event.preventDefault();
    ref.current?.focus();
  }

  const strength = passwordStrength(password);
  const passwordsMatch = Boolean(confirmPassword) && password === confirmPassword;
  const showConfirmError = confirmTouched && Boolean(confirmPassword) && !passwordsMatch;
  const emailConflict = /already exists|already registered|already been registered/i.test(formError);
  const canSubmit = Boolean(fullName.trim() && email.trim() && password.length >= 8 && passwordsMatch && termsAccepted);

  async function submitSignup(event) {
    event.preventDefault();
    if (!canSubmit || creating) return;

    setCreating(true);
    setFormError("");
    setSuccessMessage("");

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setFormError(data.error || "We could not create your account. Please try again.");
        return;
      }

      window.localStorage.setItem("refactorflow-email", email.trim());
      window.localStorage.setItem("refactorflow-display-name", fullName.trim());
      window.localStorage.setItem("refactorflow-onboarding-pending", "1");

      if (data.session?.access_token) {
        window.localStorage.setItem("refactorflow-access-token", data.session.access_token);
        window.localStorage.removeItem("refactorflow-show-name-prompt");
        setSuccessMessage("Account created - welcome to RefactorFlow!");
        window.setTimeout(() => router.push("/onboarding"), 800);
      } else {
        setSuccessMessage("Account created. Check your inbox to confirm your email.");
      }
    } catch {
      setFormError("We could not create your account. Please try again.");
    } finally {
      setCreating(false);
    }
  }

  async function submitMagicLink(event) {
    event.preventDefault();
    setSendingMagic(true);
    setMagicError("");
    setMagicSent(false);

    try {
      const response = await fetch("/api/auth/signup-magic-link", {
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
      window.localStorage.setItem("refactorflow-onboarding-pending", "1");
      setMagicSent(true);
    } catch {
      setMagicError("We could not send a magic link. Please try again.");
    } finally {
      setSendingMagic(false);
    }
  }

  return <main className={[styles.page, dark ? styles.dark : ""].filter(Boolean).join(" ")}>
    <aside className={styles.brandPanel}>
      <Link className={styles.wordmark} href="/" onClick={handleWordmarkClick}>RefactorFlow</Link>
      <div className={styles.reportWrap}><SessionReportPreview /></div>
      <div className={styles.statLines}>
        <p><i />Tracks every keystroke, pause, and rewrite in real time</p>
        <p><i />Shows you how you think - not just whether you passed</p>
        <p><i />Your behavioral data belongs to you, always</p>
      </div>
    </aside>

    <section className={styles.formPanel}>
      {successMessage && <p className={styles.successBanner} role="status">{successMessage}</p>}
      <div className={styles.mobileHeading}><p className={styles.mobileWordmark}>RefactorFlow</p><p>Free to start. No credit card.</p></div>
      <button className={styles.themeToggle} type="button" onClick={toggleTheme} aria-label={dark ? "Switch to light mode" : "Switch to dark mode"} title={dark ? "Switch to light mode" : "Switch to dark mode"}>
        {dark ? <SunIcon /> : <MoonIcon />}
      </button>

      <div className={styles.formWrap}>
        <header className={styles.formHeader}>
          <h1>Create your account.</h1>
          <p>Free to start. No credit card required.</p>
        </header>

        <form className={styles.signupForm} onSubmit={submitSignup}>
          <label className={styles.fieldLabel} htmlFor="signup-name">Full name</label>
          <input className={styles.field} id="signup-name" type="text" autoComplete="name" placeholder="Your name" maxLength="100" value={fullName} onChange={(event) => setFullName(event.target.value)} onKeyDown={(event) => focusNext(event, emailRef)} required />

          <label className={styles.fieldLabel} htmlFor="signup-email">Email</label>
          <input className={[styles.field, emailConflict ? styles.fieldError : ""].filter(Boolean).join(" ")} id="signup-email" ref={emailRef} type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} onKeyDown={(event) => focusNext(event, passwordRef)} aria-invalid={emailConflict} required />

          <label className={styles.fieldLabel} htmlFor="signup-password">Password</label>
          <div className={styles.passwordField}>
            <input className={styles.field} id="signup-password" ref={passwordRef} type={showPassword ? "text" : "password"} autoComplete="new-password" placeholder="Min. 8 characters" minLength="8" value={password} onChange={(event) => setPassword(event.target.value)} onKeyDown={(event) => focusNext(event, confirmRef)} required />
            <button className={styles.eyeButton} type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}><EyeIcon hidden={showPassword} /></button>
          </div>
          {strength && <div className={[styles.strength, styles["strength" + strength.color]].join(" ")}><span className={styles.strengthBars} aria-hidden="true">{[1, 2, 3, 4].map((bar) => <i className={bar <= strength.bars ? styles.filled : ""} key={bar} />)}</span><span>{strength.label}</span></div>}

          <label className={styles.fieldLabel} htmlFor="signup-confirm-password">Confirm password</label>
          <div className={styles.passwordField}>
            <input className={[styles.field, showConfirmError ? styles.fieldError : "", confirmTouched && passwordsMatch ? styles.fieldValid : ""].filter(Boolean).join(" ")} id="signup-confirm-password" ref={confirmRef} type={showConfirmPassword ? "text" : "password"} autoComplete="new-password" placeholder="Repeat your password" minLength="8" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} onBlur={() => setConfirmTouched(true)} onKeyDown={(event) => focusNext(event, termsRef)} aria-invalid={showConfirmError} required />
            {confirmTouched && passwordsMatch ? <span className={styles.validIcon}><CheckIcon /></span> : <button className={styles.eyeButton} type="button" onClick={() => setShowConfirmPassword((value) => !value)} aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}><EyeIcon hidden={showConfirmPassword} /></button>}
          </div>
          {showConfirmError && <p className={styles.matchError} role="alert">Passwords do not match</p>}

          {formError && <p className={styles.inlineError} role="alert">{formError}</p>}

          <label className={styles.termsRow}>
            <input ref={termsRef} type="checkbox" checked={termsAccepted} onChange={(event) => setTermsAccepted(event.target.checked)} />
            <span>I agree to the <Link href="/terms" target="_blank">Terms of Service</Link> and <Link href="/privacy" target="_blank">Privacy Policy</Link></span>
          </label>

          <button className={styles.submitButton} type="submit" disabled={!canSubmit || creating} aria-label={creating ? "Creating account" : "Create account"}>
            {creating ? <span className={styles.spinner} /> : <>Create account &mdash; it&apos;s free</>}
          </button>
        </form>

        <div className={styles.divider}><span>or</span></div>

        <form className={styles.magicForm} onSubmit={submitMagicLink}>
          <p className={styles.magicLabel}>Sign up without a password</p>
          <label className={styles.srOnly} htmlFor="signup-magic-email">Email for a magic link</label>
          <input className={[styles.field, magicError ? styles.fieldError : ""].filter(Boolean).join(" ")} id="signup-magic-email" type="email" autoComplete="email" placeholder="Enter your email for a magic link" value={magicEmail} onChange={(event) => setMagicEmail(event.target.value)} required />
          {magicError && <p className={styles.inlineError} role="alert">{magicError}</p>}
          {magicSent ? <p className={styles.magicSuccess} role="status">&#10003; Check your inbox &mdash; link sent</p> : <button className={styles.magicButton} type="submit" disabled={sendingMagic}>{sendingMagic ? "Sending..." : "Send magic link"}</button>}
        </form>

        <p className={styles.signinPrompt}>Already have an account? <Link href="/signin">Sign in</Link></p>
      </div>
    </section>
  </main>;
}
