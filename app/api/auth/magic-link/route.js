import { NextResponse } from "next/server";

export async function POST(request) {
  const { email } = await request.json().catch(() => ({}));
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  if (!normalizedEmail) return NextResponse.json({ error: "Email is required." }, { status: 400 });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return NextResponse.json({ error: "Supabase Auth is not configured yet." }, { status: 503 });

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin).replace(/\/$/, "");
  const response = await fetch(url + "/auth/v1/otp", {
    method: "POST",
    headers: { apikey: key, "Content-Type": "application/json" },
    body: JSON.stringify({
      email: normalizedEmail,
      create_user: false,
      email_redirect_to: appUrl + "/signin",
    }),
  });
  const data = await response.json().catch(() => ({}));

  return NextResponse.json(
    response.ok ? { message: "Check your inbox for the sign-in link." } : { error: data.msg || data.error_description || "We could not send a magic link." },
    { status: response.ok ? 200 : response.status },
  );
}
