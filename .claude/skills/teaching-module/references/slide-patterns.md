# Slide Patterns — calibrated on real rejections and approvals

Every pair below is verbatim from the Module 6/7 iterations (2026-07). The ❌ versions were
drafted and rejected by the author; the ✅ versions shipped. When drafting, match the ✅
column's register. When reviewing, anything resembling a ❌ gets rewritten before the author
sees it.

---

## 1. Titles: practical beats clever

❌ **Rejected** (author verdict: *"pure AI slop"*):
> # "Respond in JSON" is a wish. A schema is a contract.

❌ **Rejected**:
> # The moment this session is about

✅ **Shipped**:
> # Describe the page as classes
> # Save it where links come from
> # Measure it yourself — don't take the table's word

The title says what you *do* or what you *see*. The quotable line, if it earns its place,
goes in the speaker notes or the closing "things to keep."

**Slop is not only metaphor — it's straining for a punchline on every slide.** Module 10's
first render did it four ways and was rejected whole (*"its good overall the content, but
phrasing still ai slop. hard to read. why is it so hard."*):

❌ **Rejected shapes** (module-10 DECK.md, first render):
> # Four doors, nothing behind them            ← clever title
> The score proposes… constraints decide.       ← reversal
> One call. A dozen workflows.                  ← fragment-for-effect
> *(+ a closing zinger per section)*

✅ **Shipped** (same deck, rewritten same day):
> # Question 1 — where does the data come from?
> # Run it
> # What to keep

Budget: **one quotable line per deck section at most** — the bookend line is enough. Body
text reads as the author would say it out loud; the author does the voice-over, slides
carry facts.

---

## 1b. Plain words first — a metaphor decorates, it never carries

Author verdict (session 8b, deck rejected): *"don't use words like 'socket' before
explaining them… should be like speaking to a friend. conversational about how things
work… reminding fundamentals… the slides are impossible to read right now… they don't
seem to be drafted by a human."*

❌ **Rejected** — the deck's running vocabulary was an untranslated metaphor; the plain
sequence never appeared on any slide:
> # Give it a socket
> # The plug, in bytes
> # Re-patch the cable

✅ **The fix** — name the real thing in ordinary words first, in order:
> agent → wrap it with an API endpoint so we can hit it on its production URL → deploy →
> call it → fetch results, final or streaming

An analogy is a one-time illustration *after* the plain statement — never the vocabulary
the reader must decode to find out what they're building. Remind the fundamentals as you
go; assume a smart friend, not an initiate.

---

## 2. No tool taxonomies or cost sermons — frame by the buyer

❌ **Rejected** (author verdict: *"we don't give a shit"*):
> # Four refusals, four tools
> | Rung | Tool | Per page |
> |---|---|---|
> | 0 | `requests` + a selector | 0.3s, free |
> | 3 | hosted browser + LLM | **155s, $0.14** |
>
> # Climb the cheapest rung that works
> 10,000 pages a night: rung 0 is free, rung 3 is $1,400 and takes 18 days.

✅ **Shipped**:
> # What has to be true for a buyer to take it seriously
> 1. **Real facts** about the prospect — or it reads as spam → *Part 3*
> 2. **Their look** — colors and tone — or it reads as off-brand → *Part 3*
> 3. **A custom image** in their world — or it reads as cheap → *Part 4*
> 4. **A clean layout, every time** — or it reads as unprofessional → *Part 5*

The agenda is a list of requirements someone would pay for, each mapped to the part that
delivers it. Costs appear once, at the end, as the margin argument — never as a ladder lecture.

The shipped Session 7 version tightens this into a table whose third column is the failure
(`DECK.md:67`) — so the agenda argues for its own curriculum:

> | | You'll learn | Without it, the document… |
> |---|---|---|
> | **3** | web research · reading their site | invents facts and gets their colors wrong — it reads as spam |
> | **4** | image generation | uses stock photography — it reads as a mass email |
>
> **Every part is here because the one-pager fails a buyer without it.**

---

## 2b. Introduce before you descend — three layers of preview

Author instruction: *introduce the content before the section; make the agenda clear.* The
room should always know which failure it is currently fixing. Three layers, each doing a
different job:

1. **The agenda of consequences** (above) — and the notes say to point back at it from every
   divider.
2. **The whole map, before any station** — the spine drawn once, walked left to right slowly,
   *"it's the only map they get"* (`DECK.md:87`). Give it a second axis that carries the
   module's argument, not just its order: **blue = the model decides, grey = your code,
   identical on run 1 and run 500** — which returns as takeaway #3 in the close.
3. **A divider per part**, whose italic line names what the previous part's output still
   can't do, phrased as the next requirement:

❌ **Rejected register** (syllabus): *"Part 2 — Pydantic and structured outputs."*

✅ **Shipped** (`DECK.md:200`):
> ## Part 2 — Output your code can use
> *The words are good. But they arrive as one paragraph, and a template can't read a
> paragraph — it needs the headline, the three bullets, the button text and the colors as
> separate, named values.*

Never open a part on its mechanism. Part 1 opens on the vendor's docs with *"you are not
learning an SDK, you are choosing a model and writing a prompt."*

---

## 3. No error-narrative slides — results on slides, failures in notes

❌ **Rejected** (author: *"we don't give a damn about the errors you made along the way"*):
> # One thing will break for you today: old tutorial code
> # What happens when you get lazy
> # The trap in every 2024 tutorial

✅ **Shipped** — the same content, as a speaker note on a working slide:
> <!-- Q&A note (not a slide): sampling params like temperature are gone on reasoning
> models; the dials are the prompt and reasoning={"effort": ...} — old snippets get a
> clean 400 saying exactly that. -->

The one sanctioned exception: a **contrast that motivates a requirement**, designed as a
✓/✗ side-by-side visual where the ✓ column is the star:

✅ **Shipped**:
> # The difference research makes
> ![](images/compare_grounded.png)   ← designed card: ✗ generic bullets | ✓ six real stores, real programs, sources
> **Only one of these survives a meeting with their buyer.**

---

### 3b. The demotion ladder, and what happens to the story

Author verdict, verbatim: *"Don't explain out loud what you fixed along the way. These
slides are for me to teach the students what they need to know. Not the mistakes I made
along the way to get there."*

Every build discovery gets tested with one question — **does a student who never makes my
mistake still need this?** — and drops a rung until the answer is yes:

| Rung | When | Session 7 |
|---|---|---|
| Slide | they will hit it at this exact moment, or it motivates the next requirement | the grounded/ungrounded contrast |
| Speaker note | worth saying out loud, once, at a scheduled moment | *"say `print_background=True` before they render"* |
| Answer-if-asked | only relevant to whoever raises it | *"Live aside **if the room asks**: add a lazy `extras: dict` field…"* (`DECK.md:281`) |
| Deleted | it was your afternoon, not their lesson | — |

`CAPTURES.md:21,23` planned two failure-beat slides — the `temperature` 400 and the
open-dict 400. Both were cut. The temperature one landed at rung 3 as a note that refuses
its own slide (`DECK.md:190`): *"Answer it out loud — it doesn't need a slide."*

**The fix travels; the story doesn't.** A problem you hit during the build reappears as a
precaution in the student's instructions, with nothing attached: `print_background=True`
inside the prompt box, `"upsert": "true"` as a string, SQL written `on conflict do nothing`
so a double-paste is harmless. Session 7 hit `Bucket not found` while building
(`CAPTURES.md:61`); the deck contains only the SQL that prevents it.

**Sweep for residue when you cut a beat.** The cut isn't done until the deck stops
advertising it — `DECK.md:832` still bills `s1_models.py` as *"prices the model family · the
temperature 400"* in the inventory table, for a beat that no longer exists.

---

## 4. Prompt boxes name their output first

❌ **Rejected** (prompt with no anchor — reader doesn't know what it produces):
> **🤖 Claude Code:** *"Write template.html (Jinja2): one Letter page — wordmark header, h1..."*

✅ **Shipped**:
> **🤖 → `template.html` + `render.py`** — the page as code, and the two lines that fill and print it:
> > *"Write `template.html` (Jinja2): one Letter page — wordmark header, `<h1>{{ headline }}</h1>`,
> > full-bleed hero `<img>`, two columns (why-us bullets | CTA line + button), palette as CSS
> > variables. Then `render.py`: `Template(...).render(headline=op.headline, …)` and print to
> > PDF with Playwright, 8.5×11in, `print_background=True`."*

File name → one plain line on what it does → the prompt. The prompt itself carries the
student's judgment (the selector, the schema, the expectation "expect exactly 12", the
failure posture "raise, don't skip") **and the non-obvious engineering decision** — the
guard that stops a script from re-billing on import, the return value that makes the link
usable, the retry on a moderation block:

> …guarded by `if __name__ == "__main__"` so later scripts can import the classes without
> re-running it.
> …upsert a `onepagers` row on conflict slug, and **return the public URL of each upload**.
> …catch a `moderation_blocked` error and retry once on a stripped-down brief.

Each of those pairs with its **symptom in the notes**, so the facilitator can diagnose on
sight: *"if someone's s3b prints a one-pager BEFORE the two columns, their `s2_schema` demo
call isn't guarded — importing the shape is re-running the call, and billing them for it."*

---

## 4b. Copy-paste sufficiency: the slide is the student's console

Author instruction: *the prompts to copy and the commands to kickstart the server have to be
available.* Anything a student must type is on a slide, verbatim, at the moment it is
needed — never reconstructed from prose, never hunted for in the handout mid-build.

**Prompt boxes are formatted for copying, not for reading.** One ` ```text ` fence, no inline
backticks or bold inside, so a drag-select pastes clean into Claude Code. The house CSS says
so out loud (`session-7/DECK.md:14`):

> `/* 🤖 prompt blocks: one selectable lump of plain text, styled to read as a prompt */`

❌ **Rejected shape** — the same prompt as a blockquote full of inline code (`CAPTURES.md:36`);
it reads well and pastes badly, carrying markdown debris into the terminal.

**Every prompt box is followed by its run command**, and the order is stated when order
matters — eight of these in Session 7:

> **Run it** · `python s4_vision.py`
> **Run it** · `python s3_research.py` **then** `python s3b_contrast.py`

**Every non-Python thing they run gets its literal text too:**

| Kind | Session 7 |
|---|---|
| Server start | `uvicorn app:app --port 8000 --reload`, under a bold **"Leave this running"** (`:750`) |
| Request | the full `curl -X POST` with headers and JSON body, plus the `GET` beside it (`:759`) |
| One-shot pipeline | `python run.py "Everlane" https://www.everlane.com` (`:614`) |
| Setup SQL | the whole block, written `if not exists` / `on conflict do nothing` so pasting twice is harmless (`:550`) |

**Print the expected output next to the command.** The five-station trace at `DECK.md:617`
lets a student self-check instead of raising a hand:

> ```
>   [1/5] look     palette #F8F7F5 #222222 #5A5A5A        9s
>   [5/5] store    saved to Supabase                     102s
> ```

**Don't split a runnable thing across a slide boundary**, and don't put a prompt box on a
slide without naming the file it produces.

---

## 4c. File names and run order are curriculum

Build files are named so the sequence is self-evident — `s1_models` → `s6_render`, then
`run`, `list`, `app` — later scripts **import** earlier ones, and the module ends with an
inventory slide left up during build time (`DECK.md:828`). Its note is the operational
payoff: *"If someone is lost, ask which file they're missing rather than which concept."*

Cross-script dependencies are taught as run order, on the slide and in the notes: *"s3b
reads `research.json`, so s3b alone dies on a missing file."*

**Freeze names before the capture pass** — renaming afterwards puts terminal screenshots in
contradiction with the slides. The deck header carries this as a standing rule: every
filename in a 🤖 box matches a real file in `live/`.

---

## 5. Show the artifact; draw the connection

❌ **Rejected** (asserting a connection instead of showing it):
> The schema mirrors the page. Same names in the schema, the template, and the printed PDF.

✅ **Shipped** — the claim as two visuals:
> Slide A: the actual classes on screen (`class OnePager: headline / hero / why_us / cta / brand`)
> Slide B: a rendered mapping card — `op.headline ⟶ <h1>{{ headline }}</h1>`, field by field, arrows drawn

Same for mechanisms: "their look, from their homepage" was **rejected as unclear** until it
became a numbered left-to-right diagram: screenshot → `input_image` param → typed hexes →
CSS variables (Part 5). If the slide answers "how does that actually work," it's a step
diagram, not prose.

---

## 6. Concept slides carry the pair

✅ **Shipped register** (both lines, every concept slide):
> **Why it matters:** the model line is a cost line on your client quote.
> **Tradeoff:** ~13¢ and ~30s per prospect. A researcher doing the same: an hour.

The business line answers "why would a client pay"; the tradeoff line answers "what does
this cost me technically." A concept slide with neither is trivia.

---

## 7. Voice: owned facts, no audit markers

❌ **Rejected in teaching docs** (author: *"you're my partner, not the teacher"*):
> `file_options={"upsert": "true"}` (✅ CONFIRMED against supabase-py source: the value must
> be the *string* `"true"` — check against installed version before teaching)

✅ **Shipped**:
> `"upsert": "true"` — the **string**, not a bool (it becomes an HTTP header)

Facts are stated flat because they were verified before writing (evidence lives in the
facilitator-side VERIFIED-FACTS.md, never in student-facing docs). Unverifiable items become
prep lines: *"measure it once during prep so the deck shows real numbers."*

---

## Canonical exemplars (read before drafting a new deck)

- **Deck**: `session-7/DECK.md` — the approved register end to end: gap-chain dividers,
  produced visuals, prompt boxes, request/response pair, measured cost table, three-things close.
- **Designed visuals**: `session-7/live/make_visuals.py` and `make_visuals2.py` — the
  HTML/CSS → Playwright PNG pattern for terminal cards, ✓/✗ comparisons, wireframes, step diagrams.
- **Outline**: `curriculum/module-07-outline.md` — components-and-why, bookend, part
  structure, run of show, capstone, prep.
- **Evidence file**: `curriculum/VERIFIED-FACTS.md` — where verification lives so the deck
  doesn't have to hedge.
