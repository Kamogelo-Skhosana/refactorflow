import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_SOURCE_LENGTH = 100_000;
const RUN_TIMEOUT_MS = 4_500;
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

function safeRunnerMessage(status) {
  if (status === "timeout") return "Your code exceeded the execution time limit.";
  if (status === "runner_unavailable") return "The isolated runner is not ready. Install Docker Desktop, then run npm run runner:build.";
  return "The isolated runner could not check this submission.";
}


function safeTestDetails(value) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 100).map((entry, index) => {
    const status = entry?.status === "passed" || entry?.status === "failed" || entry?.status === "error" || entry?.status === "skipped"
      ? entry.status
      : "error";
    const fallback = status === "failed"
      ? "Assertion did not pass. Review the expected behavior and try again."
      : status === "error"
        ? "The solution raised an error while this test ran."
        : status === "skipped"
          ? "Skipped for this run."
          : "";
    return { name: "Test " + (index + 1), status, ...(status === "passed" ? {} : { error: fallback }) };
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

function forceRemove(containerName) {
  const cleanup = spawn("docker", ["rm", "--force", containerName], { windowsHide: true });
  cleanup.on("error", () => undefined);
}

function runInSandbox(payload) {
  return new Promise((resolve) => {
    const containerName = `refactorflow-run-${randomUUID()}`;
    const args = [
      "run", "--rm", "--name", containerName, "--network", "none", "--read-only", "--tmpfs", "/tmp:rw,nosuid,nodev,noexec,size=32m",
      "--pids-limit", "64", "--ulimit", "nproc=32:32", "--ulimit", "fsize=1048576:1048576", "--memory", "128m", "--memory-swap", "128m", "--cpus", "0.5", "--cap-drop", "ALL",
      "--security-opt", "no-new-privileges:true", "--user", "10001:10001", "--workdir", "/sandbox", "refactorflow-python-runner:local",
    ];
    const process = spawn("docker", args, { stdio: ["pipe", "pipe", "pipe"], windowsHide: true });
    let stdout = "";
    let settled = false;
    let timedOut = false;
    const finish = (result) => { if (!settled) { settled = true; clearTimeout(timeout); resolve(result); } };
    const timeout = setTimeout(() => {
      timedOut = true;
      process.kill();
      forceRemove(containerName);
      setTimeout(() => finish({ status: "timeout" }), 250);
    }, RUN_TIMEOUT_MS);

    process.stdout.on("data", (chunk) => { if (stdout.length < 16_000) stdout += chunk.toString(); });
    process.on("error", () => finish({ status: "runner_unavailable" }));
    process.on("close", (code) => {
      if (timedOut) return;
      const line = stdout.trim().split(/\r?\n/).filter(Boolean).at(-1);
      if (!line) return finish({ status: code === 125 ? "runner_unavailable" : "error" });
      try { finish(JSON.parse(line)); } catch { finish({ status: "error" }); }
    });
    process.stdin.end(JSON.stringify(payload));
  });
}

export async function POST(request, { params }) {
  const { slug } = await params;
  const rawBody = await request.text();
  if (rawBody.length > MAX_SOURCE_LENGTH + 1_000) return NextResponse.json({ error: "The submission is too large." }, { status: 413 });
  let body;
  try { body = JSON.parse(rawBody || "{}"); } catch { return NextResponse.json({ error: "Invalid submission payload." }, { status: 400 }); }
  if (typeof body.code !== "string" || body.code.length > MAX_SOURCE_LENGTH) return NextResponse.json({ error: "A valid Python submission is required." }, { status: 400 });

  const { url, secret, publishable } = getSupabaseConfig();
  if (!url || !secret || !publishable) return NextResponse.json({ error: "The secure code runner is not configured yet." }, { status: 503 });
  const user = await getAuthenticatedUser(request, url, publishable);
  if (!user?.id) return NextResponse.json({ error: "Please sign in again before running a challenge." }, { status: 401 });
  if (!canRun(user.id)) return NextResponse.json({ error: "Please wait a moment before running another submission." }, { status: 429 });

  const headers = { apikey: secret, Authorization: `Bearer ${secret}` };
  const challengeResponse = await fetch(`${url}/rest/v1/challenges?slug=eq.${encodeURIComponent(slug)}&select=id&limit=1`, { headers, cache: "no-store" });
  if (!challengeResponse.ok) return NextResponse.json({ error: "The challenge could not be loaded." }, { status: 502 });
  const [challenge] = await challengeResponse.json();
  if (!challenge) return NextResponse.json({ error: "Challenge not found." }, { status: 404 });

  const testsResponse = await fetch(`${url}/rest/v1/challenge_tests?challenge_id=eq.${challenge.id}&select=test_name,test_code&order=test_name.asc`, { headers, cache: "no-store" });
  if (!testsResponse.ok) return NextResponse.json({ error: "The private tests could not be loaded." }, { status: 502 });
  const tests = await testsResponse.json();
  if (!tests.length) return NextResponse.json({ error: "No tests are configured for this challenge." }, { status: 422 });

  const result = await runInSandbox({ code: body.code, tests: tests.map((test) => ({ name: test.test_name, code: test.test_code })) });
  const response = {
    status: result.status,
    passed: Number.isInteger(result.passed) ? result.passed : 0,
    failed: Number.isInteger(result.failed) ? result.failed : 0,
    total: Number.isInteger(result.total) ? result.total : tests.length,
    tests: safeTestDetails(result.tests),
  };
  if (result.status === "passed" || result.status === "failed") return NextResponse.json(response);
  return NextResponse.json({ ...response, error: safeRunnerMessage(result.status) }, { status: result.status === "timeout" ? 408 : 503 });
}

