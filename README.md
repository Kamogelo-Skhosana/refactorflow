# RefactorFlow

RefactorFlow is a Next.js workspace that helps people understand how they code, not only whether their code works.

## Run locally

```bash
npm install
npm run runner:build
npm run dev
```

Install and start Docker Desktop before running `npm run runner:build`.

Create `.env.local` from `.env.example`, then add the Supabase URL, publishable key, and server-only secret key. The secret key must never use a `NEXT_PUBLIC_` prefix. Sign out and back in once after this update so the browser stores the token required to run a challenge.

## Isolated Python runner

Every submission is checked in a new disposable Docker container. The runner has no network, a read-only filesystem, a non-root user, dropped Linux capabilities, process/CPU/memory caps, and a short timeout. Private tests stay in Supabase and are sent directly from the server to the container; they never reach the browser.

This runner is for local development. Do not deploy it to a server without an isolated container host, durable rate limiting, and server-side session handling.

