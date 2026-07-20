import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getSupabaseConfig() {
  return {
    url: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
    secret: process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY,
    publishable: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  };
}

function safeInteger(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.round(number)) : 0;
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

export async function GET(request, { params }) {
  const { id } = await params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    return NextResponse.json({ error: "Report not found." }, { status: 404 });
  }

  const { url, secret, publishable } = getSupabaseConfig();
  if (!url || !secret || !publishable) {
    return NextResponse.json({ error: "Reports are not configured yet." }, { status: 503 });
  }

  const user = await getAuthenticatedUser(request, url, publishable);
  if (!user?.id) {
    return NextResponse.json({ error: "Please sign in again to view this report." }, { status: 401 });
  }

  const headers = { apikey: secret, Authorization: "Bearer " + secret };
  const sessionResponse = await fetch(
    url + "/rest/v1/sessions?id=eq." + encodeURIComponent(id) + "&user_id=eq." + encodeURIComponent(user.id) + "&select=id,exercise_id,duration_ms,run_result,created_at&limit=1",
    { headers, cache: "no-store" },
  );
  if (!sessionResponse.ok) {
    return NextResponse.json({ error: "The report could not be loaded." }, { status: 502 });
  }

  const [session] = await sessionResponse.json();
  if (!session) return NextResponse.json({ error: "Report not found." }, { status: 404 });

  const [challengeResponse, metricResponse] = await Promise.all([
    fetch(url + "/rest/v1/challenges?id=eq." + encodeURIComponent(session.exercise_id) + "&select=slug,title&limit=1", { headers, cache: "no-store" }),
    fetch(url + "/rest/v1/metrics?session_id=eq." + encodeURIComponent(id) + "&select=keystroke_count,backspace_count,pause_count,longest_pause_ms,thrashing_index,analysis&limit=1", { headers, cache: "no-store" }),
  ]);
  const [challenge] = challengeResponse.ok ? await challengeResponse.json() : [];
  const [metrics] = metricResponse.ok ? await metricResponse.json() : [];
  const run = session.run_result && typeof session.run_result === "object" ? session.run_result : {};
  const analysis = metrics?.analysis && typeof metrics.analysis === "object" ? metrics.analysis : {};
  const status = run.status === "passed" ? "passed" : "failed";

  return NextResponse.json({
    id: session.id,
    createdAt: session.created_at,
    challenge: challenge ? { slug: challenge.slug, title: challenge.title } : null,
    result: {
      status,
      passed: safeInteger(run.passed),
      total: Math.max(safeInteger(run.total), 1),
    },
    durationMs: safeInteger(session.duration_ms),
    metrics: {
      keystrokeCount: safeInteger(metrics?.keystroke_count),
      backspaceCount: safeInteger(metrics?.backspace_count),
      pauseCount: safeInteger(metrics?.pause_count),
      longestPauseMs: safeInteger(metrics?.longest_pause_ms),
      thrashingIndex: Math.min(safeInteger(metrics?.thrashing_index), 100),
      classification: typeof analysis.classification === "string" ? analysis.classification.slice(0, 40) : "pending",
    },
  });
}
