# code-workshop — a Claude Code harness that builds workshop modules

This repo is a working Claude Code harness: open it in Claude Code, say *"new module on X"*, and the machinery in `.claude/` drives the module from a one-line idea to a rendered deck (HTML + PPTX) with screenshots, code snippets, speaker notes, and exercises — following a house method that was calibrated on real accepted-and-rejected material.

It has four moving parts: **skills** (the method), a **hook** (the feedback catcher), **memory files** (what the harness knows), and a **feedback loop** (how it gets better). This README walks through each, then through the full pipeline a module travels.

## The moving parts

### 1. Skills — the method lives here

`.claude/skills/teaching-module/` is the system of record. `SKILL.md` holds the rules (outcome-first framing, one idea + visual spine, ship-every-module, plain spoken register); `references/` holds one file per production stage, each calibrated with real ❌ rejected vs ✅ shipped pairs:

| File | Stage it owns |
|---|---|
| `references/pipeline.md` | The mandatory stage order, per-stage outputs, definition of done |
| `references/exercise-design.md` | Design the deliverable first; the exercise IS the module |
| `references/outline-template.md` | The 10-section outline — the contract with the author |
| `references/slide-patterns.md` | Slide *content*: titles, framing, prompt boxes, voice |
| `references/slide-layouts.md` | Slide *rendering*: Marp theme, 7 archetypes, image sizing, overflow audit |
| `references/capture-list.md` | Screenshots planned from the tested run, before the deck |
| `references/visual-recipes.md` | HTML→PNG recipes for terminal cards, comparisons, diagrams |

`.claude/skills/fold-feedback/` is the second skill — it moves confirmed feedback into the skill above (see the loop, below).

### 2. The hook — feedback gets caught the moment it's given

`.claude/settings.json` wires a `UserPromptSubmit` hook: every prompt runs through `.claude/hooks/capture-feedback.sh`. The shell script does the deterministic half — pattern-matching corrective-sounding language ("don't", "instead", "why did you", "too much"…) — and when it matches, injects one sentence of context telling Claude to make the judgment call: *is this durable craft feedback?* If yes, Claude appends a dated entry to `curriculum/FEEDBACK.md` (DO/DON'T, the author's own words, a file:line citation, status `pending`) without derailing the actual request. A shell script can't tell feedback from instruction; only the model can — so the hook flags, the model decides.

### 3. Memory — what the harness knows between sessions

- `CLAUDE.md` — loaded every session; points Claude at the skill and states the standing rules.
- `curriculum/FEEDBACK.md` — the feedback inbox and audit trail. Entries stay forever, marked `pending` or `folded → <file> §<n>` — it's how a future draft can tell an author's hard-won rule from a plausible invention.
- `curriculum/VERIFIED-FACTS.md` — facilitator-side evidence (sources, dates, measured numbers) so student-facing docs state facts flat, with no audit markers.
- `curriculum/module-07-outline.md` — the canonical outline the skill cites as its filled-in example.
- `session-7/` — the reference build the skill cites by path: the approved deck register end to end (`DECK.md`), the capture list (`CAPTURES.md`), the visual factory (`live/make_visuals*.py`), and the PPTX exporter (`make_pptx.py`).

### 4. The loop — how the harness improves

```
author gives feedback mid-session
        │  (hook flags corrective language)
        ▼
curriculum/FEEDBACK.md  ← dated entry, author's words, evidence, status: pending
        │  (author says "incorporate the feedback" → /fold-feedback)
        ▼
.claude/skills/teaching-module/  ← rule folded into the right stage file,
        │                          WITH its ❌/✅ evidence pair
        ▼
next module starts from the corrected method
```

The fold keeps the evidence: a rule without its rejected-vs-shipped example is the first thing a future draft talks itself out of. Contradictions resolve in the feedback's favor — the skill is rewritten, and the FEEDBACK.md entry records why.

## The pipeline — what a module travels through

Stage order is not optional; every stage's output is the next stage's input (`references/pipeline.md` has the full version, including Stage 0 author-decisions and Stage 0.5 infrastructure checks).

### 1. Outline

The exercise is designed first — the deliverable someone would pay for, decomposed into the pipeline of stations that produce it. Stations become parts; dependency order becomes teaching order (`exercise-design.md`). Then the 10-section outline per `outline-template.md`: pitch, one idea, components-and-why, bookend, part-by-part, run of show, capstone, prereqs, gotchas, doc plan. The author reacts to structure before any slide exists. Load-bearing APIs are verified against current official docs **before the plan is approved** and cited in it.

### 2. High-level slide content

The deck skeleton follows the house grammar (`SKILL.md` §5): titles that state what you do, the three preview layers (agenda-of-consequences, whole map, gap-chain dividers), one idea per slide, concept slides carrying the why-it-matters/tradeoff pair. Register rules from `slide-patterns.md`: plain words first, metaphors decorate once, one quotable line per section at most.

### 3. Actual content — from a real run

Nothing is written on hope. The build runs end to end in `session-N/live/` against live APIs (the E2E hard rule: every slide-bound command verbatim, in step order, against the real deploy). The run produces the deck's evidence: measured numbers, real outputs, real error bodies, and the 🤖 prompt boxes — each one reproduces a script that actually ran. Alongside the deck: `SLIDES.md` (per-slide content map) and a numbered `exercises/` folder.

### 4. Screenshots and code snippets

Captures are planned **during the tested run**, not as a finishing pass (`capture-list.md`): a numbered source→slide shot list, both states of anything slow, the input the model sees, cropped vendor docs, and a measured-numbers table headed "put these on slides, not estimates". Anything textual — terminal outputs, ✓/✗ comparisons, wireframes, step diagrams — becomes a designed card via the HTML→PNG recipes in `visual-recipes.md` (Playwright renders an HTML fragment at 2× scale; `session-7/live/make_visuals.py` is the working factory).

### 5. Render — HTML and PPTX

```bash
marp DECK.md -o DECK.html                                        # the deliverable
marp DECK.md --images png --allow-local-files -o audit/S.png     # per-slide audit PNGs
python make_pptx.py                                              # editable PPTX + speaker notes
```

Layout rules and the overflow audit live in `slide-layouts.md` — clipped prompt boxes are the #1 render defect, so every slide pairing an image with text gets eyeballed on the audit PNGs. `make_pptx.py` (in `session-7/`) does the PPTX properly: Marp's `--pptx-editable` converts slides to real PowerPoint shapes via LibreOffice, which drops speaker notes — the script re-attaches them parsed straight out of `DECK.md`, and refuses to ship on a slide-count mismatch.

### 6. Sweep

Cross-module consistency, residue from cut beats, and the planning file re-checked against what shipped. The definition-of-done checklist in `pipeline.md` gates delivery.

## Using it

```bash
git clone <this repo> && cd code-workshop
claude
# then: "new module on <topic>" — the teaching-module skill picks it up
# feedback lands in FEEDBACK.md automatically; fold it with: /fold-feedback
```

**Requirements:** Node (for `npx @marp-team/marp-cli`), Python 3 with `python-pptx` and `playwright` (`playwright install chromium`), and LibreOffice (`brew install --cask libreoffice`) for the editable-PPTX export. jq for the hook.

## Repo map

```
.claude/
  settings.json                 hook wiring (UserPromptSubmit)
  hooks/capture-feedback.sh     the feedback catcher
  skills/teaching-module/       the method: SKILL.md + 7 stage references
  skills/fold-feedback/         moves confirmed feedback into the skill
curriculum/
  FEEDBACK.md                   feedback inbox + audit trail (all entries, folded or pending)
  VERIFIED-FACTS.md             facilitator-side evidence file
  module-07-outline.md          canonical outline example
  METHODOLOGY.md                the program's method, prose form
session-7/                      the reference build the skill cites
  DECK.md · CAPTURES.md         approved deck register · the capture list that fed it
  images/                       every produced visual the deck embeds
  live/make_visuals*.py         the HTML→PNG visual factory
  make_pptx.py                  editable PPTX + speaker-note reattachment
CLAUDE.md                       project memory loaded each session
```
