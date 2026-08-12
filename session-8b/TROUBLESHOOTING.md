# Session 8b — troubleshooting (symptom → cause → fix)

| Symptom | Cause | Fix |
|---|---|---|
| `curl` gets `302` + `Redirecting...` | Deployment Protection (default ON for new projects) | Project → Settings → Deployment Protection → off |
| Root URL of the scout 404s | API-only app has no pages | Correct behavior; use `/api/health` |
| Console submits, nothing happens, curl works | CORS — error is in DevTools console, not on the page | Backend `lib/cors.ts` + `export const OPTIONS = preflight` + `headers: CORS_HEADERS` on the response; redeploy scout |
| Answer arrives all at once after long silence | Something buffered the stream (a proxy `await`ing the body) | Call the socket directly, or pipe: `new Response(upstream.body)` |
| Deployed console posts to itself / banner full of HTML | `NEXT_PUBLIC_SCOUT_URL` missing/set after build (inlined at build time) | Set the var, then **Redeploy** — restart does nothing |
| `npm run tui` → `OPENAI_API_KEY` missing | `.env.local` not filled | Copy `.env.example` → `.env.local`, paste value |
| Hand-rolled stream parser crashes on `[DONE]` | SSE terminator isn't JSON | Skip `data: [DONE]` before `JSON.parse` (repo parsers do) |
| Sidebar empty after chatting | Step < 07, or scout deployed without Supabase env vars | Add `SUPABASE_URL` + `SUPABASE_SERVICE_KEY` to **scout** env, redeploy |
| TUI/script with same conversation id doesn't remember | Different id (ids are client-minted), or save failed | Copy the exact id from the sidebar; check scout function logs for `[store]` errors |
| Job ticket stuck on `queued` forever | Polling a socket without `/api/jobs` (muse mode), or worker crashed | scout mode: check function logs (`vercel logs --follow`); muse mode: expected — muse-studio has no jobs endpoint |
| Step 09: chips/text render but no stage rail | Target muse-studio build predates the stage writer | Redeploy muse-studio from `session-8/live` HEAD (facilitator prep item #1) |
| Step 09 local: browser blocked calling muse directly | muse-studio has no CORS headers | Use the relay (`NEXT_PUBLIC_USE_RELAY=1`, `RELAY_TARGET=…`) — that's the lesson |
| Two projects rebuild on every push | Default monorepo behavior | Harmless (~35s builds); optionally set Ignored Build Step per project |
| "Streams in curl but not in the browser" decision tree | — | 1) CORS headers on response? 2) OPTIONS exported? 3) anything proxying? 4) `NEXT_PUBLIC_SCOUT_URL` right in the served bundle? |
| "An error occurred." on the SECOND message; logs show `Duplicate item found with id rs_…` | Route re-sent stored history alongside the client's copy (the saved assistant message has a different message id) | Fixed step-07+: overlap check — synced client's history wins; stored only prepends for fresh clients. `git pull` / re-checkout your tag |
