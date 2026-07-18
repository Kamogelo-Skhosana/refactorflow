"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthForm({ mode }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const response = await fetch(`/api/auth/${mode}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
    const data = await response.json();
    setLoading(false);
    if (response.ok) { window.localStorage.setItem("refactorflow-email", email); if (mode === "signin") { router.push("/dashboard"); return; } }
    setMessage(response.ok ? "Account created. Check your email to confirm it." : data.error || "Something went wrong.");
  }

  return <form className="auth-form" onSubmit={submit}><label>Email<input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label><label>Password<input type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} minLength={6} required value={password} onChange={(event) => setPassword(event.target.value)} /></label><button className="primary-button" disabled={loading}>{loading ? "Working&hellip;" : mode === "signup" ? <>Create account <span>&rarr;</span></> : <>Sign in <span>&rarr;</span></>}</button>{message && <p className="auth-message" role="status">{message}</p>}</form>;
}

