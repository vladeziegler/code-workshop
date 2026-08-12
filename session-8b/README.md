# Session 8b — The Plug · facilitator README

One service, every surface: a 15-line web-search agent becomes a deployed
socket; four clients plug into it; the last one is a real product page that
finishes the day driving Session 8's five-tool studio — via one env flip.

- Outline: `curriculum/module-08b-outline.md` · Slide map: `SLIDES.md` · Deck: `DECK.md` / `DECK.html`
- Student doc: `HANDOUT.md` · Ladder map: `STEPS.md` · Evidence: `VERIFIED-FACTS.md`, `CAPTURES.md`
- Live URLs (facilitator reference build): scout `muse-scout-vladimirdeziegler-gmailcoms-projects.vercel.app`, console `muse-console-…vercel.app`

## Run of show (3h, room of ~15)

| Time | Step | Mode | Watch for |
|---|---|---|---|
| 0:00–0:08 | Bookend + six-cable mystery | demo | don't explain slide 2 |
| 0:08–0:15 | Patch panel, whiteboard | talk | draw exactly the panel |
| 0:15–0:32 | 01 agent + local TUI | typed + 🤖 | Protected Moment #1 setup: unscripted tool card |
| 0:32–0:48 | 02 socket + deploy | typed 3-liner | gotcha #1 at 0:34 (root 404 is correct) |
| 0:48–1:02 | 03 curl the raw wire | typed curl | **beat ① 302** ~0:52 · raw bytes ~0:58 · remote TUI = optional handout only |
| 1:02–1:12 | 04 logs | projector demo | live-tail one student's request |
| 1:12–1:48 | 05 frontend | 🤖 wiring + typed CORS fix | **beat ② three acts** 1:25–1:40 · streaming lands ~1:45 |
| 1:48–1:56 | break | | pre-empt gotchas #6/#7 before it ends |
| 1:56–2:10 | 06 deploy console | config | **beat ③ env inline** ~2:03 |
| 2:10–2:28 | 07 memory | typed load/save + 🤖 store | two-plugs-one-memory ~2:25 |
| 2:28–2:42 | 08 jobs + ticket | typed after() split | demo-heavy; collapses first if late |
| 2:42–2:53 | 09 re-patch | 🤖 StageChip + env flip | **Protected Moment #2 ~2:50 — never cut** |
| 2:53–3:00 | 10 ship + close | push, phone | recount the six cables; re-read slide 2 |

**Sacrifice rule:** late → step 08 becomes a facilitator demo, step 04 shrinks
to 4 min. Never cut step 05 act 3 or step 09. **Catch-up:** hand a stuck
student `git checkout step-NN && npm install` — don't debug one laptop live.

## Preflight (send 48h before)

```sh
node --version && git --version && npx vercel whoami && \
gh auth status 2>&1 | head -2 && \
curl -s "$SUPABASE_URL/rest/v1/" -H "apikey: $SUPABASE_SERVICE_KEY" -o /dev/null -w "%{http_code}\n"
```

Plus a filled `.env` template (names: `OPENAI_API_KEY`, `SUPABASE_URL`,
`SUPABASE_SERVICE_KEY`). Each student needs: Vercel account with GitHub
connected, OpenAI key with credit (web-search calls billed per search), Node 20+.

## Facilitator prep (the morning-of list)

1. **Redeploy muse-studio from the `session-8-product/live` working tree, unchanged**
   (`vercel deploy --prod` from that directory). Careful: the stage-writer code is
   UNCOMMITTED there — git HEAD does not emit `data-stage` parts, the working tree
   does. Verify after: `npm run ex 05 <muse-url>` from 8b's backend must dump
   `data-stage` lines. (Done 2026-08-12 → `muse-studio-opal.vercel.app`, full rail
   incl. judge rejections confirmed from prod.)
2. Deployment Protection **off** on muse-studio; **on** for your demo scout if
   you want beat ① reproduced on the projector (new student projects have it
   on by default — that's the beat).
3. Measure once, fresh: one scout message cost + one deep-dive cost (numbers
   go on slides 14/29 if they drift from VERIFIED-FACTS.md).
4. Rehearse the six-cable recount. It must survive itself: 4 plugs × scout +
   console × {scout, muse} = 6.

## Dry-run path (no students, no luck required)

Every checkpoint has a curl equivalent — `STEPS.md` table maps them. The whole
day replays against the two facilitator URLs: `sh clients/curl-wire.sh`,
`npm run ex 02|03|04|05`, and the Playwright drivers in `captures/*.py`.

## Which document when

| Moment | Doc |
|---|---|
| Teaching, live | DECK.html (notes = the script) |
| Student, during | HANDOUT.md |
| Student, stuck | TROUBLESHOOTING.md · `git checkout step-NN` |
| You, prepping | this file + VERIFIED-FACTS.md |
| Author, reviewing | SLIDES.md + curriculum outline |
