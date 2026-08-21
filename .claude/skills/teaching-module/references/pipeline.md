# The Production Pipeline — outline to delivered deck

The order is not optional. Every stage's output is the next stage's input, and skipping one
produced every bad deliverable we've shipped. Session 7 (2026-07-28) is the reference run.

## Stage 0 — Get the decisions from the author

Ask before designing (one short list, offer defaults so "defaults fine" is a valid answer):
worked-example subject (the shared build target — needs a distinctive public identity),
scope boundaries vs neighboring modules, final artifact form, deploy-now vs deploy-later,
provider/tooling choices, budget per student, duration/room size, prerequisite accounts
with lead time. **The author's component list defines the module** — everything else is
framing you propose and they react to. A technology the author names is itself the teaching
point: simplify around it, never away from it (SKILL.md §1 has the ToolLoopAgent rejection).

## Stage 0.5 — Infrastructure readiness

Before outlining a module with deploy or third-party dependencies, verify the ground truth:

- **CLIs and credentials checked, not assumed**: `railway whoami`, `vercel whoami`, key
  presence in the canonical `.env` (names and lengths only — never print values).
  Interactive logins (OAuth device flows) are author actions — ask for them via a
  `! <command>` in-session, then verify.
- **Cross-module exports are deployed and proven, not stated.** If module N's preflight
  assumes a service from module N−1 exists, deploy it and run one real end-to-end request
  against the public URL — verifying the side effects (bucket object fetches 200, table row
  written) — before module N's outline is considered grounded. Students replicate a proven
  deploy; they never pioneer one.
- **Secrets discipline while building**: set platform variables by subprocess reading the
  `.env` (values never in command strings or output); redact tokens/URLs in anything logged.
- **Pin across layers**: the deploy image's library versions match the locally tested venv
  (e.g. Playwright base image tag = the installed `playwright` version) — "works locally"
  only transfers when the versions do.

## Stage 1 — Design the exercise, then outline

**The exercise comes first and the outline derives from it** (`exercise-design.md`): take
the author's deliverable, decompose it into the pipeline of stations that produce it — the
stations become the parts, the pipeline's dependency order becomes the teaching order, and
a concept that the exercise doesn't need goes to the full-day section. Then write the full
outline per `outline-template.md`. The author reacts to structure before any slide exists;
feedback here is cheap, the same feedback after a deck exists costs a rewrite. Treat
pushback as reframing instructions (the frame is wrong, not the sentences).

**Design-time doc grounding.** Every load-bearing API in the plan — function names,
options, client wiring — is verified against current official docs (context7 / the
vendor's site) *before the plan is approved*, and the plan records what was verified
where. The session-8b plan was rejected until `createAgentUIStreamResponse`,
`ToolLoopAgent`/`isStepCount`, `DefaultChatTransport`, `runAgentTUI`, and `data-*` part
rendering were each confirmed against ai-sdk.dev and cited. A plan is not approvable on
remembered APIs.

## Stage 2 — Verify, then TEST FOR REAL

Two different activities, both mandatory:

- **Verify claims** against current docs (agents with web access; record evidence in the
  facilitator-side `VERIFIED-FACTS.md` with sources and dates — never in student docs).
- **Build and run the actual code** (`session-N/live/`). Every station executes against live
  APIs before it's taught. This is where you get the things no doc gives you: real error
  bodies, real seconds, real cents, real outputs — and design corrections (Session 7's
  one-call-vs-two-call research question was settled by a head-to-head test, not opinion).

If a station can't be tested (missing creds, missing infra), it's a named blocker for the
author — not a slide written on hope.

**The E2E hard rule** (*"important for you to test out each script, deployment, commands
running end to end"*): every slide-bound command runs **verbatim, in step order, against
the real deploy** — not equivalents, not out of sequence. Failure beats are reproduced
deliberately, not remembered. Catch-up tags are tested cold (fresh checkout of the tag,
does it run?). Terminal transcripts are recorded into the capture list as they happen —
they become the expected-output blocks on slides.

## Stage 3 — Captures

Write the capture list **while the tested run is still on screen** — full method and
discipline in `capture-list.md`. In short:

- A numbered **source → slide** shot list, so nothing is captured speculatively and nothing
  is missing at deck time.
- **Real browser/artifact screenshots** via Playwright (`device_scale_factor=2`), including
  the *mid-flight* state of anything slow and the *input* the model sees, not only its output.
- **Cropped vendor docs** beside the station they explain — they prove the mechanism is a
  first-class feature and let the notes name the durable vs perishable part.
- **Designed cards** for anything textual (terminal outputs, comparisons, diagrams) via the
  HTML→PNG recipes in `visual-recipes.md` — real data, slide-legible formatting.
- A **measured-numbers table** (cost/time per station + total) — these numbers go on slides,
  each with a business sentence attached.

**Freeze file names before capturing.** Renaming afterwards puts terminal screenshots in
contradiction with the slides.

## Stage 4 — Deck

Content-only markdown. Per-slide content rules: `slide-patterns.md`. Layout archetypes and
sizing: `slide-layouts.md`. Prompt boxes are **derived from the tested code** — a student
pasting one gets the script you actually ran. Speaker notes carry gotchas, stage directions,
and the failure moments (never slides).

Two deliverables ship alongside the deck, both written during the tested run:
- **`SLIDES.md`** — the per-slide content map: slide → content → source file/exercise →
  capture. It's how the deck stays traceable to the run that proved it.
- **`exercises/`** — a numbered exercises folder, one per build station, with the content
  suggested for each slide.

## Stage 5 — Render and audit

```bash
marp DECK.md -o DECK.html                       # the deliverable
marp DECK.md --images png --allow-local-files -o audit/S.png   # one PNG per slide
```

Eyeball every slide that pairs an image with text — clipped prompt boxes and cut captions
are the #1 defect. Fix with `![h:NNN]` caps (table in `slide-layouts.md`), re-render,
re-audit. **Always re-render immediately before auditing** — a stale HTML/PNG set will
"verify" fixes that aren't in it (this trap is real; we hit it).

## Stage 6 — Cross-module sweep

After any revision: inherited artifacts still exist where claimed; provider/key handoffs
line up; callbacks reference things actually taught; deferred items are owned by a named
module's preflight; no stale model names or renamed files.

**Residue sweep**, same pass: every beat that got cut is cut *everywhere* — grep the deck,
handout and inventory table for the name of the thing you removed. And the pre-deck planning
file (`CAPTURES.md`) is re-checked against what shipped: any claim the build disproved gets
corrected or the file gets retired, or it re-infects the handout later.

## Definition of done

- [ ] Every number on a slide was measured on a run you executed
- [ ] Every error message quoted is a captured body, not a paraphrase
- [ ] Zero `[screenshot: ...]` placeholders; every visual produced and embedded
- [ ] Every 🤖 prompt reproduces a script that exists and passed in `live/`
- [ ] No audit markers (✅ CONFIRMED / ⚠️ VERIFY) in any student-facing doc
- [ ] No error-narrative slides; failure material lives in speaker notes
- [ ] No build archaeology anywhere on a slide — every discovery passed the "would a student
      who never made my mistake need this?" test, and cut beats left no residue
- [ ] Every command a student types is on a slide verbatim: prompt box (plain-text fence),
      `Run it ·` line, server start, curl, setup SQL — with expected output beside it
- [ ] The planning file's claims still match what shipped
- [ ] Per-slide PNG audit done on the current render; nothing clipped
- [ ] Run of show timed; protected moments named; sacrifice rule stated
- [ ] The capstone introduces nothing new — every step maps to a built station
- [ ] Every cross-module export this module depends on is deployed and proven with one
      real cloud run (side effects verified), and recorded in VERIFIED-FACTS
- [ ] A deploy counts as verified only when a real request succeeded against the public
      URL — a green build is not proof
- [ ] Every load-bearing API in the plan was verified against current official docs and
      cited before the plan was approved
- [ ] Every slide-bound command was executed verbatim, in step order, against the real
      deploy; catch-up tags tested cold
- [ ] `SLIDES.md` (per-slide content map) and the numbered `exercises/` folder shipped,
      written during the tested run
- [ ] Any student-facing frontend meets the product bar (`exercise-design.md` §1) — its
      slide screenshots look enticing on a projector
