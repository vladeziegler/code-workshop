# Verified Facts — Modules 7–10 (checked 2026-07-27)

Every load-bearing technical claim in the module outlines has been checked against current official docs/source. This file is the evidence trail (facilitator-side only — the outlines state these as owned facts). Re-verify anything here if teaching after ~October 2026.

## OpenAI API (Module 7; judge/classifier in Module 10)

All from developers.openai.com (platform.openai.com redirects there):

- **Model lineup/pricing:** gpt-5.6-sol $5/$30 · gpt-5.6-terra $2.50/$15 · gpt-5.6-luna $1/$6 per MTok; gpt-5.4-mini $0.75/$4.50 · gpt-5.4-nano $0.20/$1.25. Cached input ~10% of the input rate. All three 5.6 models are reasoning-capable, 1.05M context / 128K max output.
- **Structured outputs:** `client.responses.parse(..., text_format=PydanticModel)` → `response.output_parsed`; raw form `responses.create(text={"format": {"type": "json_schema", "name": ..., "strict": True, "schema": ...}})`. `chat.completions.parse(response_format=...)` is the legacy spelling. Strict-mode rules: all fields required, `additionalProperties: false`, optional via null union; recursion supported via `$defs`; NOT supported: minProperties/maxProperties/propertyNames, uniqueItems/contains. Official examples now show `minLength`/`minimum` inside strict schemas — enforcement details unasserted in the outline; the open-dict-field 400 is the failure beat instead. First-call schema-compilation latency is real (24h cache).
- **Reasoning:** `reasoning={"effort": ...}`, ladder `none → minimal → low → medium → high → xhigh` (some models add `max`/`mode:"pro"`); not every model supports every rung — the model page is the source of truth. `usage.output_tokens_details.reasoning_tokens`; docs recommend ~25k output-token headroom when experimenting.
- **Images:** current model `gpt-image-2` (cheap tier `gpt-image-1-mini`); `client.images.generate(...)` returns `data[0].b64_json` by default; quality low/medium/high/auto; sizes incl. 1536x1024. The Responses `image_generation` tool (multi-turn editing) exists — full-day material.
- **Unmeasured (prep-capture lines in the outline):** exact 400 body for `temperature` on the 5.6 family; whether `effort="none"` relaxes the sampling-param rejection.

### Web search, vision, images (checked 2026-07-28, developers.openai.com)

- **Web search tool:** `tools=[{"type": "web_search"}]` (unversioned; `web_search_preview` is legacy). Options: `search_context_size` low/medium/high, `filters.allowed_domains`/`blocked_domains` (max 100), `user_location`, `search_content_types`, `external_web_access`. Response: a `web_search_call` item, then a `message` whose `content[0].annotations` carries `url_citation` objects (url, title, indices); full source list via `include=["web_search_call.action.sources"]`. Docs require visible, clickable citations in your UI. Pricing: **$10/1k calls** + content tokens at model rates. Not supported with minimal reasoning on gpt-5.
- **Search + structured output in ONE call: known bug** — `web_search_call` succeeds but `annotations` returns empty when `text.format`/parse is active (community-reported Mar 2025, re-confirmed through Dec 2025, no fix). **Workshop idiom: two-step** — `responses.create` with web_search (text + citations), then `responses.parse(text_format=Model)` on the findings. Alternative: URL fields in the schema + `include=[...sources]`.
- **Vision input:** content part `{"type": "input_image", "image_url": "<https or data:image/...;base64,...>", "detail": "auto"}` — base64 goes inside `image_url` as a data URI, no separate field; `file_id` variant exists (purpose="vision"). `detail`: low (512px) / high / auto / original (gpt-5.6). Image tokens bill as input tokens on the 5.6 family.
- **Image generation re-confirmed:** `client.images.generate(model="gpt-image-2")`; sizes up to 3840 max edge (multiples of 16, ≤3:1), quality low/medium/high/auto; base64 by default via `result.data[0].b64_json`. gpt-image-2: text in $5/1M, image in $8/1M, out $30/1M.

## Anthropic API (Modules 9–10: the agent, evals, monitoring)

- **Pricing:** claude-opus-5 $5/$25 · claude-sonnet-5 $3/$15 sticker, **$2/$10 intro through 2026-08-31** · claude-haiku-4-5 $1/$5 per MTok.
- **Structured output:** `client.messages.parse(..., output_format=PydanticModel)` → `response.parsed_output`; `client.messages.create(..., output_config={"format": {"type": "json_schema", "schema": ...}})`. Top-level `output_format` on `create()` is deprecated.
- **Sampling params:** `temperature`/`top_p`/`top_k` → **400 on opus-5 and sonnet-5** (non-default values), **still accepted on haiku-4-5**. This per-tier asymmetry backs Module 10's eval-recipe gotcha (OpenAI's 5.6 family rejects uniformly; Claude rejects per-tier).
- **Thinking:** `thinking={"type": "adaptive"}` (on by default on sonnet-5 when omitted); `budget_tokens` → 400. Depth via `output_config={"effort": "low|medium|high|xhigh|max"}`.
- **Schema limits:** `additionalProperties: false` + `required` enforced server-side; `max_length`/`ge`/`le` stripped from the wire and validated client-side by the SDK (they catch, they don't steer). No recursive schemas; citations + structured output = 400.
- **Vision:** high-res tier accepts up to 2576px long edge (~4,784 tokens/image); resize to ~1568px to control cost. Haiku 4.5 supports structured outputs (Module 10's judge is valid).

## Playwright on Railway (Modules 7–8) — now verified END-TO-END (2026-07-28)

The full render service (`session-7/live/` + its Dockerfile) is **deployed and proven on
Railway**: `https://muse-render-production.up.railway.app` — a complete `POST /onepagers`
run (web search + vision screenshot + gpt-image-2 + Playwright PDF + Supabase store)
returned 200 in **81.1s**, `stored: true`, public PDF fetch 200. Base image
`mcr.microsoft.com/playwright/python:v1.61.0-noble` pinned to `playwright==1.61.0`;
Chromium launched with `--no-sandbox --disable-dev-shm-usage`; shell-form CMD binding
`$PORT`. M8's preflight dependency is satisfied — the service exists; students replicate
the deploy, they don't pioneer it.

- **Use a Dockerfile, not Nixpacks** (GLIBC / missing-executable failures are common in Nixpacks builds). Railway's own guide recommends the Microsoft image.
- Verified Dockerfile:
  ```dockerfile
  FROM mcr.microsoft.com/playwright/python:v1.62.0-noble
  WORKDIR /app
  COPY requirements.txt .
  RUN pip install --no-cache-dir -r requirements.txt   # must pin playwright==1.62.0
  COPY . .
  CMD uvicorn app:app --host 0.0.0.0 --port ${PORT:-8000}   # shell form so $PORT expands
  ```
- Launch Chromium with `args=["--no-sandbox", "--disable-dev-shm-usage"]` (root container; no `--ipc=host` on Railway). ≥1 GB RAM per service. `page.pdf(print_background=True)` confirmed; PDF is Chromium-headless-only.

## supabase-py storage & auth (Modules 7, 8)

- `upload(path, file, file_options=...)`: upsert value **must be the string `"true"`** (flows into an httpx header; bool raises). Key `"upsert"` or `"x-upsert"` both work. Set `"content-type"` explicitly (default is `text/plain;charset=UTF-8`).
- Re-upload without upsert → 409 `StorageApiError`, code `ResourceAlreadyExists`.
- `get_public_url()` is a pure string-builder — no HTTP call, never errors.
- Buckets are private by default (`options={"public": True}`); `upload()` never auto-creates buckets; creating via client needs the service-role key.
- **Auth emails (built-in SMTP): 2/hour project-wide AND only delivered to project team members.** Magic links/confirmations are unusable in a workshop. Password auth with confirmations disabled sends zero emails; sign-in limit ~30 req/5min/IP.

## Vercel + AI SDK (Module 8)

- **`ai` `latest` is now v7** — pin the v5 line: `ai@^5.0.220` (`npm i ai@ai-v5`) + `@ai-sdk/openai@^2.0.115` (`npm i @ai-sdk/openai@ai-v5` — the v5-paired major; `latest` there is 4.x for ai v7). Zod peer: `^3.25.76 || ^4.1.8` (v3 and v4 both fine).
- v5 idiom confirmed: `streamText({ model, tools, stopWhen: stepCountIs(N) })` (`stepCountIs` from `'ai'`; default is 1 step — the "silent agent" failure beat is real); `tool({ description, inputSchema: z.object(...), execute })` (v4's `parameters` is gone). `anthropic('claude-sonnet-5')` is a valid provider model id.
- **Hobby + Fluid Compute: `maxDuration` max = 300s (hard), default 300s**; streaming counts. `waitUntil`/`after()` share the same budget — not a jobs escape hatch. Hobby cron: min once/day, ±59min precision. Hence: jobs drain on the Railway cron.

## Composio (Module 8)

- TS: `@composio/core` + `VercelProvider` from `@composio/vercel`. Current idiom: `const session = await composio.create(userId); const tools = await session.tools();` restrict via `{ tools: { gmail: { enable: ["GMAIL_SEND_EMAIL"] } } }`; connect via `session.authorize()` Connect Link. `userId` everywhere (`entityId` is gone).
- Slugs confirmed: `GMAIL_SEND_EMAIL` (`recipient_email`, `subject`, `body`), `GOOGLEDRIVE_FIND_FILE` (the catch-all Drive search — no `GOOGLEDRIVE_SEARCH`).
- **One Composio org/API key serves the whole room**; per-student `userId` (`student-01`…) with individual OAuth connects. Python package is `composio` (`composio-core` is legacy); Vercel provider is TS-only.

## Kapso (Module 9)

- **Outbound webhooks are per phone number** (dashboard, or `POST /whatsapp/phone_numbers/{id}/webhooks`), `kind: "kapso"`, event `whatsapp.message.received`; event name in `X-Webhook-Event` header; payload carries `message.id` (wamid — the idempotency key), `message.text.body`, `conversation.id`. Don't assume `from`/`phone_number` present.
- Signature: `X-Webhook-Signature` = HMAC-SHA256(body, `secret_key`), timing-safe compare.
- Replies: Meta-compatible proxy `POST https://api.kapso.ai/meta/whatsapp/v24.0/{phone_number_id}/messages` with `X-API-Key` — works on sandbox numbers (templates/bulk blocked on sandbox).
- Per-student isolation: **one Kapso project per student** (each project auto-gets a sandbox number). ⚠️ Remaining: webhook timeout/retry counts are undocumented (measure during prep); plan limits on projects per account (ask Kapso).

## Claude Agent SDK + MCP (Modules 9, 10)

- `pip install claude-agent-sdk` (0.2.x, Python ≥3.10). **Claude Code CLI is bundled — no Node, no npm install.** Optional external CLI via `ClaudeAgentOptions(cli_path=...)`.
- `create_sdk_mcp_server(name, version, tools=[...])` + `@tool(name, description, input_schema)` confirmed; tool names `mcp__<server>__<tool>`; `query()` vs `ClaudeSDKClient` idioms confirmed.
- Sessions: id from `ResultMessage.session_id`; resume via `ClaudeAgentOptions(resume=session_id)` (or `continue_conversation=True`; `fork_session=True` to branch). **On disk: `~/.claude/projects/<encoded-cwd>/<session-id>.jsonl`** — cwd-dependent (resume from a different cwd finds nothing) → the Railway volume mount in M9.5 must cover this path, and worker cwd must be stable.
- `claude mcp add --transport http <name> <url> --header "Authorization: Bearer ..."` is exact current syntax (short forms `-t`/`-H`).
- FastMCP: use the standalone **`fastmcp`** v2 package. `mcp.run(transport="http", host="0.0.0.0", port=...)` serves at `/mcp`. Server-side bearer auth: `FastMCP(name=..., auth=StaticTokenVerifier(tokens={...}))` (dev-only; `JWTVerifier` for production).
- MCP Inspector: `npx @modelcontextprotocol/inspector`; connect to a remote streamable-HTTP URL via the UI's connection pane.

## Module 8 — Vercel AI SDK stack, verified by execution (2026-07-28, `session-8/live/scripts/`)

All of the following ran against live APIs from the pinned install (not just docs):

- **Version pins that coexist cleanly:** `ai@5.0.221` (`ai-v5` dist-tag) + `@ai-sdk/openai@2.0.115` + `@ai-sdk/react@2.0.223` + `zod@4.4.3` + `next@16.2.12`. `latest` of `ai` is **7.0.40** — the bare-install trap in the outline's gotcha 1 is real. **`@composio/vercel` latest (0.11.x) requires ai v6/v7** — the last ai-v5-compatible line is `@composio/vercel@0.10.0` (peers `ai@^5||^6`, accepts `@composio/core@0.14.0`). Pin 0.10.0.
- **Web search on v5:** `openai.tools.webSearch({ searchContextSize })` exists in `@ai-sdk/openai@2.0.115` and works with `generateText` + `stopWhen: stepCountIs(n)` on `gpt-5.6-terra`; `result.sources` carries real citations (2 per query in tests). Single search ≈ 7–12s. (`webSearchPreview` is the legacy Responses spelling.)
- **Fan-out timing (4 rounds, two searches):** sequential 15.8–22.0s; parallel 11.8–18.9s. Parallel won 3/4 at ~1.4×; one round *lost* to a slow tail (18.9s vs 17.5s) — the fan-out's ceiling is the slowest branch. Teach the speedup with the measured pair AND the honest variance line; re-measure morning-of for the deck's numbers.
- **Image generation on v5:** `experimental_generateImage({ model: openai.image('gpt-image-2'), size: '1024x1024', providerOptions: { openai: { quality: 'medium' } } })` → **72.1s**, 1.68MB PNG via `image.base64`. Perfect async-arc engine: deterministically exceeds `maxDuration = 25`, fits comfortably in 300s. `gpt-image-2` and `gpt-5.6-terra` (M7's ids) both live on the workshop key; org is image-verified.
- **PDF render:** `@react-pdf/renderer@4.5.1` `renderToBuffer()` in plain Node — **87ms** for a one-page A4 kit with the 1.7MB hero PNG embedded (pass bytes/path, not a hotlink). No Chromium anywhere.
- **Composio Drive upload (the two undocumented walls, hit and solved):** (1) `GOOGLEDRIVE_UPLOAD_FILE` has a file-uploadable input — you must stage first: `composio.files.upload({ file: new File([bytes], name, {type}), toolSlug, toolkitSlug })` → `{name, mimetype, s3key}` descriptor passed as `file_to_upload` (or enable `dangerouslyAllowAutoUploadDownloadFiles`). (2) Manual `tools.execute` **requires a concrete toolkit version** — `version: "latest"` is rejected; current is `"20260721_00"` (from `GET /api/v3/tools/GOOGLEDRIVE_UPLOAD_FILE` → `available_versions[0]`; pin in starter/, re-check before the day). With both fixed: upload 4.6s, `successful: true`, real file id in Drive. Slugs confirmed: `GOOGLEDRIVE_UPLOAD_FILE`, `GOOGLEDRIVE_FIND_FILE`, `GOOGLEDRIVE_CREATE_FOLDER` (no `GOOGLEDRIVE_SEARCH`). Drive connection ACTIVE for `userId` `workshop-user`.
- **Environment:** node 22.16 ✓, vercel CLI 54.2.0 logged in ✓, Supabase `runs` exists, `jobs` 404 (migration owns it), OpenAI web-search pricing $10/1k calls (see M7 section).
- **npx/create-next-app note:** `create-next-app` failed twice under the RTK hook environment (enoent mid-run); the live app is hand-scaffolded — starter/ should ship complete scaffolding rather than have students run `create-next-app`.

### Module 8 — full app verified END-TO-END, local AND production (2026-07-28)

`session-8/live/` (Muse Studio, next@16.2.12) is built, deployed, and proven:
**https://muse-studio-4glz1j5u1-vladimirdeziegler-gmailcoms-projects.vercel.app**

- **Local full flow:** commission → four shapes in the console log (router `full-kit` → fan-out 10.1s ‖ 18.0s → brief drafted → judge `retry → pass`, a real retry on real generic-headline grounds) → kit stored in `runs` → `generate_image` claim ticket → `after()` render 64–79s → `runs` row with public storage URL → "ship it" → check_job + save_to_drive → **one PDF in Drive with the image embedded** (`image_embedded: true`).
- **Production full flow (the real proof):** same two messages against the deployed URL — pipeline turn 49.5s, `after()` worker completed ON Vercel (run id 15, public image URL), ship turn 10.8s, Drive file id `1FPbdX8ReyzWiXRIsOtLONvcEkenI493M`. react-pdf + Composio file staging both work inside a Vercel function.
- **The 504 beat, captured:** naive inline route with `maxDuration = 25` → **HTTP 504 after 25.36s**, body `An error occurred with your deployment — FUNCTION_INVOCATION_TIMEOUT — cdg1::…`. Deterministic; the real error text for the deck.
- **NEW GOTCHA — deployment protection:** Vercel enables SSO Deployment Protection by default on new projects — every route (including APIs) returns **302 "Redirecting…"** until it's disabled (dashboard → Deployment Protection, or PATCH `ssoProtection: null` via API). Must be in the preflight or the first production curl of the day mystery-fails.
- **Idempotency + claim-ticket behavior observed:** asking to ship while the job was pending → agent checked `check_job`, saw no run, and declined to ship on its own; pending-job check prevents duplicate `jobs` rows.
- **Migration applied** via `supabase link` + `supabase db query --linked -f migration.sql` (Management API — no DB password needed): `jobs` table, `runs` + `kind/job_id/image_url/detail` columns, public `images` bucket. S6's 9 scraper runs remain and give M1's run-history page real day-one data.
- **Measured numbers for slides:** chat+search turn 8.7s · pipeline turn 43–65s · image render 64–79s (gpt-image-2, medium, 1024²) · PDF render 87ms · Drive upload 4.6s · prod build 37s.

### Module 8 — failure beats verified by execution (2026-07-28)

- **Unconnected wire (M3 beat), run for real** (`scripts/unconnected-wire.ts`): with the research
  interpolation removed, gpt-5.6-terra invented a **wellness-brand identity for Muse** ("Wear What
  Grounds You." / "A Spring Reset, Worn Well." / positioning on "feeling grounded, present") — no
  error, pipeline completed. **The typed `facts` field confessed** ("No market-research materials
  were included") while the creative fields confabulated. Teaching upgrade: the typed joint is what
  told the truth. Grounded run for contrast (runs id 18): facts cite McKinsey/BoF, Wallpaper*,
  Pinterest Predicts 2026, ASOS Muse Assembly.
- **Key leak (M1 beat), run for real**: a `'use client'` page reading
  `NEXT_PUBLIC_SUPABASE_SERVICE_KEY` builds green, and the raw JWT appears verbatim in
  `.next/static/chunks/<hash>.js` (found at offset 329, next to the JSX). Leaky page preserved at
  `session-8/captures/leaky-page.tsx.txt` for starter's failure beat.
- **Claim-ticket honesty observed twice**: asked to ship while the job was pending, the agent
  called `check_job` and declined ("still pending — not ready to ship"), unprompted both times.
- **UI note:** assistant replies need a markdown renderer (`react-markdown` + small CSS block) —
  raw `##`/`**` in the chat looks broken on the projector; shipped in live/, must be in starter/.
- Captures inventory: `session-8/CAPTURES.md` (15 images produced; 3 morning-of items listed).

### Module 8 — REBUILT on ai v7 Agent abstraction, re-verified end-to-end (2026-07-28, later)

Author feedback ("are you sure you're using the Agent SDK from Vercel correctly?") led to a rebuild
on the current line — which IS the canonical idiom and simplifies everything taught:

- **New pins (all verified by execution, local AND production):** `ai@7.0.40` + `@ai-sdk/openai@4.0.22`
  + `@ai-sdk/react@4.0.43` + `@composio/vercel@0.11.1` (no more 0.10 pin — latest targets v6/v7) + `next@16.2.12`.
- **The canonical agent idiom:** `new ToolLoopAgent({ model, instructions, tools, stopWhen: isStepCount(8) })`
  in `lib/agent.ts`; the chat route is three lines: `createAgentUIStreamResponse({ agent, uiMessages: messages })`.
  `useChat` unchanged (parts-based). v7 renames: `stepCountIs`→`isStepCount`,
  `experimental_generateImage`→`generateImage`. `generateText`/`generateObject`/`tool()`/provider
  `openai.tools.webSearch` unchanged from v5.
- **Full exercise re-run on v7:** pipeline (router→fan-out 13.2s‖16.8s→chain→judge retry("audience
  too broad")→pass) · `after()` worker 89.4s local / ok on prod (run 26) · declined-ship-while-pending
  observed again · Drive PDFs `1iC41weQ…` (local) and `1GrU4Qjl…` (prod), `image_embedded: true`.
- **Dev-only flake, documented:** one run's `after()` callback silently never started in `next dev` —
  almost certainly stale dev state from running `next build` against the same `.next` while `next dev`
  was live. Facilitator rule: never build while dev runs; if a local job never starts, restart dev.
  Worker now logs `starting` as its first line so silence is diagnosable. (Production unaffected.)
- **Tool renames for teachability:** `create_campaign_kit`→`create_brief`; runs kind `kit`→`brief`
  (DB migrated). Five tools: web_search · create_brief · generate_image · check_job · save_to_drive.
- **Captures re-shot at 860px viewport** (column fills frame, 16.5px chat type) — slide-legible;
  declined-beat capture uses a seeded pending job (captures/capture_pending2.py) so it's cheap to reproduce.

## Remaining open items (operational, not factual)

1. Kapso webhook timeout/retry counts — measure once during prep (Module 9 deck needs real numbers).
2. Kapso plan limits on projects/sandbox numbers per account — confirm with Kapso before committing to per-student projects.
3. Render service deployed and responding — standard pre-session check for Modules 8 and 10.
4. claude.ai custom-connector plan gating (Module 10 facilitator demo) — confirm current plan requirements.

## Module 8 Stage-2 spike (2026-07-28, session-8/spike — live API runs)

- **`openai.tools.webSearch({})`** exists on `@ai-sdk/openai@2.0.115` (ai v5 line) and works
  inside `generateText` with `model: openai.responses("gpt-5.6-terra")` + `stopWhen` —
  sourced answer in ~5s, `result.sources` populated. (`webSearchPreview` is the legacy
  helper; `imageGeneration` also exists as a provider tool — unused by design, the slow
  job is the point.)
- **`generateObject` + Zod**: works against the Responses API. The wire schema goes out
  `strict: false`, and exact-size constraints (`z.array().length(3)`) validate **client-side
  only** — the model returned 6 headlines and the SDK threw `NoObjectGeneratedError`.
  Steer in the schema `.describe()` + prompt ("exactly three"), let the constraint catch.
  This is M7's "description steers, validation catches" lesson, now in TypeScript — teach it.
- **`experimental_generateImage`** works with **`openai.image("gpt-image-2")`** (current
  model — outline upgraded from gpt-image-1). Returns `image.uint8Array`; 1024×1024 ≈ 1.9MB.
- **`@react-pdf/renderer` (4.5.1)** renders server-side in plain Node with an embedded PNG
  (`renderToFile`, `Image` from a file path) — no Chromium. Vercel-function confirmation
  happens during the app build.
- Pins that produced these results: `ai@5.0.221` · `@ai-sdk/openai@2.0.115` · `zod@4` ·
  `@react-pdf/renderer@4.5.1` · `react@19`.
