import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function getSupabaseConfig() {
  return {
    url: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
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

function dateKey(date) {
  return new Date(date).toISOString().slice(0, 10);
}

function dayBefore(date) {
  const value = new Date(date);
  value.setUTCDate(value.getUTCDate() - 1);
  return value.toISOString().slice(0, 10);
}

function streaks(sessions) {
  const dates = [...new Set(sessions.map((session) => dateKey(session.createdAt)))].sort().reverse();
  if (!dates.length) return { current: 0, best: 0 };

  const dateSet = new Set(dates);
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = dayBefore(today);
  let current = 0;
  let cursor = dateSet.has(today) ? today : dateSet.has(yesterday) ? yesterday : null;

  while (cursor && dateSet.has(cursor)) {
    current += 1;
    cursor = dayBefore(cursor);
  }

  let best = 0;
  let run = 0;
  let previous = null;
  [...dates].reverse().forEach((date) => {
    run = previous === dayBefore(date) ? run + 1 : 1;
    best = Math.max(best, run);
    previous = date;
  });

  return { current, best };
}

function asNumber(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

export async function GET(request) {
  const { url, publishable } = getSupabaseConfig();
  if (!url || !publishable) {
    return NextResponse.json({ error: "Dashboard data is not configured yet." }, { status: 503 });
  }

  const user = await getAuthenticatedUser(request, url, publishable);
  if (!user?.id) {
    return NextResponse.json({ error: "Please sign in again to view your dashboard." }, { status: 401 });
  }

  const authorization = request.headers.get("authorization") || "";
  const headers = { apikey: publishable, Authorization: authorization };
  const userId = encodeURIComponent(user.id);
  const [profileResponse, sessionsResponse, challengesResponse] = await Promise.all([
    fetch(url + "/rest/v1/profiles?id=eq." + userId + "&select=id,email,display_name,tier,avatar_url&limit=1", { headers, cache: "no-store" }),
    fetch(url + "/rest/v1/sessions?user_id=eq." + userId + "&select=id,exercise_id,duration_ms,run_result,created_at&order=created_at.desc&limit=100", { headers, cache: "no-store" }),
    fetch(url + "/rest/v1/challenges?select=id,slug,title,language,difficulty,description&order=created_at.asc", { headers, cache: "no-store" }),
  ]);

  if (!sessionsResponse.ok || !challengesResponse.ok) {
    return NextResponse.json({ error: "Your dashboard data could not be loaded." }, { status: 502 });
  }

  let profile = profileResponse.ok ? (await profileResponse.json())[0] : null;
  if (!profile) {
    const fallbackProfile = {
      id: user.id,
      email: user.email || "",
      display_name: typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name.slice(0, 100) : null,
      tier: "free",
    };
    const createResponse = await fetch(url + "/rest/v1/profiles", {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json", Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify(fallbackProfile),
    });
    if (createResponse.ok) {
      const rows = await createResponse.json();
      profile = rows[0] || fallbackProfile;
    } else {
      profile = fallbackProfile;
    }
  }

  const rawSessions = await sessionsResponse.json();
  const challenges = await challengesResponse.json();
  const sessionIds = rawSessions.map((session) => session.id);
  let metrics = [];

  if (sessionIds.length) {
    const metricResponse = await fetch(
      url + "/rest/v1/metrics?session_id=in.(" + sessionIds.map(encodeURIComponent).join(",") + ")&select=session_id,thrashing_index",
      { headers, cache: "no-store" },
    );
    if (metricResponse.ok) metrics = await metricResponse.json();
  }

  const metricsBySession = new Map(metrics.map((metric) => [metric.session_id, metric]));
  const challengesById = new Map(challenges.map((challenge) => [challenge.id, challenge]));
  const sessions = rawSessions.map((session) => {
    const metric = metricsBySession.get(session.id);
    const runResult = session.run_result && typeof session.run_result === "object" ? session.run_result : {};
    const score = asNumber(metric?.thrashing_index);
    const challenge = challengesById.get(session.exercise_id);

    return {
      id: session.id,
      title: challenge?.title || "Practice session",
      slug: challenge?.slug || null,
      topic: challenge?.difficulty || challenge?.language || "Practice",
      createdAt: session.created_at,
      durationMs: Number(session.duration_ms) || 0,
      passed: runResult.status === "passed",
      thrashingIndex: score,
    };
  });

  const scoredSessions = sessions.filter((session) => session.thrashingIndex !== null).slice(0, 30);
  const averageThrashing = scoredSessions.length
    ? Math.round(scoredSessions.reduce((sum, session) => sum + session.thrashingIndex, 0) / scoredSessions.length)
    : null;
  const passedExerciseIds = new Set(sessions.filter((session) => session.passed).map((session) => rawSessions.find((raw) => raw.id === session.id)?.exercise_id));
  const recommended = challenges.find((challenge) => !passedExerciseIds.has(challenge.id)) || null;
  const { current: currentStreak, best: bestStreak } = streaks(sessions);
  const passedCount = sessions.filter((session) => session.passed).length;
  const xp = sessions.length * 100 + passedCount * 50;
  const level = Math.floor(xp / 300) + 1;
  const nextLevelXp = level * 300;
  const currentLevelFloor = (level - 1) * 300;
  const badges = [];
  if (sessions.length) badges.push({ key: "first_session", label: "Completed your first session" });
  if (passedCount) badges.push({ key: "first_pass", label: "Passed your first challenge" });
  if (sessions.some((session) => session.thrashingIndex !== null && session.thrashingIndex <= 25)) badges.push({ key: "clean_coder", label: "Earned a clean coding score" });
  if (currentStreak >= 7) badges.push({ key: "streak_7", label: "Practiced for seven days in a row" });

  return NextResponse.json({
    profile: {
      name: profile.display_name || (user.email || "").split("@")[0] || "there",
      email: profile.email || user.email || "",
      tier: profile.tier === "pro" || profile.tier === "team" ? profile.tier : "free",
      avatarUrl: profile.avatar_url || null,
    },
    totals: {
      sessions: sessions.length,
      passed: passedCount,
      averageThrashing,
      currentStreak,
      bestStreak,
      xp,
      level,
      nextLevelXp,
      currentLevelFloor,
      badges: badges.slice(0, 3),
    },
    sessions: sessions.slice(0, 10),
    trend: [...scoredSessions].reverse().map((session) => ({
      date: session.createdAt,
      exercise: session.title,
      score: session.thrashingIndex,
    })),
    recommended,
  });
}
