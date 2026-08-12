# Session 8b — The Plug: step ladder

One git tag per step: `git checkout step-NN` puts the repo exactly where the
room should be at that step's checkpoint. This file is the map.

Two Vercel projects, one repo:
- **muse-scout** — `backend/` (API-only Next.js; the socket)
- **muse-console** — `frontend/` (the product; the plug)
- `clients/` never deploys — that's its point: no key, no agent dep.

| Step | Tag | Files touched | Student types | ✅ Checkpoint (all reproduced 2026-08-05) |
|---|---|---|---|---|
| 01 | `step-01` | `backend/lib/agent.ts`, `backend/exercises/01-tui-local.ts` | agent.ts (~15 lines) | `npm run tui`: agent *chooses* to search; sourced answer, no HTTP |
| 02 | `step-02` | `backend/app/api/{chat,health}/route.ts` | the 3-line route | `curl <scout>/api/health` → `{"ok":true,"service":"muse-scout"}` |
| 03 | `step-03` | `clients/curl-wire.sh`, `clients/tui-remote.ts` | curl-wire.sh | raw SSE chunks scrolling; remote TUI from a keyless package. **Beat ①**: first curl = 302 SSO page (Deployment Protection) |
| 04 | `step-04` | chat route `onStepEnd` | the 2-line log | `vercel logs <url> --follow` shows `[scout] step 0 · {tokens} · stop` from a prod request |
| 05 | `step-05` | all of `frontend/`, `backend/lib/cors.ts` | `lib/transport.ts` + the CORS fix | localhost:3001 streams token-by-token from the deployed scout; web_search chip runs its state machine. **Beat ②** three acts: CORS block (curl still works) → naive proxy buffers (38.9s vs 0.55s first byte) → OPTIONS + headers, redeploy |
| 06 | `step-06` | none (Vercel config) | — | deployed console drives their scout from a phone. **Beat ③**: env var set after build → console POSTs to itself, 404 HTML in the error banner; fix = set var AND redeploy |
| 07 | `step-07` | `backend/migration.sql`, `lib/store.ts`, `lib/agent.ts` (grows), conversations routes, chat route (grows) | the load/save calls | hard-refresh keeps the chat; sidebar lists + reopens; `npm run ex 03 <id>` — a script knows what you told the browser; a NEW conversation still knows your name (scout_memories) |
| 08 | `step-08` | `lib/jobs.ts`, `app/api/jobs/[id]/route.ts` | the `after()` split | ticket card flips queued→running→done unaided; `npm run ex 04 <job-id>` redeems the same id |
| 09 | `step-09` | `frontend/app/api/relay/route.ts`, `lib/transport.ts` (relay mode), `StageChip` wired | env flip | the console renders muse-studio's stage rail — router ✓ · fan-out ✓ · draft ✓ · judge ✗ rejected · redraft — parts this repo never defined. "A route is an interface." |
| 10 | `step-10` | none (Vercel env flip + rebuild) | — | prod console drives deployed muse-studio (tool chips + ticket); flip back = same one-minute move |

## The step-09 mechanism, honestly

muse-studio was built as a same-origin app — its socket has **no CORS
headers**, so a browser on another origin can't call it directly (curl can).
The console therefore lends it an origin: `frontend/app/api/relay/route.ts`
pipes the request through and hands the response back **as a stream**
(`new Response(upstream.body)`). Compare `app/api/naive-proxy/route.ts` — one
line different (`await r.text()`), and streaming dies. That contrast is the
lesson: relay if you must, pipe when you do.

Flip between sockets = env vars on muse-console, then rebuild:

| Mode | `NEXT_PUBLIC_SCOUT_URL` | `NEXT_PUBLIC_USE_RELAY` | `RELAY_TARGET` | `NEXT_PUBLIC_AGENT_LABEL` |
|---|---|---|---|---|
| scout (direct, CORS) | scout URL | 0 | — | muse scout |
| muse (relay) | *(empty)* | 1 | muse-studio URL | muse studio |

## Facilitator prep flag

The **deployed** muse-studio (July 28 CLI deploy) predates the stage-writer
route — it streams tools/text but **no `data-stage` parts**. Session-8's repo
HEAD does emit them (verified locally: 12 chunks per brief). Before the
session, redeploy muse-studio from `session-8-product/live` unchanged (`vercel
deploy --prod`) so the deployed bookend shows the stage rail; today's
captures used a local run of that exact code. Session-8 code was not touched.
