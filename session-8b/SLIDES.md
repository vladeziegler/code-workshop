# Session 8b — slide-by-slide content map

Written from the tested run of 2026-08-05. One row per planned slide; every
command/number/capture below was executed or taken for real that day. This is
the deck's blueprint and the author's review surface before the Marp pass.

**2026-08-06:** the deck's wording was rewritten conversationally (author
feedback F-010 — plain language first, no "socket/plug" vocabulary on slides,
fundamentals said out loud). Slide *titles* below are the old planning names;
DECK.md is the source of truth for wording. Content, captures, and numbers in
this map still hold.

**2026-08-12 (author feedback round):** plan slide → five objectives in the
author's words; new slides: agent-wrap diagram (`viz/card_wrap.png`), frontend
scaffold prompt, CORS handshake diagram (`viz/card_cors.png`), Swagger API map
(`viz/swagger.png`, spec in `backend/openapi.json`) after step 08; the keyless
remote-TUI slide (old row 13) was CUT (optional exercise only); every card
slide now carries its command as selectable text (cards show output only);
step-09 relay slide explains why `frontend/app/api/` exists (server file, not
state management); 🤖 markers replaced with plain "Prompt →" (emoji broke the
line in this theme). Deck: 49 slides.

Legend: 🖼 = capture exists in `captures/` · 🤖 = prompt box slide · ✅ = checkpoint slide

Not listed below: the per-step divider slides. Each carries the patch-panel spine
(`captures/viz/panel_sNN.png`) with the current cable lit blue, built cables green,
future ones dim — regenerate with `python3 captures/make_deck_visuals.py`. Terminal
output is never pasted raw: it renders as designed cards (`captures/viz/card_*.png`),
same generator.

| # | Part | Slide title (what you do) | On the slide | Source |
|---|---|---|---|---|
| 1 | Open | Session 8b — The Plug | title + patch-panel silhouette | — |
| 2 | Open | The bookend | 🖼 `step09-muse-final.png` (stage rail incl. judge rejection) + `frontend/lib/transport.ts` with the env line highlighted. Payoff: "Nothing on this page knows what an agent is. It knows one plug." | captures |
| 3 | Open | Count the cables | 🖼 `viz/panel_map.png` — patch panel drawn whole, six cables numbered (4 plugs × scout + console × {scout, muse}) | make_deck_visuals.py |
| 4 | Open | Agenda as consequences | 10 steps, third column = how the product fails without each | STEPS.md |
| 5 | 01 | The whole agent fits on one screen | `backend/lib/agent.ts`, all 15 lines, verbatim | lib/agent.ts (step-01 tag) |
| 6 | 01 | 🤖 → backend scaffold | prompt box + **Run it** · `npm run tui` | HANDOUT 1.1 |
| 7 | 01 | ✅ It chose to search | 🖼 `viz/card_tui_local.png` — designed card from the TUI transcript: web_search executing, Seahawks answer | `step01-tui-local-transcript.txt` |
| 8 | 02 | Give it a socket | the 3-line route, verbatim | app/api/chat (step-02 tag) |
| 9 | 02 | Put the socket on the internet | repo-create commands (`git init` + `gh repo create --push`) → project settings shot (Root Directory = backend/) + env var `OPENAI_API_KEY` → then deploy = `git push` | Vercel dashboard capture (to take) |
| 10 | 02 | ✅ A service, not a site | `curl <url>/api/health` + `{"ok":true,"service":"muse-scout"}` beside it; note: the root URL 404s and that's correct | terminal |
| 11 | 03 | The platform answers first | 🖼 `viz/card_302.png` — the 302 + sso-api location header, designed card | `step03-beat1-302-headers.txt` |
| 12 | 03 | The plug, in bytes | 🖼 `viz/card_wire.png` — labeled SSE chunks, one per part type | `step03-raw-wire.txt` |
| 13 | 03 | ✅ A client with no key | `clients/package.json` (no @ai-sdk/openai) + 🖼 remote TUI transcript | `step03-tui-remote-transcript.txt` |
| 14 | 04 | The socket has a logbook | the 2-line `onStepEnd` + 🖼 `viz/card_logs.png` (real `[scout] step 0 · {tokens} · stop` line, cache-read note) | `step04-vercel-logs-follow.txt` |
| 15 | 05 | The third plug is a browser | component map: Sidebar / Messages / ToolChip / SourceCards / Composer — one screenshot annotated | 🖼 `ui-final.png` |
| 16 | 05 | One line names the URL | `lib/transport.ts` verbatim + "`NEXT_PUBLIC_` is a publishing decision" | transport.ts |
| 17 | 05 | 🤖 → the wiring | three prompt boxes (Composer submit, parts renderer, page assembly) + **Run it** · `npm run dev` | HANDOUT 5.x |
| 18 | 05 | Act 1 — the browser refuses | 🖼 `ui-cors-blocked.png` + the exact DevTools text ("blocked by CORS policy: … No 'Access-Control-Allow-Origin'") + "curl still works, live" | captures |
| 19 | 05 | Act 2 — the proxy that ate the stream | naive-proxy route (the `await r.text()` line highlighted) + measured: **first byte 38.9s vs 0.55s** | `step05-naive-proxy-timing.txt` |
| 20 | 05 | Act 3 — the socket says who may plug in | `lib/cors.ts` + `export const OPTIONS = preflight` + preflight response with the three headers, real | `step05-preflight-ok.txt` |
| 21 | 05 | ✅ Tokens in a browser | 🖼 `ui-final.png` (web_search chip ✓, source cards) — Protected Moment #1 | captures |
| 22 | 06 | Second project, same repo | Vercel: New Project → Root Directory = `frontend/` (numbered dashboard steps) | dashboard capture (to take) |
| 23 | 06 | Changed the variable? Redeploy. | the build-time-inlining fundamental + the 2-step fix. NO error visual on the slide — failure beat ③ is a live-room moment scripted in the speaker note; `viz/card_404.png` is the facilitator's projector aid for it | speaker note |
| 24 | 06 | ✅ On a phone | 🖼 `step06-prod-working.png` + the two URLs side by side | captures |
| 25 | 07 | State belongs to the service | `migration.sql` (conversations table) + Why/Tradeoff — SQL only; the route code moved to its own slide | backend files |
| 25b | 07 | The route loads before, saves after | the load/merge/save calls verbatim + "a synced client's history wins, never both copies" | chat route (step-07 tag) |
| 26 | 07 | The sidebar is the proof | 🖼 `step08-ticket-done.png` crop: three conversations listed with titles/times | captures |
| 27 | 07 | ✅ Two plugs, one memory | 🖼 `viz/card_memory.png` — `npm run ex 03 <id>` with its real output ("- Vladimir · short bullet-point answers") | terminal transcript |
| 28 | 08 | Slow work returns a ticket | `deep_dive` tool (insert → after() → runs) + jobs=intent/runs=fact inherited line | lib/jobs.ts |
| 29 | 08 | ✅ The ticket is interface | 🖼 `viz/card_ticket.png` — `curl /api/jobs/<id>` with the real done/deep_dive/result JSON | `step08-curl-ticket.txt` |
| 30 | 09 | A socket you don't own | muse-studio preflight: 204, **no** allow-origin headers → "curl can, the browser can't" | terminal capture |
| 31 | 09 | Relay, but pipe | relay route vs naive proxy, one line different (`upstream.body` vs `await r.text()`) | both files |
| 32 | 09 | 🤖 → render parts you never defined | StageChip prompt box + the generic `data-*` filter | StageChip.tsx |
| 33 | 09 | ✅ The studio on today's console | 🖼 `step09-muse-final.png` — router ✓ 1.0s · fan-out ✓ 23.3s · Draft 1 ✓ 34.0s · judge ✗ rejected · redraft running. **"A route is an interface."** Protected Moment #2 | captures |
| 34 | 10 | Ship the patch | the env-var table (scout mode / muse mode) + "the flip requires a rebuild — you learned why at step 06" | STEPS.md table |
| 35 | 10 | ✅ Full product, phone out | 🖼 `step10-prod-muse.png` | captures |
| 36 | Close | Recount the cables | 🖼 `viz/panel_done.png` — patch panel, all six cables green; re-read slide 2 | make_deck_visuals.py |
| 37 | Close | Two things to keep | the drawing + "a route is an interface — clients and services swap at the URL" | — |

## Measured numbers — put these on slides, not estimates

| Number | Value | Where |
|---|---|---|
| Naive proxy first byte | **38.9s** (total 38.9s) | slide 19 |
| Direct stream first byte | **0.55s** (total 35.1s) | slide 19 |
| muse router stage | 1.0s | slide 33 |
| muse fan-out (market+audience, 5 sources) | 23.3s | slide 33 |
| muse Draft 1 | 34.0s | slide 33 |
| scout one-liner request tokens | 4,486 in / 16 out (4,438 cached) | slide 14 |
| Vercel build, either project | ~30–40s | slides 9/22 |

## Still to capture during the deck pass

- Vercel dashboard: Root Directory settings screen (slides 9, 22)
- Vercel dashboard: Logs live-tail UI (slide 14 alternative to CLI)
- A phone-frame shot of the prod console (slides 24/35 garnish)
