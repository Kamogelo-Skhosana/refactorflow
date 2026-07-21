# RefactorFlow

RefactorFlow is a Next.js workspace that helps people understand how they code, not only whether their code works.

## Run locally

```bash
npm install
npm run dev
```

Create `.env.local` from `.env.example`, then add the Supabase URL, publishable key, server-only secret key, and the dedicated runner URL/shared secret. The secret values must never use a `NEXT_PUBLIC_` prefix. Sign out and back in once after this update so the browser stores the token required to run a challenge.

## Isolated Python runner

Every submission is checked in a new disposable Docker container on a separate runner VM. The runner has no network, a read-only filesystem, a non-root user, dropped Linux capabilities, process/CPU/memory caps, and a short timeout. Private tests stay in Supabase and travel only from the Next.js server to the HMAC-authenticated runner; they never reach the browser.

Follow [runner/DEPLOYMENT.md](runner/DEPLOYMENT.md) to operate the runner safely. The Docker image can be built with `npm run runner:build`; the runner service itself must run on a dedicated Linux VM, never inside a Vercel function.

