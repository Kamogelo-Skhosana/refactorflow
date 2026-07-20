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

export async function DELETE(request) {
  const { url, secret, publishable } = getSupabaseConfig();
  if (!url || !secret || !publishable) {
    return NextResponse.json({ error: "Account deletion is not configured yet." }, { status: 503 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Confirm account deletion to continue." }, { status: 400 });
  }
  if (body?.confirmation !== "DELETE") {
    return NextResponse.json({ error: "Type DELETE exactly to confirm account deletion." }, { status: 400 });
  }

  const user = await getAuthenticatedUser(request, url, publishable);
  if (!user?.id) {
    return NextResponse.json({ error: "Please sign in again to delete your account." }, { status: 401 });
  }

  const headers = { apikey: secret, Authorization: "Bearer " + secret };
  const userId = encodeURIComponent(user.id);
  const sessionResponse = await fetch(
    url + "/rest/v1/sessions?user_id=eq." + userId + "&select=id",
    { headers, cache: "no-store" },
  );
  const sessions = sessionResponse.ok ? await sessionResponse.json() : [];
  const sessionIds = sessions.map((session) => encodeURIComponent(session.id)).filter(Boolean);

  const deletion = await fetch(url + "/auth/v1/admin/users/" + userId, {
    method: "DELETE",
    headers,
  });
  if (!deletion.ok) {
    return NextResponse.json({ error: "Your account could not be deleted. Please try again." }, { status: 502 });
  }

  const cleanup = [
    fetch(url + "/rest/v1/hints_used?user_id=eq." + userId, { method: "DELETE", headers }),
    fetch(url + "/rest/v1/profiles?id=eq." + userId, { method: "DELETE", headers }),
    fetch(url + "/storage/v1/object/avatars/" + userId + "/avatar", { method: "DELETE", headers }),
  ];
  if (sessionIds.length) {
    cleanup.push(
      fetch(url + "/rest/v1/metrics?session_id=in.(" + sessionIds.join(",") + ")", { method: "DELETE", headers }),
      fetch(url + "/rest/v1/sessions?user_id=eq." + userId, { method: "DELETE", headers }),
    );
  }
  await Promise.allSettled(cleanup);

  return new NextResponse(null, { status: 204 });
}
