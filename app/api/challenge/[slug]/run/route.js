import { createHmac, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_SOURCE_BYTES = 100_000;
const MAX_REQUEST_BYTES = MAX_SOURCE_BYTES + 1_000;
const MAX_RUNNER_REQUEST_MS = 8_000;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_RUNS = 6;
const runAttempts = new Map();

function getSupabaseConfig() {
  return {
    url: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
    secret: process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY,
    publishable: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  };
}

function getRunnerConfig() {
  const runnerUrl = process.env.RUNNER_URL?.replace(/\/$/, "");
  const secret = process.env.RUNNER_SHARED_SECRET;
  if (!runnerUrl || !secret) return null;

  try {
    const parsed = new URL(runnerUrl);
    const isLocal = parsed.hostname === "127.0.0.1" || parsed.hostname === "localhost";
    if (parsed.protocol !== "https:" && !isLocal) return null;
    return { url: runnerUrl, secret };
  } catch {
    return null;
  }
}

function safeRunnerMessage(status) {
  if (status === "timeout") return "Your code exceeded the execution time limit.";
  if (status === "runner_unavailable") return "The isolated code runner is temporarily unavailable. Please try again shortly.";
  return "The isolated code runner could not check this submission.";
}

function safeTestDetails(value) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 100).map((entry, index) => {
    const status = ["passed", "failed", "error", "skipped"].includes(entry?.status) ? entry.status : "error";
    const fallback = status === "failed"
      ? "Assertion did not pass. Review the expected behavior and try again."
      : status === "error"
        ? "The solution raised an error while this test ran."
        : status === "skipped"
          ? "Skipped for this run."
          : "";
    return { name: `Test ${index + 1}`, status, ...(status === "passed" ? {} : { error: fallback }) };
  });
}

async function getAuthenticatedUser(request, url, publishable) {
  const authorization = request.headers.get("authorization") || "";
  if (!authorization.startsWith("Bearer ")) return null;
  const response = await fetch(`${url}/auth/v1/user`, {
    headers: { apikey: publishable, Authorization: authorization },
    cache: "no-store",
  });
  return response.ok ? response.json() : null;
}

function canRun(userId) {
  const now = Date.now();
  const timestamps = (runAttempts.get(userId) || []).filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS);
  if (timestamps.length >= RATE_LIMIT_MAX_RUNS) return false;
  timestamps.push(now);
  runAttempts.set(userId, timestamps);
  return true;
}

function runnerSignature(timestamp, nonce, payload, secret) {
  return createHmac("sha256", secret).update(`${timestamp}.${nonce}.`).update(payload).digest("hex");
}

function asCount(value) {
  return Number.isInteger(value) && value >= 0 ? value : 0;
}

async function executeOnRunner(payload, runner) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = randomUUID();
  const body = JSON.stringify(payload);
  const signature = runnerSignature(timestamp, nonce, body, runner.secret);

  try {
    const response = await fetch(`${runner.url}/v1/execute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Runner-Timestamp": timestamp,
        "X-Runner-Nonce": nonce,
        "X-Runner-Signature": signature,
      },
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(MAX_RUNNER_REQUEST_MS),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) return { status: result.status === "timeout" ? "timeout" : "runner_unavailable" };
    return {
      status: result.status,
      passed: asCount(result.passed),
      failed: asCount(result.failed),
      total: asCount(result.total),
      tests: safeTestDetails(result.tests),
    };
  } catch {
    return { status: "runner_unavailable" };
  }
}

export async function POST(request, { params }) {
  const { slug } = await params;
  const rawBody = await request.text();
  if (Buffer.byteLength(rawBody, "utf8") > MAX_REQUEST_BYTES) {
    return NextResponse.json({ error: "The submission is too large." }, { status: 413 });
  }

  let body;
  try {
    body = JSON.parse(rawBody || "{}");
  } catch {
    return NextResponse.json({ error: "Invalid submission payload." }, { status: 400 });
  }

  if (typeof body.code !== "string" || Buffer.byteLength(body.code, "utf8") > MAX_SOURCE_BYTES) {
    return NextResponse.json({ error: "A valid Python submission is required." }, { status: 400 });
  }

  const { url, secret, publishable } = getSupabaseConfig();
  const runner = getRunnerConfig();
  if (!url || !secret || !publishable || !runner) {
    return NextResponse.json({ error: "The secure code runner is not configured yet." }, { status: 503 });
  }

  const user = await getAuthenticatedUser(request, url, publishable);
  if (!user?.id) {
    return NextResponse.json({ error: "Please sign in again before running a challenge." }, { status: 401 });
  }
  if (!canRun(user.id)) {
    return NextResponse.json({ error: "Please wait a moment before running another submission." }, { status: 429 });
  }

  const headers = { apikey: secret, Authorization: `Bearer ${secret}` };
  const challengeResponse = await fetch(
    `${url}/rest/v1/challenges?slug=eq.${encodeURIComponent(slug)}&select=id&limit=1`,
    { headers, cache: "no-store" },
  );
  if (!challengeResponse.ok) {
    return NextResponse.json({ error: "The challenge could not be loaded." }, { status: 502 });
  }
  const [challenge] = await challengeResponse.json();
  if (!challenge) return NextResponse.json({ error: "Challenge not found." }, { status: 404 });

  const testsResponse = await fetch(
    `${url}/rest/v1/challenge_tests?challenge_id=eq.${challenge.id}&select=test_name,test_code&order=test_name.asc`,
    { headers, cache: "no-store" },
  );
  if (!testsResponse.ok) {
    return NextResponse.json({ error: "The private tests could not be loaded." }, { status: 502 });
  }
  const tests = await testsResponse.json();
  if (!tests.length) {
    return NextResponse.json({ error: "No tests are configured for this challenge." }, { status: 422 });
  }

  const result = await executeOnRunner(
    { code: body.code, tests: tests.map((test) => ({ name: test.test_name, code: test.test_code })) },
    runner,
  );
  const response = {
    status: result.status,
    passed: asCount(result.passed),
    failed: asCount(result.failed),
    total: asCount(result.total),
    tests: safeTestDetails(result.tests),
  };
  if (result.status === "passed" || result.status === "failed") return NextResponse.json(response);
  return NextResponse.json(
    { ...response, error: safeRunnerMessage(result.status) },
    { status: result.status === "timeout" ? 408 : 503 },
  );
}

