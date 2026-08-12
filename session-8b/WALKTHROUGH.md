# Session 8b — facilitator walkthrough

The chronological script: which folder, which file, which command, at every step.
Deck slide numbers refer to the current DECK.html (50 slides). Timings from README's run of show.

**The two URLs (facilitator reference build):**
- Backend (agent API): `https://muse-scout-vladimirdeziegler-gmailcoms-projects.vercel.app`
- Frontend (chat page): `https://muse-console-vladimirdeziegler-gmailcoms-projects.vercel.app`

---

## Before the room fills (morning-of, ~20 min)

1. `cd session-8-product/live && npx vercel deploy --prod` — the studio's stage-writer
   is **uncommitted working-tree code**; deploy from that directory, don't clean it.
   Verify: `cd session-8b/backend && npm run ex 05 https://muse-studio-opal.vercel.app`
   → must dump `data-stage` lines.
2. Wipe demo data so the sidebar starts empty: clear `scout_conversations`,
   `scout_memories`, `scout_jobs` in Supabase.
3. Console must be in **scout mode** (footer shows the scout URL, label "muse scout").
4. `export SCOUT_URL=https://muse-scout-<you>.vercel.app` in the terminal you'll project.
5. Full checklist: README.md "Facilitator prep" + preflight block.

---

## Open (0:00–0:15 · slides 1–4)

**Show: nothing in the editor yet.** Two browser tabs + the whiteboard.

- Slide 2 bookend: play `captures/step09-rail-crop.png` straight — don't explain.
- Slide 3: draw the map on the whiteboard (agents left, callers right). It's
  `captures/viz/panel_map.png`.
- Slide 4: the five objectives. Read the "without it" column out loud.

## Step 01 — the agent itself (0:15–0:32 · slides 5–9)

**Folder: `backend/` · files: `lib/agent.ts`, `exercises/01-tui-local.ts`**

1. Open **`backend/lib/agent.ts`** — hand-type the 15-line `scoutAgent` together (slide 6).
2. Slide 7 (`viz/card_wrap.png`): the wrap picture — agent inside endpoint inside URL.
3. Students run the scaffold prompt (slide 8), then:
   ```sh
   cd backend && npm install && npm run tui
   ```
4. ✅ Everyone asks something post-cutoff → the `web_search` card appears unscripted.
   Show `exercises/01-tui-local.ts` (5 lines) — "the agent is a library; no server."

## Step 02 — wrap + deploy (0:32–0:48 · slides 10–12)

**Files: `backend/app/api/chat/route.ts` (hand-type), `backend/app/api/health/route.ts` (paste)**

1. Hand-type the 3-line POST route (slide 11). Read it as a story: request in →
   agent runs → response streams out.
2. Deploy (slide 12, walk the dashboard slowly):
   ```sh
   git init -b main && git add -A && git commit -m "muse-scout"
   gh repo create muse-scout --private --source=. --push
   ```
   vercel.com/new → Import → **Root Directory = `backend/`** → env `OPENAI_API_KEY` → Redeploy.
3. ✅ `curl https://muse-scout-<you>.vercel.app/api/health` → `{"ok":true,...}`
   Say gotcha #1 now: the bare domain 404s — correct, there are no pages.

## Step 03 — call it from anywhere (0:48–1:02 · slides 13–15)

**Folder: `clients/` · file: `curl-wire.sh`**

1. Beat ①: everyone curls health → 302 SSO page. Read the `location:` header
   together. Dashboard → Deployment Protection → off. (slide 14)
2. The chat curl (slide 15) — students type it or run the wrap-proof script:
   ```sh
   export SCOUT_URL=https://muse-scout-<you>.vercel.app
   sh clients/curl-wire.sh "What happened in AI news today? Two lines, with sources."
   ```
3. ✅ Raw labeled events scroll. Name the types as they pass. Point at
   `clients/package.json`: no OpenAI dep, no key.
   (Optional for fast rooms: `backend/exercises/02-wire-reader.ts` via `npm run ex 02`
   — same wire with timings.)

## Step 04 — the logbook (1:02–1:12 · slide 16)

**File: `backend/app/api/chat/route.ts` (grows by the 2-line `onStepEnd`)**

1. Hand-type the log lines, `git push` (deploy = push, felt again).
2. DEMO on the projector, not typed:
   ```sh
   vercel logs https://muse-scout-<you>.vercel.app --follow
   ```
   One student fires a message; the room watches it land. Point at the 4,489 input
   tokens / 4,438 cached.

## Step 05 — the web page (1:12–1:48 · slides 17–26)

**Folder: `frontend/` · files: `lib/transport.ts` (hand-type), `components/*` (generated), `app/api/naive-proxy/route.ts`, backend's `lib/cors.ts`**

1. Scaffold prompt for `frontend/` (slide 18); catch-up: `git checkout step-05 && npm install`.
2. Tour `frontend/components/`: Sidebar · Messages · ToolChip · SourceCard · Composer ·
   JobStatus · StageChip (the last two are "later today").
3. Hand-type **`frontend/lib/transport.ts`** (slide 20) + `.env.local` with
   `NEXT_PUBLIC_SCOUT_URL`. Slide 21 (`viz/card_urls.png`): two deployments, one wire —
   say the three consequences from the note.
4. Wiring prompt (slide 22), then `npm run dev` → localhost:3001.
5. Beat ② in three acts:
   - Act 1 (slide 23): submit → nothing. Error is in **DevTools console**, not the page.
     Keep the step-03 curl running in a visible terminal — it still works.
   - Act 2 (slide 24): show **`frontend/app/api/naive-proxy/route.ts`** — the tempting
     fix. Let the room sit through the 38.9 s once. Numbers are measured.
   - Act 3 (slide 25): hand-type **`backend/lib/cors.ts`** + `export const OPTIONS`
     in the chat route → `git push` (backend only!). Slide 26 (`viz/card_cors.png`):
     the handshake, drawn.
6. ✅ Tokens stream into their page; search chip runs to ✓.

**Break (1:48–1:56)** — pre-empt gotchas: migration.sql is idempotent; Supabase key
goes in the backend's Vercel env only.

## Step 06 — deploy the page (1:56–2:10 · slides 28–30)

**No new files — Vercel dashboard only.**

1. New Project → same repo → **Root Directory = `frontend/`** → deploy *without* the
   env var (engineered).
2. Beat ③: submit → the page's own 404 in the error banner (have `viz/card_404.png`
   ready to project). Set `NEXT_PUBLIC_SCOUT_URL` → **Redeploy** (slide 29: baked at
   build time). Flag: "this is why step 10 takes one minute."
3. ✅ Phones out: `muse-console-<you>.vercel.app`.

## Step 07 — memory (2:10–2:28 · slides 31–35)

**Files: `backend/migration.sql` (paste in Supabase), `backend/lib/store.ts` (generated), chat route grows the load/merge/save, `backend/app/api/conversations/*`**

1. Paste `migration.sql` in the Supabase SQL editor. Add the two Supabase env vars
   to the **backend's** Vercel project → redeploy.
2. Hand-type the load/merge/save lines (slide 33) — "a synced client's history wins."
3. ✅ Three proofs, in order:
   - hard-refresh keeps the chat; sidebar lists and reopens it
   - `npm run ex 03 <id-from-sidebar>` → a script recalls what they told the browser
     (file: `backend/exercises/03-shared-memory.ts`)
   - a NEW conversation still knows their name → `scout_memories` + the `remember`
     tool in `lib/agent.ts`

## Step 08 — jobs + the API map (2:28–2:42 · slides 36–40)

**Files: `backend/lib/jobs.ts`, `backend/app/api/jobs/[id]/route.ts`, `backend/openapi.json`**

1. Show the `after()` split in `lib/jobs.ts` (slide 37) — reply now, work later.
2. Ask the console for a deep dive → ticket card appears with the job id; DevTools
   Network tab (filter "jobs") shows the 2-second polling (slide 38).
3. ✅ `npm run ex 04 <job-id>` redeems the same id from a terminal
   (file: `backend/exercises/04-job-poller.ts`). ~40 s to done.
4. Slide 40: import **`backend/openapi.json`** at editor.swagger.io → the whole API
   on one screen; Try-it-out on `GET /api/jobs/{id}`.
   *If late: this whole step collapses to a facilitator demo.*

## Step 09 — point it at a different agent (2:42–2:53 · slides 41–45)

**Files: `frontend/app/api/relay/route.ts` (paste), `frontend/components/StageChip.tsx` (generated), `backend/exercises/05-foreign-parts.ts`**

1. Slide 42: `curl -X OPTIONS` muse-studio → no CORS headers, and you can't edit it.
2. Show **`relay/route.ts`** next to **`naive-proxy/route.ts`** — one line different
   (slide 43). Say it: server file, not state management.
3. StageChip prompt (slide 44), flip `frontend/.env.local`:
   ```
   NEXT_PUBLIC_SCOUT_URL=
   NEXT_PUBLIC_USE_RELAY=1
   RELAY_TARGET=https://muse-studio-opal.vercel.app
   ```
   → `npm run dev` → the campaign ask.
4. ✅ **Protected Moment #2 — never cut**: router → fan-out → draft → judge ✗ red →
   redraft, live, on a page that never met this agent.
   (Terminal proof if wanted: `npm run ex 05 https://muse-studio-opal.vercel.app`.)

## Step 10 — the same flip, in production (2:53–3:00 · slides 46–48)

**No files — Vercel dashboard on muse-console.**

1. Edit the three env vars per the slide-46 table → Redeploy (~1 min — step 06 is why).
2. ✅ Phones out again: the deployed page drives last week's studio.
3. Flip back to scout (resting state), recount the six connections on the map
   (slide 48 = `viz/panel_done.png`), re-read slide 2, close on the two things to keep.

---

## If a student is stuck

`git checkout step-NN && npm install` — never debug one laptop live. Symptom table:
TROUBLESHOOTING.md. Curl prints nothing → pasted line wrapped inside the JSON →
use `sh clients/curl-wire.sh "question"` instead.

## Doc pointers

DECK.html (teach from) · HANDOUT.md (students follow) · STEPS.md (tag ↔ checkpoint map)
· README.md (run of show + prep) · VERIFIED-FACTS.md (evidence + measured numbers)
· SLIDES.md (slide ↔ capture map) · this file (what to open when).
