import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function getSupabaseConfig() {
  return {
    url: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
    secret: process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY,
    publishable: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  };
}

function label(value) {
  return String(value || "").replace(/[-_]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function functionName(challenge) {
  const signature = String(challenge?.starter_code || "").split("\n").find((line) => /^\s*(def|function)\s+/.test(line));
  const match = signature?.match(/(?:def|function)\s+([a-zA-Z_]\w*)/);
  return (match?.[1] || challenge?.slug || "challenge") + "()";
}

function safeNumber(value, maximum = Number.MAX_SAFE_INTEGER) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(Math.max(0, Math.round(number)), maximum) : 0;
}

async function getAuthenticatedUser(request, url, publishable) {
  const authorization = request.headers.get("authorization") || "";
  if (!authorization.startsWith("Bearer ")) return null;

  const response = await fetch(url + "/auth/v1/user", {
    headers: { apikey: publishable, Authorization: authorization },
    cache: "no-store",
  });

  return response.ok ? response.json() : null;
}

export async function GET(request) {
  const { url, secret, publishable } = getSupabaseConfig();
  if (!url || !secret || !publishable) {
    return NextResponse.json({ error: "Session history is not configured yet." }, { status: 503 });
  }

  const user = await getAuthenticatedUser(request, url, publishable);
  if (!user?.id) {
    return NextResponse.json({ error: "Please sign in again to view your history." }, { status: 401 });
  }

  const headers = { apikey: secret, Authorization: "Bearer " + secret };
  const sessionResponse = await fetch(
    url + "/rest/v1/sessions?user_id=eq." + encodeURIComponent(user.id) + "&select=id,exercise_id,duration_ms,run_result,created_at&order=created_at.desc&limit=250",
    { headers, cache: "no-store" },
  );
  if (!sessionResponse.ok) {
    return NextResponse.json({ error: "Your session history could not be loaded." }, { status: 502 });
  }

  const sessions = await sessionResponse.json();
  const sessionIds = sessions.map((session) => session.id).filter(Boolean);
  const [challengeResponse, metricResponse] = await Promise.all([
    fetch(url + "/rest/v1/challenges?select=id,slug,title,language,difficulty,starter_code", { headers, cache: "no-store" }),
    sessionIds.length
      ? fetch(url + "/rest/v1/metrics?session_id=in.(" + sessionIds.map(encodeURIComponent).join(",") + ")&select=session_id,keystroke_count,backspace_count,pause_count,thrashing_index,analysis", { headers, cache: "no-store" })
      : Promise.resolve(null),
  ]);

  const challenges = challengeResponse.ok ? await challengeResponse.json() : [];
  const metrics = metricResponse?.ok ? await metricResponse.json() : [];
  const challengeById = new Map(challenges.map((challenge) => [challenge.id, challenge]));
  const metricsBySession = new Map(metrics.map((metric) => [metric.session_id, metric]));

  const history = sessions.map((session) => {
    const challenge = challengeById.get(session.exercise_id);
    const metric = metricsBySession.get(session.id) || {};
    const runResult = session.run_result && typeof session.run_result === "object" ? session.run_result : {};
    const analysis = metric.analysis && typeof metric.analysis === "object" ? metric.analysis : {};
    const total = Math.max(safeNumber(runResult.total, 999), 1);
    const passedCount = Math.min(safeNumber(runResult.passed, total), total);
    const passed = runResult.status === "passed" || passedCount === total;

    return {
      id: session.id,
      createdAt: session.created_at,
      durationMs: safeNumber(session.duration_ms, 86_400_000),
      challenge: challenge ? { title: challenge.title, slug: challenge.slug, functionName: functionName(challenge), topic: label(challenge.language) + " " + label(challenge.difficulty) } : { title: "Practice challenge", slug: null, functionName: "challenge()", topic: "Practice" },
      result: { status: passed ? "passed" : "failed", passed: passedCount, total },
      metrics: {
        keystrokeCount: safeNumber(metric.keystroke_count, 1_000_000),
        backspaceCount: safeNumber(metric.backspace_count, 1_000_000),
        pauseCount: safeNumber(metric.pause_count, 100_000),
        thrashingIndex: Math.min(safeNumber(metric.thrashing_index, 100), 100),
        classification: typeof analysis.classification === "string" ? analysis.classification.slice(0, 40) : "pending",
      },
    };
  });

  const completed = history.filter((session) => session.result.status === "passed").length;
  const averageThrashing = history.length
    ? Math.round(history.reduce((total, session) => total + session.metrics.thrashingIndex, 0) / history.length)
    : 0;

  return NextResponse.json({
    profile: {
      name: typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name.trim().slice(0, 100) : (user.email || "").split("@")[0] || "there",
      email: user.email || "",
      tier: "free",
      avatarUrl: null,
    },
    summary: { total: history.length, completed, averageThrashing },
    sessions: history,
  });
}
