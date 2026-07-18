"use client";
import { useEffect, useState } from "react";
export default function ThemeToggle() { const [dark, setDark] = useState(false); useEffect(() => { const value = window.localStorage.getItem("refactorflow-theme") === "dark"; setDark(value); document.documentElement.classList.toggle("dark", value); }, []); function toggle() { const next = !dark; setDark(next); window.localStorage.setItem("refactorflow-theme", next ? "dark" : "light"); document.documentElement.classList.toggle("dark", next); window.dispatchEvent(new Event("refactorflow-theme-change")); } return <button className="theme-toggle" type="button" onClick={toggle}>{dark ? "Use light mode" : "Use dark mode"}</button>; }

