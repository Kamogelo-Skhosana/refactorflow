import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/gif"]);

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

async function authenticate(request) {
  const { url, secret, publishable } = getSupabaseConfig();
  if (!url || !secret || !publishable) {
    return { error: "Profile photos are not configured yet.", status: 503 };
  }
  const user = await getAuthenticatedUser(request, url, publishable);
  if (!user?.id) {
    return { error: "Please sign in again to manage your profile photo.", status: 401 };
  }

  return {
    url,
    user,
    headers: { apikey: secret, Authorization: "Bearer " + secret },
  };
}

function avatarPath(userId) {
  return encodeURIComponent(userId) + "/avatar";
}

function publicAvatarUrl(url, userId) {
  return url + "/storage/v1/object/public/avatars/" + avatarPath(userId) + "?v=" + Date.now();
}

async function updateProfileAvatar(context, avatarUrl) {
  const response = await fetch(
    context.url + "/rest/v1/profiles?id=eq." + encodeURIComponent(context.user.id),
    {
      method: "PATCH",
      headers: { ...context.headers, "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify({ avatar_url: avatarUrl, updated_at: new Date().toISOString() }),
    },
  );
  return response.ok;
}

export async function POST(request) {
  const context = await authenticate(request);
  if (context.error) return NextResponse.json({ error: context.error }, { status: context.status });

  let formData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Select an image to upload." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!file || typeof file.arrayBuffer !== "function" || typeof file.type !== "string") {
    return NextResponse.json({ error: "Select a valid image to upload." }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Use a JPG, PNG, or GIF image." }, { status: 415 });
  }
  if (Number(file.size) > MAX_AVATAR_BYTES) {
    return NextResponse.json({ error: "Profile photos must be 2MB or smaller." }, { status: 413 });
  }

  const bytes = await file.arrayBuffer();
  const storageResponse = await fetch(
    context.url + "/storage/v1/object/avatars/" + avatarPath(context.user.id),
    {
      method: "POST",
      headers: {
        ...context.headers,
        "Content-Type": file.type,
        "x-upsert": "true",
        "cache-control": "3600",
      },
      body: Buffer.from(bytes),
    },
  );
  if (!storageResponse.ok) {
    return NextResponse.json({ error: "Your profile photo could not be uploaded." }, { status: 502 });
  }

  const avatarUrl = publicAvatarUrl(context.url, context.user.id);
  if (!await updateProfileAvatar(context, avatarUrl)) {
    await fetch(context.url + "/storage/v1/object/avatars/" + avatarPath(context.user.id), {
      method: "DELETE",
      headers: context.headers,
    }).catch(() => undefined);
    return NextResponse.json({ error: "Your profile photo could not be saved." }, { status: 502 });
  }

  return NextResponse.json({ avatarUrl });
}

export async function DELETE(request) {
  const context = await authenticate(request);
  if (context.error) return NextResponse.json({ error: context.error }, { status: context.status });

  await fetch(context.url + "/storage/v1/object/avatars/" + avatarPath(context.user.id), {
    method: "DELETE",
    headers: context.headers,
  }).catch(() => undefined);

  if (!await updateProfileAvatar(context, null)) {
    return NextResponse.json({ error: "Your profile photo could not be removed." }, { status: 502 });
  }

  return NextResponse.json({ avatarUrl: null });
}
