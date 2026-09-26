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

async function getAuthenticatedUser(request, url, publishable) {
  const authorization = request.headers.get("authorization") || "";
  if (!authorization.startsWith("Bearer ")) return null;

  const response = await fetch(url + "/auth/v1/user", {
    headers: { apikey: publishable, Authorization: authorization },
    cache: "no-store",
  });

  return response.ok ? response.json() : null;
}

// PostgREST takes the id list in the URL, and the Supabase gateway rejects very
// long request lines. Past a couple of hundred sessions a single in.(...) query
// silently returned nothing, so the ids are fetched in batches instead.
const ID_BATCH_SIZE = 100;

function idBatches(ids) {
  const batches = [];
  for (let index = 0; index < ids.length; index += ID_BATCH_SIZE) {
    batches.push(ids.slice(index, index + ID_BATCH_SIZE));
  }
  return batches;
}

async function fetchBySessionIds(url, headers, path, sessionIds) {
  const responses = await Promise.all(
    idBatches(sessionIds).map((batch) =>
      fetch(url + path + "&session_id=in.(" + batch.map(encodeURIComponent).join(",") + ")", { headers, cache: "no-store" }),
    ),
  );
  const rows = await Promise.all(responses.map((response) => (response.ok ? response.json() : [])));
  return rows.flat();
}

function safeScore(value) {
  const score = Number(value);
  return Number.isFinite(score) ? Math.min(100, Math.max(0, Math.round(score))) : null;
}

function profileFor(user, profile) {
  return {
    name: profile?.display_name || (user.email || "").split("@")[0] || "there",
    email: profile?.email || user.email || "",
    tier: profile?.tier === "pro" || profile?.tier === "team" ? profile.tier : "free",
    avatarUrl: profile?.avatar_url || null,
  };
}

export async function GET(request) {
  const { url, secret, publishable } = getSupabaseConfig();
  if (!url || !secret || !publishable) {
    return NextResponse.json({ error: "Challenge progress is not configured yet." }, { status: 503 });
  }

  const user = await getAuthenticatedUser(request, url, publishable);
  if (!user?.id) {
    return NextResponse.json({ error: "Please sign in again to view your exercise progress." }, { status: 401 });
  }

  const headers = { apikey: secret, Authorization: "Bearer " + secret };
  const userId = encodeURIComponent(user.id);
  const [profileResponse, sessionsResponse] = await Promise.all([
    fetch(url + "/rest/v1/profiles?id=eq." + userId + "&select=email,display_name,tier,avatar_url&limit=1", { headers, cache: "no-store" }),
    fetch(url + "/rest/v1/sessions?user_id=eq." + userId + "&select=id,exercise_id,run_result&order=created_at.desc&limit=500", { headers, cache: "no-store" }),
  ]);

  if (!sessionsResponse.ok) {
    return NextResponse.json({ error: "Your exercise progress could not be loaded." }, { status: 502 });
  }

  const sessions = await sessionsResponse.json();
  const profile = profileResponse.ok ? (await profileResponse.json())[0] : null;
  const completedExerciseIds = new Set();
  const exerciseIdBySessionId = new Map();

  sessions.forEach((session) => {
    if (!session?.id || !session?.exercise_id) return;
    exerciseIdBySessionId.set(session.id, session.exercise_id);
    const result = session.run_result && typeof session.run_result === "object" ? session.run_result : {};
    if (result.status === "passed") completedExerciseIds.add(session.exercise_id);
  });

  const bestThrashingByExercise = {};
  const sessionIds = [...exerciseIdBySessionId.keys()];

  if (sessionIds.length) {
    const metrics = await fetchBySessionIds(url, headers, "/rest/v1/metrics?select=session_id,thrashing_index", sessionIds);
    metrics.forEach((metric) => {
      const exerciseId = exerciseIdBySessionId.get(metric.session_id);
      const score = safeScore(metric.thrashing_index);
      if (!exerciseId || score === null) return;
      if (bestThrashingByExercise[exerciseId] === undefined || score < bestThrashingByExercise[exerciseId]) {
        bestThrashingByExercise[exerciseId] = score;
      }
    });
  }

  return NextResponse.json({
    profile: profileFor(user, profile),
    completedExerciseIds: [...completedExerciseIds],
    bestThrashingByExercise,
  });
}
