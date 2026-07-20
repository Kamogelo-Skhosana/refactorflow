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

function profilePayload(profile, user) {
  return {
    name: profile?.display_name || (user.email || "").split("@")[0] || "there",
    email: user.email || profile?.email || "",
    tier: profile?.tier === "pro" || profile?.tier === "team" ? profile.tier : "free",
    avatarUrl: profile?.avatar_url || null,
    emailNotifications: profile?.email_notifications !== false,
    nudgesEnabled: profile?.nudges_enabled !== false,
  };
}

async function findOrCreateProfile(url, headers, user) {
  const id = encodeURIComponent(user.id);
  const currentResponse = await fetch(
    url + "/rest/v1/profiles?id=eq." + id + "&select=id,email,display_name,tier,avatar_url,email_notifications,nudges_enabled&limit=1",
    { headers, cache: "no-store" },
  );
  if (currentResponse.ok) {
    const [profile] = await currentResponse.json();
    if (profile) return profile;
  }

  const fallback = {
    id: user.id,
    email: user.email || "",
    display_name: typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name.trim().slice(0, 100) || null : null,
    tier: "free",
  };
  const createResponse = await fetch(url + "/rest/v1/profiles", {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json", Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify(fallback),
  });
  if (!createResponse.ok) return fallback;
  const rows = await createResponse.json();
  return rows[0] || fallback;
}

async function authenticate(request) {
  const { url, secret, publishable } = getSupabaseConfig();
  if (!url || !secret || !publishable) {
    return { error: "Profile settings are not configured yet.", status: 503 };
  }
  const user = await getAuthenticatedUser(request, url, publishable);
  if (!user?.id) {
    return { error: "Please sign in again to manage settings.", status: 401 };
  }

  return {
    url,
    user,
    headers: { apikey: secret, Authorization: "Bearer " + secret },
  };
}

export async function GET(request) {
  const context = await authenticate(request);
  if (context.error) return NextResponse.json({ error: context.error }, { status: context.status });

  const profile = await findOrCreateProfile(context.url, context.headers, context.user);
  return NextResponse.json({ profile: profilePayload(profile, context.user) });
}

export async function PATCH(request) {
  const context = await authenticate(request);
  if (context.error) return NextResponse.json({ error: context.error }, { status: context.status });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid profile update." }, { status: 400 });
  }

  const update = { updated_at: new Date().toISOString() };
  if (Object.hasOwn(body || {}, "displayName")) {
    if (typeof body.displayName !== "string") {
      return NextResponse.json({ error: "Your name must be text." }, { status: 400 });
    }
    const name = body.displayName.trim();
    if (name.length > 100) {
      return NextResponse.json({ error: "Your name must be 100 characters or fewer." }, { status: 400 });
    }
    update.display_name = name || null;
  }
  if (Object.hasOwn(body || {}, "emailNotifications")) {
    if (typeof body.emailNotifications !== "boolean") {
      return NextResponse.json({ error: "Invalid notification preference." }, { status: 400 });
    }
    update.email_notifications = body.emailNotifications;
  }
  if (Object.hasOwn(body || {}, "nudgesEnabled")) {
    if (typeof body.nudgesEnabled !== "boolean") {
      return NextResponse.json({ error: "Invalid nudge preference." }, { status: 400 });
    }
    update.nudges_enabled = body.nudgesEnabled;
  }

  if (Object.keys(update).length === 1) {
    return NextResponse.json({ error: "Choose a setting to update." }, { status: 400 });
  }

  const response = await fetch(
    context.url + "/rest/v1/profiles?id=eq." + encodeURIComponent(context.user.id),
    {
      method: "PATCH",
      headers: { ...context.headers, "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify(update),
    },
  );
  if (!response.ok) {
    return NextResponse.json({ error: "Your profile could not be saved." }, { status: 502 });
  }

  const [profile] = await response.json();
  return NextResponse.json({ profile: profilePayload(profile, context.user) });
}
