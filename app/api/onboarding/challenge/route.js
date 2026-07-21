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
    return NextResponse.json({ error: "Onboarding is not configured yet." }, { status: 503 });
  }

  const user = await getAuthenticatedUser(request, url, publishable);
  if (!user?.id) {
    return NextResponse.json({ error: "Please sign in again to continue onboarding." }, { status: 401 });
  }

  const response = await fetch(
    url + "/rest/v1/challenges?slug=eq.pseudo-range&select=id,slug,title,language,description,starter_code&limit=1",
    { headers: { apikey: secret, Authorization: "Bearer " + secret }, cache: "no-store" },
  );
  if (!response.ok) {
    return NextResponse.json({ error: "The onboarding exercise could not be loaded." }, { status: 502 });
  }

  const [challenge] = await response.json();
  if (!challenge) {
    return NextResponse.json({ error: "The onboarding exercise is not available yet." }, { status: 404 });
  }

  return NextResponse.json({ challenge });
}
