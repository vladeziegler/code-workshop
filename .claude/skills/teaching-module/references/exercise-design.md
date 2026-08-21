# Exercise Design — the exercise IS the module

Session 7 is the reference case: the deck was not written and then given an exercise. The
exercise (Muse × prospect one-pager) was designed first, **built and run end-to-end before
any slide existed**, and everything else — part order, slide evidence, prompt boxes, the
capstone — derived from it.

## 1. Design the exercise before the content

Start from the deliverable someone would pay for (the author's business frame gives it):
*"type a prospect's name → researched, on-brand, printable one-pager."* Then decompose it
into the pipeline of stations required to produce it. **The stations become the parts; the
pipeline's dependency order becomes the deck's teaching order.** You never have to invent
a curriculum — the exercise dictates it.

Requirements for a good exercise:

- **Parameterized by exactly ONE student choice** (their prospect, their page, their
  process). One input varies; all code stays fixed — that's what makes "the capstone
  introduces nothing new" achievable.
- **Produces an artifact they keep and can show** (a PDF at a public URL, a deployed
  service, a live feed) — not console output.
- **Carries a judgment question** for the share-around (*"would this survive a meeting
  with their buyer?"*) — the seed of later evals.
- **Maps to the business process the client actually runs** (Muse's BD outreach) — the
  exercise is a rehearsal of paid work, not a toy.
- **Any frontend is a real product UI, not a wireframe.** Shippable-product bar:
  conversation-history sidebar, styled streaming chat, tool state chips, job ticket cards
  with real ids, empty states, one deliberate theme. Its slide screenshots must look
  enticing on a projector. A bare input + text-dump page with "the topology is the lesson"
  was rejected on the session-8b plan: *"ensure the ui is looking good and more enticing…
  should be a proper frontend connecting to backend, with good memory of conversations."*

## 2. Build it end-to-end before any slides

`session-N/live/` — every station executed against live services, in pipeline order. This
run IS the deck's evidence factory:

- the measured numbers (86.1s, ~20¢, 12¢/research, 4¢/image) → cost slides
- the captured outputs (the terminal rows, the one-pager, the form states) → screenshots
- the real error bodies → speaker-note gotchas
- the working scripts → the 🤖 prompt boxes (a prompt box must reproduce a script that
  exists and passed)
- the surprises → design corrections *before* they're taught (the one-call-vs-two-call
  research test changed the architecture AND simplified the deck)

If a station can't be run, the module isn't ready to outline past it.

## 3. Prove it generalizes — the capstone's insurance

Run **at least two more subjects through the unchanged code** (Session 7: Reformation
shared build → Sézane, Aritzia, Glossier). This buys three things:

- the **"nothing changed but the input"** slide — the capstone's pitch, as evidence
- confidence that arbitrary student choices will work on the day
- a feel for where thin inputs produce thin outputs → the **known-good shortlist** for
  students who pick badly (and the honest line: "thin research in, thin USP out — that's
  the tool telling the truth")

## 4. Introduce the right thing at the right time

The sequencing rule, derived from the pipeline:

- **A concept enters the deck at the moment the exercise's pipeline first needs it — and
  not one slide earlier.** Structured output appears when prose can't feed the template;
  research appears when the typed object turns out to be fiction; the image model appears
  when the brief field exists and needs executing. The gap chain between parts IS the
  pipeline's dependency order.
- **If the exercise doesn't need it, it's not in the 3 hours.** It goes to "If you have a
  full day" by name. (This is the test that kills tool tours.)
- **Seeds are planted only where a later module harvests them** (the `sources` field feeds
  M10's evals; the Dockerfile "travels quietly" until M8's preflight) — and the harvesting
  module is named in both doc sets.

## 5. Safety rails for the live room

- **Dry-run path**: cached inputs in `starter/` (the research JSON, a saved HTML page) so
  every station replays offline if wifi or a third party fails.
- **Cost stated before the capstone** ("the endpoint spends ~20¢ per submit — it's your key").
- **Facilitator prep**: dry-run the shared worked example 5× (variance check), capture one
  backup output for every live moment, keep the known-good subject shortlist ready.
- **Worked-example selection criteria**: distinctive public identity, rich web presence,
  visually strong output, recognizable to the room. Dry-run before committing — the
  bookend artifact must look expensive.

## The one-line version

**Design the deliverable → decompose it into stations → build and run every station →
teach the stations in pipeline order with the run's evidence → capstone = same pipeline,
student's input.** A module built any other way ends up teaching tools instead of outcomes.
