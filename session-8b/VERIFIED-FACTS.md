# Session 8b — verified facts (facilitator-side evidence trail)

All verified 2026-08-05 in the live build run. Re-verify anything marked ⏲
during pre-session prep.

## AI SDK (ai@7.0.52, docs cross-checked on ai-sdk.dev via context7)

- `ToolLoopAgent` + `stopWhen: isStepCount(N)` — current API; used in `backend/lib/agent.ts`, runs.
- `createAgentUIStreamResponse({ agent, uiMessages, sendSources, headers, onStepEnd, onFinish })` — all six options work together in a Next 16 route handler on Vercel. `onFinish` receives `{ messages }` = full updated list; saving it verbatim round-trips through `useChat({ messages: initial })`.
- `DefaultChatTransport({ api })` accepts a full cross-origin URL; useChat sends `{ id, messages, trigger, messageId }` — the backend reads `id` as the conversation key.
- `runAgentTUI({ agent })` and `runAgentTUI({ transport })` both verified — the transport mode from a package with no provider dep and no API key.
- The UIMessage SSE stream ends with `data: [DONE]` — not JSON; hand-rolled parsers must skip it.
- Persistent `data-*` parts (with `id`) reconcile in place client-side; `message.parts` retains them after finish. Generic rendering by `type.startsWith("data-")` works with zero shared types.

## Vercel

- New projects created via API (v11) with `rootDirectory` set work first-push; two projects on one repo both rebuild on every push (⏲ consider Ignored Build Step per project to skip unrelated rebuilds — not configured today, builds are ~35s so it was left alone).
- **Deployment Protection defaults ON for new projects.** Anonymous request → 302 to `vercel.com/sso-api` (captured). Turn off via dashboard or `PATCH /v9/projects/:id {"ssoProtection":null}`. **Nuance (2026-08-12 cold-run):** applies to DASHBOARD-created projects — the students' path, so beat ① holds. A `vercel` CLI-created project (muse-scout-scaffold-test) came up unprotected: health answered 200 immediately.
- **The deploy ladder reproduces cold (2026-08-12).** Fresh copy of `backend/` → `git init` → `gh repo create --private --source=. --push` (slide command, verbatim) → `vercel link` + `vercel deploy --prod` → `/api/health` 200 with CORS headers on `muse-scout-scaffold-test.vercel.app`. Without `OPENAI_API_KEY`, `/api/chat` 500s — the env-var step on the deploy slide is load-bearing.
- CORS: exporting `OPTIONS` (a function returning 204 + headers) from a route handler passes real browser preflight through Vercel's edge; `headers` on `createAgentUIStreamResponse` carries the headers on the streamed POST. Without the OPTIONS export, Next auto-answers OPTIONS with `allow:` but no CORS headers → browser blocks, curl doesn't.
- `NEXT_PUBLIC_*` inlines at build time — captured: deployed console with the var missing POSTs to its own origin and renders its own 404 page into the error banner.
- `vercel logs <url> --follow` streams runtime `console.log` lines (captured); without `--follow` you get request logs only. CLI v54.2.0. ⏲ re-check flags if CLI updates.
- `maxDuration = 300` + `after()` works for the deep-dive worker (ran ~60–90s post-response in production).

## Streaming

- Buffered proxy (`await r.text()`): first byte **38.93s**, total 38.93s. Direct streamed call: first byte **0.55s**, total 35.09s. Same agent, same question.
- A piping relay (`new Response(upstream.body)`) preserves streaming end to end (stage rail rendered live through it).

## muse-studio (session 8 — READ ONLY)

- Stable prod URL `https://muse-studio-vladimirdeziegler-gmailcoms-projects.vercel.app` is alive, public, streams UIMessage SSE.
- Its `/api/chat` has **no CORS headers** (preflight 204 without allow-origin) — browsers cannot call it cross-origin; the relay exists for exactly this.
- ⚠ **The deployed build is stale** (Jul 28 CLI deploy): it emits NO `data-stage` parts. Repo HEAD (`69abba9`) emits 12 per brief run — verified by running `session-8/live` locally on :3002. **Prep item: redeploy muse-studio from unchanged HEAD before the session** so the deployed bookend shows the stage rail. Session-8 files were not modified.

## Supabase

- Tables `scout_conversations`, `scout_memories`, `scout_jobs`, `scout_runs` created in the shared program project (`acqwpworipnsypnnyvpc`) via `supabase db query --linked -f backend/migration.sql` (CLI 2.100.1, linked from session-8b/).
- Memory verified three ways: same-id recall from a history-less client; sidebar list/reopen; durable facts surfacing in a brand-new conversation.

## Costs / footprint (approximate, from today's run)

- A scout one-liner: ~4.5k input tokens (98% cache-read) + a web search call.
- The full build run (all testing incl. muse briefs) — single-digit dollars on the OpenAI key. ⏲ measure one scout message + one deep dive precisely during prep for the cost slide.
