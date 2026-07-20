import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const MAX_SUBMISSION_LENGTH = 100_000;
const MAX_TAPE_LENGTH = 250_000;
const MAX_EVENTS = 20_000;

function getSupabaseConfig() {
  return {
    url: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
    secret: process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY,
    publishable: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  };
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

function numberWithin(value, minimum, maximum) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? Math.min(maximum, Math.max(minimum, Math.round(numeric))) : minimum;
}

export async function POST(request) {
  const rawBody = await request.text();
  if (rawBody.length > MAX_SUBMISSION_LENGTH + MAX_TAPE_LENGTH + 200_000) {
    return NextResponse.json({ error: "The session payload is too large." }, { status: 413 });
  }

  let body;
  try {
    body = JSON.parse(rawBody || "{}");
  } catch {
    return NextResponse.json({ error: "Invalid session payload." }, { status: 400 });
  }

  if (typeof body.exerciseId !== "string" || typeof body.submittedCode !== "string") {
    return NextResponse.json({ error: "exerciseId and submittedCode are required." }, { status: 400 });
  }
  if (body.submittedCode.length > MAX_SUBMISSION_LENGTH || typeof body.tape === "string" && body.tape.length > MAX_TAPE_LENGTH) {
    return NextResponse.json({ error: "The session payload is too large." }, { status: 413 });
  }

  const { url, secret, publishable } = getSupabaseConfig();
  if (!url || !secret || !publishable) {
    return NextResponse.json({ error: "Session storage is not configured yet." }, { status: 503 });
  }

  const user = await getAuthenticatedUser(request, url, publishable);
  if (!user?.id) {
    return NextResponse.json({ error: "Please sign in again before saving a session." }, { status: 401 });
  }

  const sessionId = crypto.randomUUID();
  const metrics = body.metrics && typeof body.metrics === "object" ? body.metrics : {};
  const rawEvents = Array.isArray(body.rawEvents) ? body.rawEvents.slice(0, MAX_EVENTS) : [];
  const pauseEvents = Array.isArray(body.pauseEvents) ? body.pauseEvents.slice(0, MAX_EVENTS) : [];
  const headers = {
    apikey: secret,
    Authorization: "Bearer " + secret,
    "Content-Type": "application/json",
    Prefer: "return=minimal",
  };

  const sessionResponse = await fetch(url + "/rest/v1/sessions", {
    method: "POST",
    headers,
    body: JSON.stringify({
      id: sessionId,
      user_id: user.id,
      exercise_id: body.exerciseId,
      submitted_code: body.submittedCode,
      duration_ms: numberWithin(body.durationMs, 0, 86_400_000),
      keystroke_tape: typeof body.tape === "string" ? body.tape : "",
      pause_events: pauseEvents,
      run_result: body.runResult && typeof body.runResult === "object" ? body.runResult : {},
    }),
  });
  if (!sessionResponse.ok) {
    return NextResponse.json({ error: "Session could not be saved." }, { status: 502 });
  }

  const metricResponse = await fetch(url + "/rest/v1/metrics", {
    method: "POST",
    headers,
    body: JSON.stringify({
      session_id: sessionId,
      keystroke_count: numberWithin(metrics.keystrokeCount, 0, 1_000_000),
      backspace_count: numberWithin(metrics.backspaceCount, 0, 1_000_000),
      pause_count: numberWithin(metrics.pauseCount, 0, 100_000),
      longest_pause_ms: numberWithin(metrics.longestPauseMs, 0, 86_400_000),
      thrashing_index: numberWithin(metrics.thrashingIndex, 0, 100),
      raw_events: rawEvents,
      analysis: {
        classification: typeof metrics.classification === "string" ? metrics.classification.slice(0, 40) : null,
        tapeAnalysis: metrics.tapeAnalysis && typeof metrics.tapeAnalysis === "object" ? metrics.tapeAnalysis : {},
      },
    }),
  });

  if (!metricResponse.ok) {
    await fetch(url + "/rest/v1/sessions?id=eq." + encodeURIComponent(sessionId), {
      method: "DELETE",
      headers,
    });
    return NextResponse.json({ error: "Session metrics could not be saved." }, { status: 502 });
  }

  return NextResponse.json({ sessionId, persistence: "supabase" }, { status: 201 });
}
