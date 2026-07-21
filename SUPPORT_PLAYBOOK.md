# RefactorFlow Support Playbook

## Product principles

- Explain the Thrashing Index as a growth signal, never a grade.
- Raw tape, raw events, and pause data are private user data.
- Never share individual behavioral data with employers without explicit opt-in.
- Enterprise dashboards are aggregate cohort views only.

## CI/CD Pipeline

### What is automated

| Workflow | Trigger | Purpose |
| --- | --- | --- |
| `Pull Request Checks` | Pull requests to `main` or `develop` | Installs dependencies, checks JavaScript/TypeScript compatibility, runs ESLint, and builds the Next.js app. |
| `Production Deploy Validation` | Pushes to `main` | Repeats the compatibility and lint checks for the production commit. Vercel's GitHub integration deploys that commit separately. |
| `Dependency Security Scan` | Pushes to `main`, every Monday at 06:00 UTC, or manual dispatch | Runs `npm audit --audit-level=high` and writes a result to the GitHub Actions summary. |

RefactorFlow currently uses Next.js 16 and JavaScript, Supabase, Paystack, and a Docker-based Python runner scaffold. The runner build/test/deploy commands remain commented in the workflows until Stage 3 adds tests and a deployment target. No Stripe configuration is used.

### One-time dependency bootstrap

The repository does not currently include a `package-lock.json`. Each workflow therefore uses `npm ci` as soon as a lockfile exists and temporarily falls back to `npm install` while the repository is being bootstrapped.

Before enabling required status checks, generate and commit a lockfile from a normal internet-connected checkout:

```bash
npm install
git add package-lock.json package.json
git commit -m "chore: commit npm lockfile"
git push
```

Once `package-lock.json` is committed, the workflows automatically use deterministic `npm ci` installs. Do not remove the lockfile.

### GitHub branch protection for `main`

In GitHub, open **Settings -> Branches -> Add branch protection rule** and enter `main` as the branch pattern.

Enable:

1. **Require a pull request before merging**
   - Require at least **1 approval**.
   - Dismiss stale approvals when new commits are pushed.
2. **Require status checks to pass before merging**
   - Enable **Require branches to be up to date before merging**.
   - Select **Pull Request Checks / Validate Next.js application** after it has run once.
3. **Require conversation resolution before merging**.
4. **Block force pushes** and **block branch deletion**.
5. If your GitHub plan supports it, enable **Do not allow bypassing the above settings**. Keep only a very small set of repository administrators with emergency bypass access.

Do not require `Production Deploy Validation` as a merge check: it runs only after a commit reaches `main`. Vercel's Git integration creates the production deployment from that same `main` commit.

### GitHub Actions environment values

Add the build-time Supabase values in **Settings -> Secrets and variables -> Actions -> New repository secret**:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Use values from Supabase **Project Settings -> API**. These are browser-safe values, not server secrets. They are still stored as Actions secrets so CI does not hardcode environment-specific configuration and so builds can use the same variables that Next.js exposes to browser code.

Vercel environment values are separate from GitHub Actions values. Vercel keeps the runtime values used by its own builds and deployments; GitHub Actions does not receive them automatically. Add the two values above to both places, scoped appropriately:

- Vercel **Production** for `main`
- Vercel **Preview** for pull requests and feature branches
- GitHub Actions repository secrets for CI builds

Never put `SUPABASE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, or Paystack secret keys in a `NEXT_PUBLIC_` variable or in client-side code. The current CI checks do not need those server-only values.

### Debug a failed GitHub Actions workflow

1. Open the repository's **Actions** tab and select the failed run.
2. Open the failed job and the first failed step; later failures can be a consequence of it.
3. For install failures, confirm that `package-lock.json` matches `package.json`, then run `npm install` locally and commit any lockfile change.
4. For lint failures, run `npm run lint` locally and make the smallest focused correction.
5. For compatibility failures, run `npm run typecheck`. RefactorFlow is JavaScript today, so the check validates the current App Router source and remains ready for TypeScript files later.
6. For build failures, run `npm run build` with the required browser-safe Supabase variables available. Do not paste server secrets into workflow logs.
7. Re-run the workflow only after correcting the cause. Use **Re-run failed jobs** for transient GitHub infrastructure errors.

### Re-trigger a failed Vercel deployment

Vercel Git integration deploys a commit independently of the GitHub Actions workflow.

1. Open the Vercel project, select the failed deployment, and review its build logs.
2. Correct the failing commit and merge/push the fix to `main`; Vercel starts a new production deployment automatically.
3. If the exact same commit needs another attempt after fixing a Vercel setting or environment value, use **Redeploy** from that deployment in the Vercel dashboard.
4. Do not add a Vercel CLI deploy command to GitHub Actions while Git integration is enabled. It would produce duplicate deployments.

### Emergency branch-protection bypass

Use a bypass only for a genuine production incident where waiting for the usual review and checks would materially increase user harm or outage time.

Before bypassing:

1. Capture the incident ticket, impact, affected commit, and reason the normal path could not be used.
2. Have a repository administrator merge the smallest possible change. Do not force-push.
3. Immediately create a follow-up pull request to restore review/check coverage and add tests or monitoring that would prevent recurrence.
4. Record who bypassed protection, when, what was changed, and the verification result in the incident record.

Documenting a bypass preserves the audit trail and prevents an emergency exception from becoming an undocumented deployment habit.

### Rotate a compromised key

1. Identify the affected key and revoke or rotate it at its provider first.
   - Supabase keys: Supabase **Project Settings -> API**.
   - Paystack keys: Paystack dashboard.
2. Update the replacement in Vercel for every environment that uses it.
3. Update the matching GitHub Actions secret if the key is used by CI.
4. Redeploy Vercel and re-run the relevant GitHub Actions workflow.
5. Invalidate active sessions or tokens when the provider recommends it, then review logs for unexpected use.
6. Never commit the old or replacement value to source control, issues, pull requests, or workflow output.

## Current milestone

The product uses Supabase Auth and database routes, Monaco-based exercises, behavioral session tracking, and the safe Python runner scaffold. Paystack billing remains the intended payment integration.
