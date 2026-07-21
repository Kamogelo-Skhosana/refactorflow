# RefactorFlow

RefactorFlow is a Next.js workspace that helps people understand how they code, not only whether their code works.

## Built with Codex & GPT-5.6

RefactorFlow was built with Codex using GPT-5.6 as an active development partner. It accelerated the project from product idea to a working full-stack prototype by helping to:

- Translate the behavioural-coding concept into a complete Next.js application, including landing, authentication, dashboard, challenge, report, settings, and session-history experiences.
- Iterate on the focused coding environment: challenge discovery, a Monaco-based Python editor, timers, results, dark mode, and readable coding-trail reports.
- Design and debug the Supabase-backed data flow for authentication, profiles, Python challenges, private test suites, sessions, and behavioural events.
- Engineer the secure execution architecture: submissions are signed by the application, executed on a separate Linux runner in disposable Docker containers, then deleted after test results are returned.
- Diagnose build, deployment, and user-experience issues while keeping the production application running on Vercel.

Codex was used to accelerate implementation and iteration; RefactorFlow's product decisions, behavioural-learning focus, and final design direction were shaped intentionally throughout the build.

## Run locally

```bash
npm install
npm run dev
```

Create `.env.local` from `.env.example`, then add the Supabase URL, publishable key, server-only secret key, and the dedicated runner URL/shared secret. The secret values must never use a `NEXT_PUBLIC_` prefix. Sign out and back in once after this update so the browser stores the token required to run a challenge.

## Isolated Python runner

Every submission is checked in a new disposable Docker container on a separate runner VM. The runner has no network, a read-only filesystem, a non-root user, dropped Linux capabilities, process/CPU/memory caps, and a short timeout. Private tests stay in Supabase and travel only from the Next.js server to the HMAC-authenticated runner; they never reach the browser.

Follow [runner/DEPLOYMENT.md](runner/DEPLOYMENT.md) to operate the runner safely. The Docker image can be built with `npm run runner:build`; the runner service itself must run on a dedicated Linux VM, never inside a Vercel function.
