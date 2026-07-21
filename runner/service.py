"""Private API for launching one disposable RefactorFlow test container per request.

This process belongs on a dedicated execution VM. It never receives a browser
request, Supabase credentials, or user access tokens. The Next.js backend sends
only an HMAC-authenticated code-and-test payload over TLS.
"""

import asyncio
import hashlib
import hmac
import json
import os
import subprocess
import time
from typing import Any
from uuid import uuid4

from fastapi import FastAPI, HTTPException, Request, status
from pydantic import BaseModel, Field, ValidationError


MAX_REQUEST_BYTES = 360_000
MAX_SOURCE_BYTES = 100_000
MAX_TEST_BYTES = 250_000
MAX_TEST_FILES = 64
MAX_CONCURRENT_JOBS = int(os.environ.get("RUNNER_MAX_CONCURRENT_JOBS", "2"))
REQUEST_TTL_SECONDS = 30
EXECUTION_TIMEOUT_SECONDS = 5
DOCKER_BIN = os.environ.get("DOCKER_BIN", "docker")
RUNNER_IMAGE = os.environ.get("RUNNER_IMAGE", "refactorflow-python-runner:local")
RUNNER_SHARED_SECRET = os.environ.get("RUNNER_SHARED_SECRET", "")

if not RUNNER_SHARED_SECRET:
    raise RuntimeError("RUNNER_SHARED_SECRET must be configured before the runner can start.")

job_slots = asyncio.Semaphore(MAX_CONCURRENT_JOBS)
used_nonces: dict[str, float] = {}


class TestFile(BaseModel):
    name: str = Field(default="", max_length=200)
    code: str = Field(min_length=1, max_length=MAX_TEST_BYTES)


class ExecutionRequest(BaseModel):
    code: str = Field(max_length=MAX_SOURCE_BYTES)
    tests: list[TestFile] = Field(min_length=1, max_length=MAX_TEST_FILES)


app = FastAPI(docs_url=None, redoc_url=None, openapi_url=None)


def reject_request() -> None:
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized runner request.")


def signature_for(timestamp: str, nonce: str, body: bytes) -> str:
    signed = f"{timestamp}.{nonce}.".encode("utf-8") + body
    return hmac.new(RUNNER_SHARED_SECRET.encode("utf-8"), signed, hashlib.sha256).hexdigest()


def verify_request(timestamp: str | None, nonce: str | None, signature: str | None, body: bytes) -> None:
    if not timestamp or not nonce or not signature or len(nonce) > 100:
        reject_request()
    try:
        sent_at = int(timestamp)
    except ValueError:
        reject_request()
    now = time.time()
    if abs(now - sent_at) > REQUEST_TTL_SECONDS:
        reject_request()

    for seen_nonce, expiry in tuple(used_nonces.items()):
        if expiry < now:
            used_nonces.pop(seen_nonce, None)
    if nonce in used_nonces:
        reject_request()

    expected = signature_for(timestamp, nonce, body)
    if not hmac.compare_digest(signature, expected):
        reject_request()
    used_nonces[nonce] = now + REQUEST_TTL_SECONDS


def validate_payload(payload: ExecutionRequest) -> None:
    if len(payload.code.encode("utf-8")) > MAX_SOURCE_BYTES:
        raise HTTPException(status_code=413, detail="Submission is too large.")
    test_bytes = sum(len(test.code.encode("utf-8")) for test in payload.tests)
    if test_bytes > MAX_TEST_BYTES:
        raise HTTPException(status_code=413, detail="Test bundle is too large.")


def remove_container(container_name: str) -> None:
    try:
        subprocess.run(
            [DOCKER_BIN, "rm", "--force", container_name],
            stdin=subprocess.DEVNULL,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            timeout=2,
            check=False,
        )
    except (FileNotFoundError, subprocess.SubprocessError):
        pass


def last_json_line(output: bytes) -> dict[str, Any] | None:
    for line in reversed(output.decode("utf-8", errors="replace").splitlines()):
        try:
            value = json.loads(line)
        except json.JSONDecodeError:
            continue
        if isinstance(value, dict):
            return value
    return None


def count(value: Any) -> int:
    return value if isinstance(value, int) and value >= 0 else 0


def safe_test_details(value: Any) -> list[dict[str, str]]:
    if not isinstance(value, list):
        return []
    details = []
    for index, entry in enumerate(value[:100], start=1):
        entry_status = entry.get("status") if isinstance(entry, dict) else None
        test_status = entry_status if entry_status in {"passed", "failed", "error", "skipped"} else "error"
        details.append({"name": f"Test {index}", "status": test_status})
    return details


def run_job(payload: ExecutionRequest) -> dict[str, Any]:
    container_name = f"refactorflow-job-{uuid4()}"
    command = [
        DOCKER_BIN,
        "run",
        "--rm",
        "--name",
        container_name,
        "--pull",
        "never",
        "--network",
        "none",
        "--read-only",
        "--tmpfs",
        "/tmp:rw,nosuid,nodev,noexec,size=32m",
        "--pids-limit",
        "64",
        "--ulimit",
        "nproc=32:32",
        "--ulimit",
        "nofile=64:64",
        "--ulimit",
        "fsize=1048576:1048576",
        "--memory",
        "128m",
        "--memory-swap",
        "128m",
        "--cpus",
        "0.5",
        "--cap-drop",
        "ALL",
        "--security-opt",
        "no-new-privileges:true",
        "--log-driver",
        "none",
        "--user",
        "10001:10001",
        "--workdir",
        "/sandbox",
        RUNNER_IMAGE,
    ]
    body = json.dumps(payload.model_dump(), separators=(",", ":")).encode("utf-8")

    try:
        completed = subprocess.run(
            command,
            input=body,
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
            timeout=EXECUTION_TIMEOUT_SECONDS,
            check=False,
        )
    except subprocess.TimeoutExpired:
        return {"status": "timeout", "passed": 0, "failed": 0, "total": 0}
    except FileNotFoundError:
        return {"status": "runner_unavailable", "passed": 0, "failed": 0, "total": 0}
    finally:
        # This runs after success, a failed test, a timeout, and a Docker error.
        # --rm covers normal exits; force removal handles a still-running job.
        remove_container(container_name)

    result = last_json_line(completed.stdout)
    if not result:
        return {"status": "runner_unavailable", "passed": 0, "failed": 0, "total": 0}

    job_status = result.get("status")
    if job_status not in {"passed", "failed", "timeout"}:
        return {"status": "runner_unavailable", "passed": 0, "failed": 0, "total": 0}
    return {
        "status": job_status,
        "passed": count(result.get("passed")),
        "failed": count(result.get("failed")),
        "total": count(result.get("total")),
        "tests": safe_test_details(result.get("tests")),
    }


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/v1/execute")
async def execute(request: Request) -> dict[str, Any]:
    if request.headers.get("content-type", "").split(";", 1)[0].strip().lower() != "application/json":
        raise HTTPException(status_code=415, detail="JSON requests only.")

    body = await request.body()
    if len(body) > MAX_REQUEST_BYTES:
        raise HTTPException(status_code=413, detail="Request is too large.")
    verify_request(
        request.headers.get("x-runner-timestamp"),
        request.headers.get("x-runner-nonce"),
        request.headers.get("x-runner-signature"),
        body,
    )
    try:
        payload = ExecutionRequest.model_validate_json(body)
    except ValidationError:
        raise HTTPException(status_code=400, detail="Invalid runner payload.") from None
    validate_payload(payload)

    try:
        await asyncio.wait_for(job_slots.acquire(), timeout=0.05)
    except TimeoutError:
        raise HTTPException(status_code=429, detail="Runner is busy. Try again shortly.") from None
    try:
        return await asyncio.to_thread(run_job, payload)
    finally:
        job_slots.release()

