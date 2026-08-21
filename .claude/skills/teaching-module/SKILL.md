---
name: teaching-module
description: Design, outline, or build a workshop module (outline, deck, handout) for the AI Builder Program — or critique/revise one. Encodes the house method: outcome-first framing, the one idea + visual spine, engineered failure beats, Claude Code prompt boxes, ship-every-module, verified facts in owned voice. Trigger on "new module", "session outline", "build the deck", "revise module X", "does this teach well".
---

# What Makes a Good Module

A module teaches people to **build AI applications for themselves and their customers, with business processes in mind**. Every design decision is tested against one question: *does this make the student more able to ship something someone will pay for?* Tool trivia, defense taxonomies, and cost sermons fail that test. Capabilities, priced and applied, pass it.

## References — read the right file at the right stage

The rules below say what to do; `references/` shows what it looks like, calibrated on real
rejected-vs-approved material with the author's verdicts. Self-contained per stage:

| Stage | Read |
|---|---|
| Starting any session work | `references/pipeline.md` — the mandatory stage order, per-stage outputs, definition of done |
| Designing the exercise/capstone | `references/exercise-design.md` — the exercise IS the module: design the deliverable first, build it end-to-end, derive the deck from the run, sequence concepts by pipeline need |
| Writing/reviewing an outline | `references/outline-template.md` — the 10 sections with ✅/❌ excerpts per section |
| Drafting/reviewing slide *content* | `references/slide-patterns.md` — titles, framing, prompt boxes, voice: real rejections vs shipped |
| Laying out slides / rendering | `references/slide-layouts.md` — house Marp theme verbatim, 7 slide archetypes, image-height table, overflow don'ts, audit procedure |
| Planning screenshots (before the deck) | `references/capture-list.md` — the source→slide shot list, measured-numbers table, what to capture, staleness discipline |
| Producing visuals | `references/visual-recipes.md` — HTML→PNG harness + 6 card recipes with dos/don'ts |

Match the ✅ register everywhere; rewrite anything resembling a ❌ before the author sees it.

## 1. Frame by outcome, never by mechanism

- Open with **who it's for and what they can do after** — a client sentence ("I need X in my database every morning"), not a technology ("today: web scraping").
- Structure the module as **capabilities the student can sell**, each opened with a business use case and closed with a price/speed/reliability line ("Capability 1, priced").
- Mechanisms (libraries, flags, protocols) appear only as the means to a named capability. If a slide's subject is a tool rather than what the tool buys, rewrite it.
- The author's component list defines the module. When the author gives feedback like "focus on the application," the fix is reframing, not trimming.
- **A technology the author names in a spec IS the teaching point.** Never simplify it away in the name of "don't overbuild" — the simplicity budget goes to the scaffolding around the named pieces, never to them. Section-2 of Module 10 downgraded the draft route from a `ToolLoopAgent` to a flattened `generateText` for simplicity and was rejected: *"here you should call toolloopagent from vercel sdk with openai … as the goal is to wrap this agent and showcase how it can be kickstarted from ui too."* The named pattern ships exactly as named.
- **The author's commercial pricing never goes in teaching material** — not on slides, not in the "if you have a full day" list, not as context color. Real client names and real workflows are fine (S7 Muse, M10 Inspiration); the money is not. (*"dont include the pricing. this is a teaching module."* — the real proposal amount was cut from module-10-outline.md the day it appeared.)

## 2. The one idea + the visual spine

- Each module has exactly **one mental model** — a factory line, a wire, a 2×2, a ring, a decision table. If you can't state it in one sentence, you have two modules or none.
- Draw it as a **spine that returns at every divider with one station lit**. The whiteboard version is drawn once, exactly, and nothing more.
- End on a **one-slide decision table**: "your problem looks like X → use Y → you learned it in Part N." That table is the durable takeaway and the client-scoping conversation.

## 3. The teaching loop: map → deep-dive → tie back

Theory and practice are one loop, run at two scales:

- **Whole map first.** Slide 3–4 shows every concept at high level on the spine — the room sees the entire territory before any single station is taught. (M7: the full factory line before the first API call; M6: the three capabilities before the first selector.)
- **Per concept: concept slide → live build → ✅ checkpoint → failure at the moment of need.** Every abstract claim is immediately made concrete on the student's own screen — the concept slide states it, the build proves it, the checkpoint verifies it, and the failure beat shows why it matters. ("A selector is a description" → console count converges on 12 → "Everyone at 12?" → the Copy-selector trap.) A concept that never touches the student's keyboard within five minutes is a poster, not a lesson.
- **Capstone ties every concept back.** The exercise is the whole spine run end-to-end, and each of its steps must map to a station already built — nothing new is introduced there. Say the mapping out loud ("step 2 is Capability 2; you built it at 1:05"). (M7: the Muse one-pager walks every factory-line station; M6: "point it at your page" reuses selector → schema → session → deploy.)
- **The bookend closes the loop**: the deliverable shown unexplained at the open is re-read at the close, line by line, with the room naming the concept behind each line — the proof that theory became practice.

Rule of thumb when reviewing a draft: for every concept, point to its build, its checkpoint, and its line in the capstone. Any concept missing one of the three is either cut or gets one.

## 4. The bookend

- Slide 2 is the **finished deliverable, real and unexplained**: an actual log, transcript, or screenshot with a payoff line ("Nobody watched this run…"). Don't explain it — earn it.
- Close by re-reading it when the room can name every line. If possible, the close replays it against the students' own deployed artifacts.
- A **counted mystery** sharpens it ("four shapes fired between my thumb and that email") — and the count must survive its own recount.

## 5. Deck grammar (~30 slides)

- **Titles state what you do** — "Save it where links come from," "Measure it yourself" — never aphorisms or cleverness. An aphorism-titled slide is AI slop; the quotable lines live in speaker notes and the close.
- **One idea per slide.** No code beyond ~3 lines on a slide; full code lives in the HANDOUT.
- **Slides chain by gaps**: each part opens by naming what the previous part's output still can't do, phrased as the *next requirement* ("the object is typed — now the facts have to be real"), never as a failure story.
- **Concept slides carry the pair**: **Why it matters** (business — a line on the client quote, credibility in the meeting) and **Tradeoff** (technical — cost, latency, flexibility). Theory is always tied to a decision the student will make for a client.
- **Every visual is produced before the deck ships** — run the commands, take the screenshots, render the diagrams (HTML/CSS → Playwright PNG works well for terminal cards, comparisons, wireframes). Real data, formatted for slide legibility. A delivered deck contains zero `[screenshot: ...]` placeholders. Plan them as a **source → slide shot list written during the tested run** (`capture-list.md`), not as a finishing pass.
- **Copy-paste sufficiency: the slide is the student's console.** Everything they must type is on a slide, verbatim — prompt boxes as one selectable plain-text lump, a `Run it ·` command under each, the server-start command, the curl, the setup SQL (written so a double-paste is harmless), and the expected output beside the command so they self-check. Never make them reconstruct a command from prose or hunt in the handout mid-build. Details and examples: `slide-patterns.md` §4b.
- **Introduce before descending.** Three preview layers: an agenda whose third column is how the deliverable fails without each part, the whole map on one slide before any station, and a divider per part naming what the previous output still can't do (`slide-patterns.md` §2b).
- **File names and run order are curriculum** — self-evident sequence (`s1_…` → `s6_…`), later scripts import earlier ones, an inventory slide left up during build time, and names frozen before the capture pass (`slide-patterns.md` §4c).
- **Show the artifact, don't reference it.** If a slide's argument rests on code (the schema classes, the route function), that code is *on a slide* — a prompt box naming it is not enough. Key contracts get their own slide.
- **Connections are shown at code level, as visuals.** When two layers share a vocabulary (object ↔ template, request ↔ route), draw the actual mapping — field → slot with arrows — not a sentence asserting it. "How does that actually work" mechanisms get a numbered left-to-right step diagram (input → API param → typed output → where it's used downstream).
- **Protocol steps are shown as request AND response.** An endpoint slide is the route code; the next slide is the curl body and the JSON that comes back — and a note that the frontend sends the same call.
- **🤖 prompt boxes name their output**: `🤖 → \`models.py\`` plus one plain line on what that file does, then the prompt. The reader must know what the prompt produces before reading it. Full verbatim prompts also live in the HANDOUT.
- **Dividers are breathing beats** — spine with one station lit, plus the gap line.
- **✅ Checkpoints** are phrased as room-verifiable results ("three rows in your terminal", "click a source — it's real").
- **Notes carry the talk**: stage directions, timed call-outs, and every gotcha — see §6.
- Write content-only markdown first; theme/render (Marp) is a separate pass.
- **Overflow audit before delivery.** Export per-slide PNGs (`marp --images png --allow-local-files`) and eyeball every slide that pairs an image with text — clipped prompts and cut captions are the #1 render defect. Cap image heights (`![h:NNN]`) on any image sharing a slide with text; give tall portrait artifacts a slide of their own with at most a checkpoint line. Re-render immediately before auditing — a stale HTML/PNG set will "verify" fixes that aren't in it.

## 6. Your build archaeology is not their curriculum

The deck teaches the destination, never the route you took there. Author verdict: *"Don't
explain out loud what you fixed along the way. These slides are for me to teach the students
what they need to know. Not the mistakes I made along the way to get there."*

- **Test every build discovery with one question**: *does a student who never makes my
  mistake still need this?* Until the answer is yes, it drops a rung — **slide → speaker
  note → answer-only-if-asked → deleted** (the ladder, with examples, is in
  `slide-patterns.md` §3b).
- **The fix travels; the story doesn't.** What you debugged reappears as a silent precaution
  in their instructions — `print_background=True` inside the prompt box, SQL written
  `on conflict do nothing` — with no narration of how you learned it.
- **Sweep for residue when a beat is cut.** The cut isn't finished until the deck stops
  advertising it (Session 7's inventory row still bills a slide that no longer exists).
- **Student-facing slides show final results.** No error-narrative slides, no "here's what breaks," no bug lore, no "the trap in every tutorial." The deck sells the build.
- Failure beats are **live-room moments scripted in speaker notes**: when to let the room hit something, what to say, the real error text to have ready. The shared "oh no" happens on their screens at the facilitator's timing — not on a slide.
- **The one exception is a contrast that motivates a requirement** (ungrounded vs grounded output, guess vs look): show it as a designed side-by-side visual with real data, framed as "the difference X makes," ✓/✗ — the *with* column is the star.
- Frame any cost in **business terms** ("only one of these survives a meeting with their buyer"). Verified to reproduce before it's scripted; never staked on a third party behaving.

## 7. Build motion: student judgment + Claude Code plumbing

- Students hand-derive the **parts a model can't guess** — the selector tested in a console, the schema, the validation rule — then drive Claude Code with a **🤖 prompt box** to generate the script.
- Prompt boxes are verbatim-pasteable and encode the standards: state what correct looks like ("expect exactly 12"), state the failure posture ("raise, don't skip"), name env vars and require a `.env.example`, require honest exit codes for anything scheduled.
- For fast-moving library APIs, add the optional **context7 MCP** slide (`claude mcp add --transport http context7 https://mcp.context7.com/mcp`) — generated code fails most on stale API memory.
- After generation: **read the script together for 60 seconds**. The point is owning the output, not worshipping the generator.

## 8. Ship every module

- A module ends **deployed**, not demonstrated: repo → GitHub (`.gitignore` covering `.env` checked by eye) → platform (Railway/Vercel) → a checkpoint the student reads back from production (their own `runs` row, their URL on a phone).
- Dashboard sequences Claude Code can't drive get a **numbered step-by-step slide**, walked slowly on the projector (cron config, API enablement, key generation, folder sharing).
- **Secrets discipline on-slide**: values live only in platform variables; `.env.example` documents names, never values; keys are passwords.
- Deployed artifacts are **load-bearing for later modules** — state the dependency in both modules' docs, and protect the deploy step in the run of show ("never cut the deploy").

## 9. Standalone by default; continuity only when the author invokes it

**A module is a single self-contained session unless the author says otherwise.** No
callbacks to earlier sessions on slides or visuals — no "you built this in S6", no
curriculum-arc reveals, no program-close framing. Author verdict: *"dont try to rememebr
and connect to past sessions. think of it as a single session."* (Module 10's deck had
session tags on the pipeline strip and a "curriculum read backwards" slide; both were
removed.) Skills-inventory the audience either way: never use a concept before it's taught.

When the author **does** ask for a continuity arc, these are the mechanics:

- **Inherit decisions verbatim** (e.g. `jobs` = intent, `runs` = fact): decide once in one module, reuse unchanged in the next two, and say so.
- **Plant seeds that get harvested**: today's hand-rolled `if` checks make next module's Pydantic land as relief. Name deferrals explicitly ("deferred to M7 on purpose").
- Call back prior aphorisms when a concept recurs at greater depth; count the exposures ("the third schema you've bolted onto a system").

## 10. Facts: verified, then owned

- Every number and API claim is **verified against current docs or measured live** before it reaches a slide. Real measured numbers beat estimates ("155 seconds and $0.14" lands; "slow and pricey" doesn't).
- **Load-bearing APIs are verified at design time, before the plan is approved** — function names, options, client wiring, each checked against current official docs (context7 / the vendor's site) and cited in the plan. *"ensure that you're basing off everything on the doc of vercel ai, vercel ai sdk to ensure its all working properly."* The session-8b plan was rejected until `createAgentUIStreamResponse`, `ToolLoopAgent`/`isStepCount`, `DefaultChatTransport`, `runAgentTUI`, and `data-*` part rendering were each confirmed against ai-sdk.dev and cited.
- Teaching docs use the **author's voice**: facts stated flat, no `✅ CONFIRMED`/`⚠️ VERIFY` audit markers, no "as of" hedges. You are the curriculum's author, not its auditor.
- What can't be verified becomes a **facilitator prep line**: "measure it once during prep so the deck shows real numbers," "check plan limits before the day; it's the most likely way this workshop falls over."
- Keep the evidence trail (sources, dates) in a separate facilitator-side file (`VERIFIED-FACTS.md`), never in student-facing docs.

## 11. Run of show, protected and honest

- A **timed table** for the real duration. Live coding with a room of 15 runs ~3× solo speed — budget brutally and move overflow to an explicit "If you have a full day" section (never silently cut content; name what was dropped).
- Name **1–2 protected moments** to the minute (the phone buzz, the live view, the red test) and the **sacrifice rule**: what to cut when late, and what never.
- Every step needs a **catch-up path** (tagged `live/` repo — hand it over rather than debug one laptop) and a **dry-run path** (curl replays; the whole day reproducible without a phone, a third party, or venue luck).
- **Prerequisites go out 48h before** as one copy-paste preflight command plus a filled-in `.env` template. Check per-student isolation for shared services (accounts, sandbox numbers, concurrency caps) — it's the most likely way a workshop falls over. Have an announced fallback ("under two-thirds with working keys by 1:45 → projector demo").
- **Gotchas are pre-empted out loud at scheduled times**, before the room hits them, with real error text on the slide.

## 12. Aphorisms and the close

- 3–5 **quotable one-liners, each proven live** before it's spoken ("running twice must equal running once"). An aphorism that wasn't demonstrated is a poster, not a lesson.
- Close on **two or three things to keep**; declare everything else "recoverable in an afternoon." Then tease the next module as the relief of today's felt pain.

## 13. Doc set — division of labor

| Doc | Reader | Job |
|---|---|---|
| DECK | facilitator, live | sparse slides; notes are the script |
| HANDOUT | students, during | every step, full code, prompt boxes, checkpoints |
| GUIDE | students, after | chronological narrative — the follow-up send, never taught from |
| ANATOMY | students, building their own | generic parts catalogue + honest "what this stack does NOT give you" |
| README | facilitator, prep | run of show, preflight, gotcha schedule, dry-run recipe |
| TROUBLESHOOTING | facilitator, live | symptom → cause → fix |
| starter/ + live/ | students | scaffold (students wire, not paint) + finished-and-verified, tagged per part |
| exercises/ | students, during | numbered exercises folder — one per build station |
| SLIDES.md | facilitator, prep | per-slide content map: slide → content → source file/exercise → capture, written during the tested run |

## 14. Register: write like the author talks — in every doc

One principle, three strikes of feedback behind it: everything the author reads — slides,
outlines, diagrams, labels, planning docs — is written in their spoken register, like
explaining to a friend. *"you are using too many complex terms and words. keep it closer my
tone of voice, and as if i was speaking to a friend."*

- **Plain words first; a metaphor decorates once, after the plain statement — it never
  becomes the running vocabulary.** Name the real thing in ordinary words ("we wrap the
  agent with an API endpoint so we can hit it on its production URL"), remind the
  fundamentals as you go. Session 8b's deck titled nearly every slide in untranslated
  metaphor ("Give it a socket", "Re-patch the cable") and the plain sequence — agent →
  endpoint → deploy → call it → stream results — never appeared on any slide. Rejected:
  *"the slides are impossible to read right now… they don't seem to be drafted by a human."*
  (Details: `slide-patterns.md` §1b.)
- **Slop is also straining for a punchline.** No clever title, reversal, or
  fragment-for-effect on every slide; one quotable line per deck section at most — the
  bookend line is enough. Slides carry facts; the author does the voice-over. Third-strike
  verdict on Module 10: *"its good overall the content, but phrasing still ai slop. hard to
  read. why is it so hard."* (Details: `slide-patterns.md` §1.)
- **The rule covers outlines and planning docs, not just slides.** No shorthand chains
  ("FRESH/GUARD? → ENVIRONMENT?"), no invented vocabulary ("interrogation grid") in
  anything the author reads. Questions are written as actual questions ("How fresh does it
  need to be — and what happens when it fails?"). House method terms (bookend, spine,
  capstone) stay inside this skill; deliverables describe the thing in ordinary words.
  (Details: `outline-template.md`, register note.)

## 15. Where this skill's rules come from

`curriculum/FEEDBACK.md` is the inbox for the author's craft feedback; this skill is the
system of record. A `UserPromptSubmit` hook flags corrective-sounding prompts so feedback
gets logged when it's given rather than reconstructed later; `/fold-feedback` moves pending
entries in here, with their evidence, and marks them folded.

Consequences for how you work:
- **Feedback is a reframing instruction, not a line edit.** Fix the frame everywhere it
  applies, then log it so the next module starts from the corrected frame.
- **Rules keep their examples.** Every rule above is safer to follow when the ❌/✅ pair
  travels with it — that's what the `references/` files are for. Don't strip an example to
  make a section shorter.
- **The log is the audit trail.** Folded entries stay in `FEEDBACK.md` — it's how a future
  draft can tell an author's hard-won rule from a plausible-sounding invention.

## The refinement loop (how a module reaches final)

The skill's job is not just to draft — it's to **drive the module to the author's final
version by asking the right questions at the right stage**. At every stage, present the
draft plus a short, targeted question list (≤7, each with a recommended default so
"defaults fine" is a complete answer). Never advance a stage without the author's reaction.

- **Stage 0 (before outlining):** worked-example subject · scope boundaries vs neighboring
  modules · final artifact form · deploy now vs deferred · provider/tooling choices ·
  budget per student · duration/room · credentials and lead-time items. Ask only what the
  brief doesn't answer.
- **Outline review:** ask about emphasis and ordering, not wording — "is X the core or a
  sidebar?", "does the capstone match the business process you sell?"
- **Deck review:** deliver the rendered HTML, not the markdown. Expect reframing feedback;
  when it comes, fix the frame everywhere it applies (and fold the lesson into this skill's
  references), not just the quoted slide.
- **Interpretation flags:** whenever you interpret an ambiguous instruction (renumbering
  modules, merging notes, choosing an architecture), state the interpretation explicitly
  and make it easy to veto.
- A module is **final** only when the author says so — treat every deliverable before that
  as a draft awaiting its round of feedback.

## Working process (how we iterate)

1. **Outline first** (one idea, components-and-why, bookend, part-by-part, run of show, capstone, prereqs, gotchas, aphorisms, doc plan) → author reacts to structure before any slide exists.
2. **Verify the load-bearing claims** (docs, live measurement) before drafting slides; record evidence facilitator-side.
3. **Deck as content-only markdown**, then a separate styling/render pass (Marp).
4. Treat author feedback as **reframing instructions**, not line edits — if they push back on emphasis, the module's frame is wrong, not its sentences.
5. Sweep for **cross-module consistency** after any revision: inherited artifacts, provider/key handoffs, callbacks, stale references.
