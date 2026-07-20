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

export async function GET(request) {
  const { url, secret, publishable } = getSupabaseConfig();
  if (!url || !secret || !publishable) {
    return NextResponse.json({ error: "Data export is not configured yet." }, { status: 503 });
  }

  const user = await getAuthenticatedUser(request, url, publishable);
  if (!user?.id) {
    return NextResponse.json({ error: "Please sign in again to download your data." }, { status: 401 });
  }

  const headers = { apikey: secret, Authorization: "Bearer " + secret };
  const userId = encodeURIComponent(user.id);
  const [profileResponse, sessionsResponse, hintsResponse] = await Promise.all([
    fetch(url + "/rest/v1/profiles?id=eq." + userId + "&select=email,display_name,tier,created_at&limit=1", { headers, cache: "no-store" }),
    fetch(url + "/rest/v1/sessions?user_id=eq." + userId + "&select=id,exercise_id,submitted_code,duration_ms,keystroke_tape,pause_events,run_result,created_at&order=created_at.asc", { headers, cache: "no-store" }),
    fetch(url + "/rest/v1/hints_used?user_id=eq." + userId + "&select=challenge_id,hint_level,created_at&order=created_at.asc", { headers, cache: "no-store" }),
  ]);

  if (!sessionsResponse.ok || !hintsResponse.ok) {
    return NextResponse.json({ error: "Your data export could not be prepared." }, { status: 502 });
  }

  const sessions = await sessionsResponse.json();
  let metrics = [];
  if (sessions.length) {
    const ids = sessions.map((session) => encodeURIComponent(session.id)).join(",");
    const metricResponse = await fetch(
      url + "/rest/v1/metrics?session_id=in.(" + ids + ")&select=session_id,keystroke_count,backspace_count,pause_count,longest_pause_ms,thrashing_index,raw_events,analysis,created_at&order=created_at.asc",
      { headers, cache: "no-store" },
    );
    if (metricResponse.ok) metrics = await metricResponse.json();
  }

  const [profile] = profileResponse.ok ? await profileResponse.json() : [];
  const exportData = {
    exportedAt: new Date().toISOString(),
    profile: {
      email: user.email || profile?.email || "",
      displayName: profile?.display_name || null,
      tier: profile?.tier || "free",
      createdAt: profile?.created_at || user.created_at || null,
    },
    sessions,
    metrics,
    hintsUsed: await hintsResponse.json(),
  };

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": 'attachment; filename="refactorflow-data.json"',
      "Cache-Control": "private, no-store",
    },
  });
}
