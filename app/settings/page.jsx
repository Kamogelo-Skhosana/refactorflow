"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "../components/app-shell";
import styles from "./settings.module.css";

function Icon({ name, size = 16 }) {
  const icons = {
    user: <><circle cx="12" cy="8" r="3.5" /><path d="M4.5 21a7.5 7.5 0 0 1 15 0" /></>,
    card: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18M7 15h3" /></>,
    sliders: <><path d="M4 7h7M15 7h5M4 17h11M19 17h1M11 4v6M15 14v6" /></>,
    shield: <><path d="M12 3 20 6v5c0 5-3.4 8.5-8 10-4.6-1.5-8-5-8-10V6l8-3Z" /><path d="m8.5 12 2.1 2.1 4.9-5" /></>,
    logout: <><path d="M10 17l5-5-5-5M15 12H3" /><path d="M21 19V5a2 2 0 0 0-2-2h-5" /></>,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></>,
    moon: <path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5 8.5 8.5 0 1 0 20.5 14.2Z" />,
    upload: <><path d="M12 16V3M7 8l5-5 5 5M4 14v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" /></>,
    lock: <><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
    zap: <path d="m13 2-9 12h7l-1 8 9-12h-7l1-8Z" />,
    check: <><circle cx="12" cy="12" r="8.5" /><path d="m8.5 12 2.2 2.2 4.8-5.1" /></>,
    x: <path d="m6 6 12 12M18 6 6 18" />,
    download: <><path d="M12 3v12M7 10l5 5 5-5M5 21h14" /></>,
    external: <><path d="M14 4h6v6M20 4 10 14" /><path d="M19 13v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5" /></>,
    trash: <><path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5" /></>,
    alert: <><path d="m12 3 9 16H3L12 3Z" /><path d="M12 9v4M12 17h.01" /></>,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    spinner: <path d="M20 12a8 8 0 1 1-2.34-5.66" />,
  };

  return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{icons[name]}</svg>;
}

function Toggle({ checked, label, onChange, disabled }) {
  return <button type="button" className={[styles.toggle, checked ? styles.toggleOn : ""].filter(Boolean).join(" ")} role="switch" aria-checked={checked} aria-label={label} disabled={disabled} onClick={() => onChange(!checked)}><i /></button>;
}

function SectionHeading({ title, description }) {
  return <header className={styles.cardHeading}><h2>{title}</h2><p>{description}</p></header>;
}

function PreferenceRow({ title, description, children, last = false }) {
  return <div className={[styles.preferenceRow, last ? styles.preferenceLast : ""].filter(Boolean).join(" ")}><div><strong>{title}</strong><p>{description}</p></div>{children}</div>;
}

function Avatar({ profile, uploading }) {
  const initial = String(profile?.name || profile?.email || "R").trim().charAt(0).toUpperCase();
  if (uploading) return <span className={[styles.avatar, styles.avatarLoading].join(" ")}><Icon name="spinner" size={28} /></span>;
  return profile?.avatarUrl ? <img className={styles.avatar} src={profile.avatarUrl} alt="Profile photo" /> : <span className={styles.avatar}>{initial}</span>;
}

function FeatureValue({ value, pro = false }) {
  if (value === true) return <Icon name="check" size={14} />;
  if (value === false) return <Icon name="x" size={14} />;
  return <span className={pro ? styles.proValue : ""}>{value}</span>;
}

export default function SettingsPage() {
  const router = useRouter();
  const inputRef = useRef(null);
  const toastTimer = useRef(null);
  const [dark, setDark] = useState(false);
  const [themePreference, setThemePreference] = useState("light");
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState("");
  const [activeSection, setActiveSection] = useState("profile");
  const [fontSize, setFontSize] = useState(14);
  const [billing, setBilling] = useState("monthly");
  const [loading, setLoading] = useState(true);
  const [savingName, setSavingName] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => () => { if (toastTimer.current) window.clearTimeout(toastTimer.current); }, []);

  useEffect(() => {
    const storedPreference = window.localStorage.getItem("refactorflow-theme-preference");
    const fallback = window.localStorage.getItem("refactorflow-theme") === "dark" ? "dark" : "light";
    const preference = ["light", "system", "dark"].includes(storedPreference) ? storedPreference : fallback;
    const storedFont = Number(window.localStorage.getItem("refactorflow-editor-font-size"));
    setThemePreference(preference);
    setFontSize([12, 14, 16].includes(storedFont) ? storedFont : 14);
    applyTheme(preference, false);

    const accessToken = window.localStorage.getItem("refactorflow-access-token");
    if (!accessToken) {
      setLoading(false);
      showToast("Please sign in again to manage settings.", "error");
      return;
    }

    fetch("/api/profile", { headers: { Authorization: "Bearer " + accessToken }, cache: "no-store" })
      .then((response) => response.json().then((data) => ({ response, data })))
      .then(({ response, data }) => {
        if (!response.ok) throw new Error(data.error || "Settings could not be loaded.");
        setProfile(data.profile);
        setName(data.profile.name === "there" ? "" : data.profile.name || "");
      })
      .catch((error) => showToast(error.message || "Settings could not be loaded.", "error"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!showShortcuts) return undefined;
    const closeOnEscape = (event) => { if (event.key === "Escape") setShowShortcuts(false); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [showShortcuts]);

  function showToast(message, tone = "success") {
    setToast({ message, tone });
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3000);
  }

  function applyTheme(preference, persist = true) {
    const resolved = preference === "system" ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : preference;
    setDark(resolved === "dark");
    document.documentElement.classList.toggle("dark", resolved === "dark");
    if (persist) {
      window.localStorage.setItem("refactorflow-theme-preference", preference);
      window.localStorage.setItem("refactorflow-theme", resolved);
      window.dispatchEvent(new Event("refactorflow-theme-change"));
    }
  }

  function selectTheme(preference) {
    setThemePreference(preference);
    applyTheme(preference);
  }

  async function request(path, options = {}) {
    const accessToken = window.localStorage.getItem("refactorflow-access-token");
    if (!accessToken) throw new Error("Please sign in again to continue.");
    const response = await fetch(path, {
      ...options,
      headers: { ...(options.headers || {}), Authorization: "Bearer " + accessToken },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "That setting could not be saved.");
    return data;
  }

  async function saveProfile() {
    setSavingName(true);
    try {
      const data = await request("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: name }),
      });
      setProfile(data.profile);
      window.localStorage.setItem("refactorflow-display-name", data.profile.name || "");
      showToast("Profile updated");
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setSavingName(false);
    }
  }

  async function updatePreference(key, value, success) {
    const before = profile;
    setProfile((current) => current ? { ...current, [key]: value } : current);
    try {
      const payload = key === "emailNotifications" ? { emailNotifications: value } : { nudgesEnabled: value };
      const data = await request("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setProfile(data.profile);
      showToast(success);
    } catch (error) {
      setProfile(before);
      showToast(error.message, "error");
    }
  }

  async function uploadAvatar(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const data = await request("/api/profile/avatar", { method: "POST", body: formData });
      setProfile((current) => ({ ...current, avatarUrl: data.avatarUrl }));
      showToast("Photo updated");
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setUploading(false);
    }
  }

  async function removeAvatar() {
    setUploading(true);
    try {
      const data = await request("/api/profile/avatar", { method: "DELETE" });
      setProfile((current) => ({ ...current, avatarUrl: data.avatarUrl }));
      showToast("Photo removed");
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setUploading(false);
    }
  }

  async function downloadData() {
    setDownloading(true);
    try {
      const accessToken = window.localStorage.getItem("refactorflow-access-token");
      const response = await fetch("/api/user/export", { headers: { Authorization: "Bearer " + accessToken } });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Your data could not be prepared.");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "refactorflow-data.json";
      anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      showToast("Download started");
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setDownloading(false);
    }
  }

  async function signOut(destination = "/signin") {
    const accessToken = window.localStorage.getItem("refactorflow-access-token");
    if (accessToken) {
      await fetch("/api/auth/signout", { method: "POST", headers: { Authorization: "Bearer " + accessToken } }).catch(() => undefined);
    }
    ["refactorflow-access-token", "refactorflow-email", "refactorflow-display-name", "refactorflow-show-name-prompt"].forEach((key) => window.localStorage.removeItem(key));
    router.replace(destination);
  }

  async function deleteAccount() {
    if (confirmation !== "DELETE" || deleting) return;
    setDeleting(true);
    try {
      await request("/api/user", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation }),
      });
      await signOut("/");
    } catch (error) {
      setDeleting(false);
      showToast(error.message, "error");
    }
  }

  function changeFontSize(size) {
    setFontSize(size);
    window.localStorage.setItem("refactorflow-editor-font-size", String(size));
    showToast("Editor font size saved");
  }

  const safeProfile = profile || { name: "there", email: "", tier: "free", avatarUrl: null, emailNotifications: true, nudgesEnabled: true };
  const dirty = Boolean(profile) && name.trim() !== (profile.name || "").trim();
  const tier = safeProfile.tier === "pro" || safeProfile.tier === "team" ? safeProfile.tier : "free";
  const price = billing === "annual" ? "$96 / year" : "$12 / month";
  const sections = [
    { id: "profile", label: "Profile", icon: "user" },
    { id: "subscription", label: "Subscription", icon: "card" },
    { id: "preferences", label: "Preferences", icon: "sliders" },
    { id: "privacy", label: "Data & Privacy", icon: "shield" },
  ];
  const features = [
    ["Session history", "Last 5 only", "Unlimited"],
    ["Thrashing Index", "Basic", "Full + trend chart"],
    ["Keystroke tape", false, true],
    ["Pause analysis", false, true],
    ["AI session debrief", false, true],
    ["Progress dashboard", false, "Exportable"],
    ["Ads", "Shown", "None"],
    ["Real-time nudges", false, true],
  ];

  return <AppShell className={[styles.page, dark ? styles.dark : ""].filter(Boolean).join(" ")} profile={safeProfile} active="settings" dark={dark} onToggle={() => selectTheme(dark ? "light" : "dark")} onSignOut={() => signOut()}>
    <section className={styles.mainPanel}>
      {toast && <aside className={[styles.toast, toast.tone === "error" ? styles.toastError : styles.toastSuccess].join(" ")}><Icon name={toast.tone === "error" ? "x" : "check"} size={16} /><span>{toast.message}</span></aside>}
      <div className={styles.mainInner}>
        <header className={styles.pageHeader}>
          <div><p className={styles.eyebrow}>Account</p><h1>Settings</h1><p>Manage your profile, subscription, and preferences.</p></div>
          <button className={styles.themeButton} type="button" aria-label={dark ? "Switch to light mode" : "Switch to dark mode"} onClick={() => selectTheme(dark ? "light" : "dark")}><Icon name={dark ? "sun" : "moon"} size={18} /></button>
        </header>

        {loading ? <div className={styles.loading}><i /><i /><i /></div> : <div className={styles.settingsGrid}>
          <aside className={styles.sectionNav}>
            {sections.map((section) => <button key={section.id} type="button" className={activeSection === section.id ? styles.sectionActive : ""} onClick={() => setActiveSection(section.id)}><Icon name={section.icon} size={16} />{section.label}</button>)}
            <span />
            <button type="button" className={styles.signOutLink} onClick={() => signOut()}><Icon name="logout" size={14} />Sign out</button>
          </aside>

          <div className={styles.sectionContent}>
            {activeSection === "profile" && <section className={styles.card}>
              <SectionHeading title="Profile" description="Update your name and profile photo." />
              <div className={styles.avatarRow}>
                <Avatar profile={safeProfile} uploading={uploading} />
                <div className={styles.avatarCopy}><strong>Profile photo</strong><p>{uploading ? "Uploading..." : "JPG, PNG or GIF. Max 2MB."}</p><div><button type="button" className={styles.outlineButton} disabled={uploading} onClick={() => inputRef.current?.click()}><Icon name="upload" size={13} />Change photo</button>{safeProfile.avatarUrl && <button type="button" className={styles.removeButton} disabled={uploading} onClick={removeAvatar}>Remove</button>}</div></div>
                <input ref={inputRef} className={styles.hiddenInput} type="file" accept="image/jpeg,image/png,image/gif" onChange={uploadAvatar} />
              </div>
              <label className={styles.field}>Full name<input value={name} placeholder="Your full name" maxLength={100} onChange={(event) => setName(event.target.value)} /></label>
              <label className={styles.field}>Email <small>Email cannot be changed here.</small><span className={styles.readOnlyInput}>{safeProfile.email}<Icon name="lock" size={13} /></span></label>
              <div className={styles.saveRow}><div>{dirty && <p className={styles.unsaved}>You have unsaved changes.</p>}</div><button className={styles.primaryButton} type="button" disabled={savingName || !dirty} onClick={saveProfile}>{savingName ? <><Icon name="spinner" size={14} />Saving...</> : "Save"}</button></div>
            </section>}

            {activeSection === "subscription" && <section className={styles.card}>
              <SectionHeading title="Subscription" description="Manage your plan and billing." />
              <div className={styles.planRow}><div><p>Current plan: <b className={tier === "free" ? styles.freeBadge : styles.proBadge}>{tier === "free" ? "Free" : tier === "team" ? "Team" : "Pro"}</b></p><small>{tier === "free" ? "Limited analytics, ads shown outside the editor." : "Full analytics, no ads, and advanced coaching."}</small></div><Link className={tier === "free" ? styles.primaryButton : styles.outlineButton} href="/pricing"><Icon name={tier === "free" ? "zap" : "external"} size={13} />{tier === "free" ? "Upgrade to Pro" : "Manage plan"}</Link></div>
              {tier === "free" ? <div className={styles.comparison}>
                <div className={styles.comparisonHead}><span>Feature</span><strong>Free</strong><b>Pro</b></div>
                {features.map(([label, free, pro]) => <div className={styles.featureRow} key={label}><span>{label}</span><FeatureValue value={free} /><FeatureValue value={pro} pro /></div>)}
                <div className={styles.billingToggle}><button type="button" className={billing === "monthly" ? styles.billingActive : ""} onClick={() => setBilling("monthly")}>Monthly</button><button type="button" className={billing === "annual" ? styles.billingActive : ""} onClick={() => setBilling("annual")}>Annual (save 33%)</button></div>
                <p className={styles.price}>{price}</p>{billing === "annual" && <p className={styles.priceNote}>($8 / month - save 33%)</p>}
                <Link className={[styles.primaryButton, styles.fullButton].join(" ")} href="/pricing">Continue to Paystack</Link>
              </div> : <div className={styles.billingInfo}><p><span>Plan</span><b>{tier === "team" ? "Team" : "Pro"}</b></p><p><span>Billing</span><b>Managed through Paystack</b></p><p><span>Analytics</span><b>Full access</b></p><Link href="/pricing">View plan options &rarr;</Link></div>}
            </section>}

            {activeSection === "preferences" && <section className={styles.card}>
              <SectionHeading title="Preferences" description="Customize your RefactorFlow experience." />
              <PreferenceRow title="Email notifications" description="Receive a session report email after each exercise."><Toggle label="Email notifications" checked={safeProfile.emailNotifications} onChange={(value) => updatePreference("emailNotifications", value, "Email preference updated")} /></PreferenceRow>
              <PreferenceRow title="Real-time nudges" description="Show coaching messages during sessions based on your behavior."><Toggle label="Real-time nudges" checked={safeProfile.nudgesEnabled} onChange={(value) => updatePreference("nudgesEnabled", value, "Nudge preference updated")} /></PreferenceRow>
              <PreferenceRow title="Appearance" description="Choose your preferred color theme."><div className={styles.choiceGroup}>{["light", "system", "dark"].map((value) => <button type="button" key={value} className={themePreference === value ? styles.choiceActive : ""} onClick={() => selectTheme(value)}>{value.charAt(0).toUpperCase() + value.slice(1)}</button>)}</div></PreferenceRow>
              <PreferenceRow title="Editor font size" description="Default font size for the Monaco code editor."><div className={styles.choiceGroup}>{[12, 14, 16].map((size) => <button type="button" key={size} className={fontSize === size ? styles.fontActive : ""} onClick={() => changeFontSize(size)}>{size}</button>)}</div></PreferenceRow>
              <PreferenceRow title="Keyboard shortcuts" description="View all available keyboard shortcuts." last><button className={styles.textButton} type="button" onClick={() => setShowShortcuts(true)}>View shortcuts</button></PreferenceRow>
            </section>}

            {activeSection === "privacy" && <section className={styles.card}>
              <SectionHeading title="Data & Privacy" description="You own your behavioral data - always." />
              <div className={styles.privacyNote}><Icon name="shield" size={16} /><p>Your keystroke tape, pause events, and session metrics are private to you. They are never shared with employers, instructors, or third parties without your explicit consent. Enterprise dashboards show aggregate data only.</p></div>
              <PreferenceRow title="Download my data" description="Export all your sessions, metrics, and behavioral data as JSON."><button className={styles.outlineButton} type="button" disabled={downloading} onClick={downloadData}>{downloading ? <><Icon name="spinner" size={13} />Preparing...</> : <><Icon name="download" size={13} />Download</>}</button></PreferenceRow>
              <PreferenceRow title="Privacy Policy" description="Read how RefactorFlow handles your data."><a className={styles.textButton} href="/privacy" target="_blank" rel="noreferrer">View policy &rarr; <Icon name="external" size={12} /></a></PreferenceRow>
              <PreferenceRow title="Terms of Service" description="Read the terms governing your use of RefactorFlow." last><a className={styles.textButton} href="/terms" target="_blank" rel="noreferrer">View terms &rarr; <Icon name="external" size={12} /></a></PreferenceRow>
              <div className={styles.dangerZone}><p>Danger Zone</p><div><span><strong>Delete my account</strong><small>Permanently delete your account and all associated data. This action cannot be undone.</small></span><button type="button" className={styles.deleteButton} onClick={() => { setConfirmation(""); setShowDelete(true); }}><Icon name="trash" size={13} />Delete account</button></div></div>
            </section>}
          </div>
        </div>}
      </div>

      {showShortcuts && <div className={styles.modalOverlay} onClick={() => setShowShortcuts(false)}><section className={styles.shortcutModal} role="dialog" aria-modal="true" aria-labelledby="shortcuts-title" onClick={(event) => event.stopPropagation()}><button className={styles.closeModal} type="button" aria-label="Close shortcuts" onClick={() => setShowShortcuts(false)}><Icon name="close" size={16} /></button><h2 id="shortcuts-title">Keyboard Shortcuts</h2>{[["Submit code", "Ctrl/Cmd + Enter"], ["Description tab", "Ctrl/Cmd + 1"], ["Results tab", "Ctrl/Cmd + 2"], ["Hints tab", "Ctrl/Cmd + 3"], ["Dismiss nudge", "Escape"], ["Reset code", "Use the Reset button"]].map(([label, key]) => <p key={label}><span>{label}</span><kbd>{key}</kbd></p>)}</section></div>}

      {showDelete && <div className={styles.modalOverlay}><section className={styles.deleteModal} role="alertdialog" aria-modal="true" aria-labelledby="delete-title"><Icon name="alert" size={28} /><h2 id="delete-title">Delete your account?</h2><p>This will permanently delete your account, all sessions, metrics, keystroke tapes, and behavioral data. This cannot be undone.</p><label>Type DELETE to confirm<input autoFocus value={confirmation} placeholder="Type DELETE here" onChange={(event) => setConfirmation(event.target.value)} /></label><div><button className={styles.cancelButton} type="button" disabled={deleting} onClick={() => setShowDelete(false)}>Cancel</button><button className={styles.confirmDelete} type="button" disabled={confirmation !== "DELETE" || deleting} onClick={deleteAccount}>{deleting ? <><Icon name="spinner" size={14} />Deleting...</> : "Delete my account"}</button></div></section></div>}
    </section>
  </AppShell>;
}
