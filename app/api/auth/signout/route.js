import { NextResponse } from "next/server";

export async function POST(request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const authorization = request.headers.get("authorization") || "";

  if (url && key && authorization.startsWith("Bearer ")) {
    await fetch(url + "/auth/v1/logout", {
      method: "POST",
      headers: { apikey: key, Authorization: authorization },
    }).catch(() => undefined);
  }

  return new NextResponse(null, { status: 204 });
}
