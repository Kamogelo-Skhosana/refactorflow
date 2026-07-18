import json
import os
import re
import resource
import subprocess
import sys
import tempfile


MAX_SOURCE_BYTES = 100_000
MAX_TEST_BYTES = 250_000
MAX_OUTPUT_BYTES = 12_000


def respond(payload):
    print(json.dumps(payload, separators=(",", ":")), flush=True)


def limit_resources():
    resource.setrlimit(resource.RLIMIT_CPU, (2, 2))
    resource.setrlimit(resource.RLIMIT_AS, (96 * 1024 * 1024, 96 * 1024 * 1024))
    resource.setrlimit(resource.RLIMIT_FSIZE, (1 * 1024 * 1024, 1 * 1024 * 1024))
    resource.setrlimit(resource.RLIMIT_NOFILE, (64, 64))
    resource.setrlimit(resource.RLIMIT_NPROC, (32, 32))


def test_filename(index, name):
    safe_name = re.sub(r"[^a-zA-Z0-9_]", "_", name or f"case_{index}")
    return f"test_{index}_{safe_name}.py"


def test_counts(output):
    passed = 0
    failed = 0
    passed_match = re.search(r"(\\d+) passed", output)
    failed_match = re.search(r"(\\d+) failed", output)
    if passed_match:
        passed = int(passed_match.group(1))
    if failed_match:
        failed = int(failed_match.group(1))
    return passed, failed


def main():
    try:
        payload = json.load(sys.stdin)
    except (json.JSONDecodeError, ValueError):
        respond({"status": "error", "message": "Invalid runner payload."})
        return

    code = payload.get("code")
    tests = payload.get("tests")
    if not isinstance(code, str) or not isinstance(tests, list):
        respond({"status": "error", "message": "Invalid submission."})
        return

    if len(code.encode("utf-8")) > MAX_SOURCE_BYTES:
        respond({"status": "error", "message": "The submission is too large."})
        return

    combined_test_size = sum(
        len(test.get("code", "").encode("utf-8"))
        for test in tests
        if isinstance(test, dict) and isinstance(test.get("code"), str)
    )
    if not tests or combined_test_size > MAX_TEST_BYTES:
        respond({"status": "error", "message": "The test bundle is invalid."})
        return

    with tempfile.TemporaryDirectory(dir="/tmp") as workdir:
        for filename in ("fundamentals.py", "solution.py", "submission.py"):
            with open(os.path.join(workdir, filename), "w", encoding="utf-8") as source_file:
                source_file.write(code)

        valid_tests = 0
        for index, test in enumerate(tests, start=1):
            if not isinstance(test, dict) or not isinstance(test.get("code"), str):
                continue
            with open(os.path.join(workdir, test_filename(index, test.get("name"))), "w", encoding="utf-8") as test_file:
                test_file.write(test["code"])
            valid_tests += 1

        if not valid_tests:
            respond({"status": "error", "message": "No valid tests were supplied."})
            return

        try:
            completed = subprocess.run(
                [sys.executable, "-B", "-m", "pytest", "-q", "--disable-warnings", "--maxfail=1", "-p", "no:cacheprovider", workdir],
                cwd=workdir,
                capture_output=True,
                text=True,
                timeout=3,
                env={"PATH": os.environ.get("PATH", ""), "PYTHONDONTWRITEBYTECODE": "1", "PYTHONUNBUFFERED": "1"},
                preexec_fn=limit_resources,
            )
        except subprocess.TimeoutExpired:
            respond({"status": "timeout", "passed": 0, "failed": 0, "total": valid_tests})
            return

        output = ((completed.stdout or "") + "\n" + (completed.stderr or ""))[:MAX_OUTPUT_BYTES]
        passed, failed = test_counts(output)
        total = max(valid_tests, passed + failed)
        if completed.returncode == 0:
            respond({"status": "passed", "passed": valid_tests, "failed": 0, "total": valid_tests})
            return

        respond({"status": "failed", "passed": passed, "failed": max(1, failed), "total": total})


if __name__ == "__main__":
    main()

