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

async function getAuthenticatedUser(request, url, publishable) {
  const authorization = request.headers.get("authorization") || "";
  if (!authorization.startsWith("Bearer ")) return null;

  const response = await fetch(url + "/auth/v1/user", {
    headers: { apikey: publishable, Authorization: authorization },
    cache: "no-store",
  });

  return response.ok ? response.json() : null;
}

async function getChallengeId(url, headers, slug) {
  const response = await fetch(
    url + "/rest/v1/challenges?slug=eq." + encodeURIComponent(slug) + "&select=id&limit=1",
    { headers, cache: "no-store" },
  );
  if (!response.ok) return null;
  const rows = await response.json();
  return rows[0]?.id || null;
}

async function authenticate(request) {
  const { url, secret, publishable } = getSupabaseConfig();
  if (!url || !secret || !publishable) return { error: "Hints are not configured yet.", status: 503 };

  const user = await getAuthenticatedUser(request, url, publishable);
  if (!user?.id) return { error: "Please sign in again to use hints.", status: 401 };

  return {
    url,
    headers: { apikey: secret, Authorization: "Bearer " + secret },
    user,
  };
}

export async function GET(request, { params }) {
  const context = await authenticate(request);
  if (context.error) return NextResponse.json({ error: context.error }, { status: context.status });

  const { slug } = await params;
  const challengeId = await getChallengeId(context.url, context.headers, slug);
  if (!challengeId) return NextResponse.json({ error: "Challenge not found." }, { status: 404 });

  const userId = encodeURIComponent(context.user.id);
  const [profileResponse, usedResponse] = await Promise.all([
    fetch(context.url + "/rest/v1/profiles?id=eq." + userId + "&select=nudges_enabled&limit=1", { headers: context.headers, cache: "no-store" }),
    fetch(
      context.url + "/rest/v1/hints_used?user_id=eq." + userId + "&challenge_id=eq." + encodeURIComponent(challengeId) + "&select=hint_level",
      { headers: context.headers, cache: "no-store" },
    ),
  ]);

  const profile = profileResponse.ok ? (await profileResponse.json())[0] : null;
  const used = usedResponse.ok ? await usedResponse.json() : [];

  return NextResponse.json({
    nudgesEnabled: profile?.nudges_enabled !== false,
    previouslyUsedLevels: used.map((entry) => entry.hint_level).filter((level) => Number.isInteger(level)),
  });
}

export async function POST(request, { params }) {
  const context = await authenticate(request);
  if (context.error) return NextResponse.json({ error: context.error }, { status: context.status });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid hint request." }, { status: 400 });
  }

  const level = Number(body?.level);
  if (!Number.isInteger(level) || level < 1 || level > 3) {
    return NextResponse.json({ error: "Invalid hint level." }, { status: 400 });
  }

  const { slug } = await params;
  const challengeId = await getChallengeId(context.url, context.headers, slug);
  if (!challengeId) return NextResponse.json({ error: "Challenge not found." }, { status: 404 });

  const hintResponse = await fetch(
    context.url + "/rest/v1/challenge_hints?challenge_id=eq." + encodeURIComponent(challengeId) + "&level=eq." + level + "&select=content&limit=1",
    { headers: context.headers, cache: "no-store" },
  );
  if (!hintResponse.ok) return NextResponse.json({ error: "This hint is not available yet." }, { status: 502 });
  const hints = await hintResponse.json();
  const content = hints[0]?.content;
  if (typeof content !== "string") return NextResponse.json({ error: "This hint is not available yet." }, { status: 404 });

  await fetch(context.url + "/rest/v1/hints_used", {
    method: "POST",
    headers: { ...context.headers, "Content-Type": "application/json", Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({ user_id: context.user.id, challenge_id: challengeId, hint_level: level }),
  });

  return NextResponse.json({ level, content: content.slice(0, 1000) });
}
