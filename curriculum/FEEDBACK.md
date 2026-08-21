# Feedback Log — AI Builder Program

Durable craft feedback from the author, captured as it is given. This file is the **inbox**;
`.claude/skills/teaching-module/` is the **system of record**. Run `/fold-feedback` to move
entries from here into the skill.

**What belongs here:** feedback that changes how modules get built next time — framing,
slide content, structure, wording, delivery, workflow.
**What doesn't:** one-off task instructions ("use the HTML not the MD"), scope decisions for
a single module, or anything already stated in the skill.

Each entry is dated, states the DO and/or the DON'T, records **why** in the author's terms,
and — once folded — names the skill file it landed in.

Status values: `pending` (not yet in the skill) · `folded → <file> §<n>` · `dropped (reason)`

---

## 2026-08-05 — Session 7 retrospective

### F-001 · Don't teach the road you took to get there
**Status:** folded → SKILL.md §6 · slide-patterns.md §3b · pipeline.md (Stage 6, done-list)
**DON'T** put your own build-time discoveries on slides — the API quirk you hit, the
parameter that turned out to be removed, the error you debugged at 2am.
**DO** demote them: slide → speaker note → answer-only-if-asked → delete. Ask *"does a
student who never makes my mistake still need this?"*
**DO** let the fix reappear as a silent precaution in their instructions — the prompt box
says `print_background=True`, and nobody hears the story about Chromium stripping colors.
**Why (author):** *"These slides are for me to teach the students what they need to know.
Not the mistakes I made along the way to get there."*
**Evidence:** `session-7/CAPTURES.md:21,23` planned two "failure beat" slides (the
temperature 400, the open-dict 400). Neither shipped. `session-7/DECK.md:190` is where the
first one ended up — a note that explicitly refuses the slide.
**Residue rule that follows:** when a beat is cut, grep the deck for its leftovers.
`DECK.md:832` still bills `s1_models.py` as "the temperature 400" in the inventory table.

### F-002 · Captures are planned before the deck, from a real run
**Status:** folded → references/capture-list.md · SKILL.md §5 · pipeline.md Stage 3
**DO** write a numbered **source → slide** shot list while the run is still on screen, plus
a measured-numbers table headed "put these on slides, not estimates."
**DO** capture in-progress states, not just final ones (form mid-generation *and* done).
**DO** show the artifact the model *sees* (the homepage screenshot), not only what it returns.
**Why (author):** taking screenshots and adding them to support the slides is part of the
build, not a finishing pass — a deck with a placeholder has no argument.
**Evidence:** `session-7/CAPTURES.md:18-31`; every `images/*.png` in the deck traces to it.

### F-003 · Introduce the content before you descend into it
**Status:** folded → slide-patterns.md §2, §2b · SKILL.md §5
**DO** run three layers of preview: (1) an agenda where each row names how the deliverable
*fails* without that part; (2) the whole map on one slide before any single station; (3) a
divider per part whose italic line states what the previous output still can't do.
**DON'T** open a part on its mechanism ("today: Pydantic").
**Why (author):** the agenda has to be clear — the room should always know which failure it
is currently fixing.
**Evidence:** `DECK.md:67` (agenda-as-consequences), `:87` (the factory line), `:200` (the
gap sentence: *"a template can't read a paragraph"*).

### F-004 · Every keystroke the student needs is on a slide, copy-pasteable
**Status:** folded → slide-patterns.md §4, §4b · SKILL.md §5 · pipeline.md (done-list)
**DO** format 🤖 prompt boxes as one selectable lump of plain text — a ` ```text ` fence, no
inline backticks or bold inside — so a drag-select pastes clean into Claude Code.
**DO** follow every prompt box with its run command (`**Run it** · python s4_vision.py`), and
state the order when order matters.
**DO** put the server start command, the curl, and the SQL on slides verbatim, with
"Leave this running" where that matters.
**DO** print the expected output beside the command so students self-check.
**DON'T** make them reconstruct a command from prose or hunt in the handout mid-build.
**Why (author):** the prompts to copy and the commands to kickstart the server have to be
available, on the slide, at the moment they're needed.
**Evidence:** `DECK.md:14` (the CSS comment stating the intent), 8 × `**Run it**` lines,
`:750` (uvicorn + curl), `:550` (the idempotent SQL), `:617` (expected five-station output).

### F-005 · File names and run order are curriculum
**Status:** folded → slide-patterns.md §4c · capture-list.md · SKILL.md §5
**DO** name build files so the sequence is self-evident (`s1_…` → `s6_…`), have later
scripts import earlier ones, and end the build with an inventory slide left up on screen.
**DO** diagnose a stuck student by asking which **file** they're missing, not which concept.
**DON'T** rename after captures are taken — the screenshots will contradict the slides.
**Evidence:** `DECK.md:828-846`; `CAPTURES.md` still uses the pre-rename names
(`models.py`, `s2_generate.py`, `store.py`), which is the drift this rule prevents.

### F-006 · Planning docs go stale and must not outlive their claims
**Status:** folded → capture-list.md · pipeline.md Stage 6
**DO** re-check the pre-deck planning file after the deck ships: claims it made that the
build disproved have to be corrected or the file retired.
**Evidence:** `CAPTURES.md:42` still says *"Never combine search and parse in one call: the
citations come back empty"* — the shipped deck teaches the opposite (`DECK.md:352`, `app.py`
fuses them). `CAPTURES.md:59` still lists a resolved item as open.

## 2026-08-05 — Session 8b planning review

### F-007 · Ground every SDK/API claim in current official docs before finalizing a design
**Status:** folded → pipeline.md Stage 1 (design-time doc grounding) · SKILL.md §10 · pipeline.md done-list
**DO** verify each load-bearing API (function names, options, client wiring) against the
current official docs (context7 / ai-sdk.dev) at design time, and record what was verified
where — before the plan is approved, not during the build.
**Why (author):** *"ensure that you're basing off everything on the doc of vercel ai,
vercel ai sdk to ensure its all working properly."*
**Evidence:** session-8b plan review — plan was rejected until `createAgentUIStreamResponse`,
`ToolLoopAgent`/`isStepCount`, `DefaultChatTransport`, `runAgentTUI` (agent vs transport
modes), and `data-*` part rendering were each confirmed against ai-sdk.dev and cited in the
plan.

### F-008 · The demo frontend must be a real product UI, not a wireframe
**Status:** folded → exercise-design.md §1 (product-UI bar) · pipeline.md done-list
**DO** build workshop frontends to a shippable-product bar: conversation-history sidebar,
styled streaming chat, tool state chips, job ticket cards with real ids, empty states, one
deliberate theme. Slide screenshots must look enticing on a projector.
**DON'T** ship a bare input + text-dump page and call the topology the lesson.
**Why (author):** *"ensure the ui is looking good and more enticing… should be a proper
frontend connecting to backend, with good memory of conversations."*
**Evidence:** session-8b plan review — plan rejected until the frontend spec included
sidebar/history, ToolChip states, JobStatus ticket card, StageChip rail, composer states.

### F-010 · Speak plainly first; metaphors decorate, they never replace the explanation
**Status:** folded → slide-patterns.md §1b · SKILL.md §14
**DON'T** build slides on an untranslated metaphor vocabulary ("socket", "plug",
"cable") or aphorism fragments — the reader has to decode poetry to find out what
they're building.
**DO** write like explaining to a friend: name the real thing in ordinary words
first ("we wrap the agent with an API endpoint so we can hit it on its production
URL, then we need a way to fetch results — final or streaming"), remind the
fundamentals as you go, and use an analogy as a one-time illustration *after* the
plain statement, never as the running vocabulary.
**Why (author):** *"don't use words like 'socket' before explaining them…
should be like speaking to a friend. conversational about how things work…
reminding fundamentals… the slides are impossible to read right now… they
don't seem to be drafted by a human."*
**Evidence:** session-8b DECK.md pre-rewrite — nearly every title was
metaphor-first ("Give it a socket", "The plug, in bytes", "Re-patch the cable");
the plain sequence (agent → endpoint → deploy → call it → stream results) never
appeared on any slide.

## 2026-08-17 — Module 10 outline review

### F-011 · Plain speech applies to every doc the author reads — outlines, diagrams, labels
**Status:** folded → outline-template.md (register note) · SKILL.md §14
**DON'T** compress concepts into shorthand labels ("FRESH/GUARD? → ENVIRONMENT?") or dress
the method in invented vocabulary ("interrogation grid", "agenda-as-consequences") in
outlines and planning docs. F-010 was about slides; this is the same rule for everything.
**DO** write the questions as actual questions in the author's spoken register ("How fresh
does it need to be — and what happens when it fails?"). House method terms (bookend, spine,
capstone) stay inside the skill; deliverables describe the thing in ordinary words.
**Why (author):** *"you are using too many complex terms and words. keep it closer my tone
of voice, and as if i was speaking to a friend. wtf does that mean. 'FRESH/GUARD? →
ENVIRONMENT'"*
**Evidence:** module-10-outline.md first draft (2026-08-17) — spine drawn as an
abbreviation chain; rewritten same day in plain questions.

### F-015 · A technology the author names in a spec IS the teaching point
**Status:** folded → SKILL.md §1 · pipeline.md Stage 0
**DON'T** simplify away a named technology in the name of "don't overbuild" — the
simplicity instruction applies to everything *around* the named pieces, not to them.
**DO** keep every named tool/pattern in the build exactly as named (Vercel AI SDK agent
kicked off from the UI = ToolLoopAgent behind a route, not a flattened generateText), and
spend the simplicity budget on scaffolding, not on the lesson.
**Why (author):** plan-review rejection (2026-08-17): *"here you should call toolloopagent
from vercel sdk with openai … as the goal is to wrap this agent and showcase how it can be
kickstarted from ui too."*
**Evidence:** section-2 build plan draft had downgraded the draft route to generateText
for simplicity; corrected before approval.

### F-013 · Slop isn't only metaphors — it's straining for a punchline on every slide
**Status:** folded → slide-patterns.md §1 (punchline budget) · SKILL.md §14
**DON'T** give every slide a clever title ("Four doors, nothing behind them"), a reversal
("The score proposes… constraints decide"), a fragment-for-effect ("One call. A dozen
workflows."), or a closing zinger. One quotable line per deck section at most; the bookend
line is enough.
**DO** title slides with the plain thing ("Question 1 — where does the data come from?",
"Run it", "What to keep") and write body text as the author would say it out loud. The
author does the voice-over; slides carry facts, not performance.
**Why (author):** *"its good overall the content, but phrasing still ai slop. hard to
read. why is it so hard."* — third strike after F-010/F-011; the register rule applies to
titles and punchlines, not just vocabulary.
**Evidence:** module-10 DECK.md first render (2026-08-17) — rewritten same day.

### F-014 · A module is standalone unless the author says otherwise
**Status:** folded → SKILL.md §9 (rewritten: standalone by default)
**DON'T** build callbacks to earlier sessions into slides or visuals (no "you built this
in S6", no curriculum-arc reveals, no program-close framing) unless the author asks for
continuity.
**DO** treat each module as a single self-contained session; the continuity-arc rule in
the skill applies only when the author invokes it.
**Why (author):** *"dont try to rememebr and connect to past sessions. think of it as a
single session."*
**Evidence:** module-10 deck had session tags on the pipeline strip and a
"curriculum read backwards" slide — removed 2026-08-17.

### F-012 · The author's commercial pricing never goes in teaching material
**Status:** folded → SKILL.md §1 · outline-template.md (full-day list)
**DON'T** put the author's real engagement pricing (proposal amounts, rate structures) in
any module doc — not on slides, not in the full-day list, not as context color. Real client
names and real workflows are fine (S7 Muse, M10 Inspiration); the money is not.
**Why (author):** *"dont include the pricing. this is a teaching module."*
**Evidence:** module-10-outline.md (2026-08-17) had the real proposal amount in the
"if you have a full day" list — removed same day.

### F-009 · Test every script, deployment, and command end-to-end; ship exercises + a per-slide content map
**Status:** folded → pipeline.md Stage 2 (E2E hard rule) + Stage 4 (SLIDES.md, exercises/) + done-list · capture-list.md · SKILL.md §13
**DO** execute every slide-bound command verbatim in step order against real deploys,
reproduce every failure beat deliberately, test catch-up tags cold, and record transcripts
into the capture list as they happen.
**DO** ship a numbered exercises folder and a SLIDES.md content map (slide → content →
source file/exercise → capture) written during the tested run.
**Why (author):** *"important for you to test out each script, deployment, commands running
end to end. and create folder with exercises and content suggested for each slide."*
**Evidence:** session-8b plan review — approval came only after the E2E hard rule and the
exercises/SLIDES.md deliverables were added.
