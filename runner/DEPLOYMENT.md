# RefactorFlow execution runner

This directory contains two separate pieces:

- `Dockerfile` and `entrypoint.py` create the immutable image used for one learner submission.
- `service.py` is the private runner API on a dedicated Linux VM. It starts exactly one disposable Docker container for a request, collects only the summary, and force-removes the container in `finally`.

Do not run this service on the Vercel deployment, on the Supabase host, or on a VM that holds any other application data. Membership of the local `docker` group is privileged access, so this VM must be dedicated to code execution.

## Provision the dedicated VM

Use a current Ubuntu or Debian VM with Docker Engine. Allow only HTTPS (and your administrative SSH access) through its firewall. Put TLS in front of the service with a reverse proxy such as Caddy or Nginx; the Uvicorn process binds to `127.0.0.1:8081` and must not be directly exposed.

```bash
sudo useradd --system --create-home --shell /usr/sbin/nologin refactorflow-runner
sudo usermod -aG docker refactorflow-runner
sudo mkdir -p /opt/refactorflow /etc/refactorflow
sudo chown -R refactorflow-runner:refactorflow-runner /opt/refactorflow
```

Copy this `runner` directory to `/opt/refactorflow/runner`, then build the job image before starting the API:

```bash
cd /opt/refactorflow
sudo docker build --pull --tag refactorflow-python-runner:local runner
sudo -u refactorflow-runner python3 -m venv runner/.venv
sudo -u refactorflow-runner runner/.venv/bin/pip install --upgrade pip
sudo -u refactorflow-runner runner/.venv/bin/pip install -r runner/requirements.txt
```

Create `/etc/refactorflow/runner.env` with a long random value and lock it down:

```bash
RUNNER_SHARED_SECRET=replace-with-a-long-random-secret
RUNNER_IMAGE=refactorflow-python-runner:local
RUNNER_MAX_CONCURRENT_JOBS=2
```

```bash
sudo chown root:refactorflow-runner /etc/refactorflow/runner.env
sudo chmod 640 /etc/refactorflow/runner.env
sudo cp /opt/refactorflow/runner/refactorflow-runner.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now refactorflow-runner
sudo systemctl status refactorflow-runner
```

Configure the reverse proxy to forward HTTPS traffic to `127.0.0.1:8081`. The only public routes are `/health` and the signed `/v1/execute`; the latter rejects requests without a fresh HMAC signature, nonce, and shared secret. Do not add CORS support or a browser-facing token flow.

## Connect the Next.js app

Set these server-only Vercel environment variables, using the same secret as `/etc/refactorflow/runner.env`:

```text
RUNNER_URL=https://your-runner-domain.example
RUNNER_SHARED_SECRET=the-same-long-random-secret
```

`SUPABASE_SECRET_KEY` stays only in Vercel. The runner does not get Supabase credentials or user JWTs. The Next.js endpoint authenticates the learner, reads private tests, signs the runner request, and returns only pass/fail counts to the browser.

## Verify safely

```bash
curl -fsS http://127.0.0.1:8081/health
sudo docker ps --format '{{.Names}}'
```

After a submission completes, there must be no container whose name starts with `refactorflow-job-`. Test the timeout path as well; it must also leave no such container. Review `journalctl -u refactorflow-runner` for service health, but never log request bodies because they contain learner code and private tests.

