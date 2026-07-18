"use client";
import { useState } from "react";

export default function AuthForm({ mode }) {
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [message, setMessage] = useState(""); const [loading, setLoading] = useState(false);
  async function submit(event) { event.preventDefault(); setLoading(true); setMessage(""); const response = await fetch(`/api/auth/${mode}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) }); const data = await response.json(); setLoading(false); setMessage(response.ok ? (mode === "signup" ? "Account created. Check your email to confirm it." : "Signed in successfully.") : data.error || "Something went wrong."); }
  return <form className="auth-form" onSubmit={submit}><label>Email<input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label><label>Password<input type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} minLength={6} required value={password} onChange={(event) => setPassword(event.target.value)} /></label><button className="primary-button" disabled={loading}>{loading ? "Workingâ€¦" : mode === "signup" ? "Create account â†’" : "Sign in â†’"}</button>{message && <p className="auth-message" role="status">{message}</p>}</form>;
}

