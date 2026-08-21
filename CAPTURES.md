# Module 8 Captures — artifact → slide map

All images in `images/`. Browser screenshots produced 2026-07-28 from real runs
(localhost + production); designed cards regenerated 2026-08-05 against the
exercise ladder in `live/exercises/`.
Generators: `captures/capture_ui.py` (browser, dsf=2) · `captures/make_visuals.py` (designed cards).

## Real screenshots (Playwright, device_scale_factor=2)

| File | What it shows | Slide |
|---|---|---|
| `pdf-kit.png` | the delivered one-page kit: sourced facts + embedded hero | Bookend open + close |
| `ui-ship-tail.png` | the 2-turn transcript with all four shapes fired | Bookend open + close |
| `ui-ship-pending-tail.png` | agent declines to ship: "still **pending**" | P6 "The ledger answers for you" |
| `ui-empty.png` | Muse Studio chat, empty state | spare |
| `ui-midflow.png` | chips spinning while `create_brief` runs | spare / P4 trace narration |
| `ui-kit-reply.png` | full turn 1: chips ✓✓, rendered brief, job id | spare |
| `ui-ship-pending.png` | full-height version of the pending decline | spare |
| `ui-runs-pending.png` | runs page before the new image | spare |
| `ui-runs-image.png` | runs page: kit/image/**scrape** rows — S6 continuity visible | spare / P1 build ✅ |
| `ui-ship-reply.png` | full 2-turn convo: check_job ✓ save_to_drive ✓, Drive file id | spare |

## Designed cards and diagrams (HTML→PNG, real data)

| File | What it shows | Slide |
|---|---|---|
| `spine-request-path.png` | THE REQUEST PATH strip | map slide + dividers |
| `agent-runtime.png` | the layers, and the four things the model decides at the end of a step | P0 "What happens inside one step" |
| `card-types-async.png` | Python↔TS types · `await` · `Promise.all` | P1 "Three things the type system does for you" |
| `card-pydantic-zod.png` | `BaseModel` ⟶ `z.object` field by field | P1 "Pydantic, in TypeScript" |
| `card-agent-anatomy.png` | annotated `ToolLoopAgent`: model ① instructions ② tools ③ stopWhen ④ | P2 "An agent is a named thing" |
| `card-callback-attach.png` | constructor (what it IS) vs per-call (what you WATCH) | P2 "Where the pieces attach" |
| `diagram-sequential.png` | research → output key → typed brief | P3 Sequential |
| `diagram-router.png` | classify → one label → three branches with their costs | P3 Routing |
| `diagram-parallel.png` | three specialists, own instructions + own schema, then synthesis | P3 Parallel |
| `card-timing.png` | sequential 19.7s vs parallel 12.9s + "ceiling = slowest branch" | P3 "The floor is the slowest branch" |
| `diagram-orchestrator.png` | planner → typed plan → one worker per item → synthesis | P3 Orchestrator |
| `diagram-evaluator.png` | draft once, evaluate → your threshold → ship, with the feedback back-edge | P3 "Evaluate, then improve" |
| `diagram-delegation.png` | a tool whose execute() is another agent | P3 Delegate |
| `card-pattern-log.png` | one request, four shapes in the console (real log lines) | P3 build ✅ |
| `card-grounded-vs-invented.png` | unconnected wire: invented wellness brand vs sourced brief; the typed `facts` field confessed | P3 "Read the facts field" (the one sanctioned ✓/✗ slide) |
| `card-tool-anatomy.png` | annotated `tool()`: description ① inputSchema ② contextSchema ③ execute ④ | P4 "A tool is a typed function…" |
| `card-memory-array.png` | the three-line mechanism + the measured token growth | P5 "The model remembers nothing" |
| `diagram-memory.png` | `conversations` (verbatim, grows) vs `memories` (curated, small) | P5 "Two tables, two kinds of memory" |
| `diagram-live-vs-queued.png` | two lanes: await → 504 · insert jobs → ticket → runs | P6 "Live call vs queued job" |
| `card-claim-ticket.png` | 5-step flow: POST → jobs → after() → runs → poll | P6 "Split the work from the reply" |
| `card-blind-vs-ticket.png` | ex-31 both columns: id discarded vs id returned | P6 "Two agents, one job…" |
| `card-key-leak.png` | actual bundle chunk with the service key inline (masked) | P1 key-leak beat (notes backup) |
| `card-504.png` | production `FUNCTION_INVOCATION_TIMEOUT` after 25.36s, verbatim | P6 timeout beat (notes backup) |

## Measured numbers (for slides — re-measure morning-of)

| Station | Measured |
|---|---|
| chat + one web search turn | 8.7s |
| single web search | 7–12s |
| fan-out (2 searches) sequential → parallel | 19.7s → 12.9s (won 3/4 rounds) |
| three parallel specialists (ex 13) | 5.5s · 11.7s · 20.6s → joined at 20.6s |
| agent-routes vs you-route, 3 requests (ex 12) | 15 calls / 105.6s vs 6 calls / 35.0s |
| evaluator loop (ex 14) | passes on iteration 1 at threshold 8; exhausts 3 rounds at 9 |
| full pipeline turn (router→fan-out→brief→judge) | 43–65s |
| conversation memory, 4 turns (ex 22) | 37 → 76 → 107 → 138 input tokens (amnesiac control: 35) |
| subagent delegation (ex 16) | parent context 2,310 tokens · child spent 44,854 |
| background research job (ex 31) | 12.8–18.0s; ticket returned in **0.4s** |
| image render (gpt-image-2, medium, 1024²) | 60–80s (60.4s measured 2026-08-05) |
| PDF render (@react-pdf, image embedded) | 87ms |
| Composio stage + Drive upload | ~4.6s |
| naive route timeout | 504 at 25.36s |
| Vercel prod build | 37s |

## Still to capture (facilitator prep, morning-of)

- Drive folder screenshot with the kit PDFs in it (logged-in browser; before/after pair for P4).
- Phone screen-recording of the bookend flow against production (slide 2's video).
- Vercel dashboard function-logs view of the 504 (dashboard login; the curl card covers the dry-run).
- Supabase table-editor shot of `conversations` + `memories` after `npm run ex 23`, for P5's protected moment.
