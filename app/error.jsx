"use client";

import MinimalState from "./components/minimal-state";

export default function ErrorPage({ error, reset }) {
  return <MinimalState kind="error" error={error} reset={reset} />;
}
