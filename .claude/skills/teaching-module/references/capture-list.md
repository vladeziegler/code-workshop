# The Capture List — plan the visuals before the deck exists

Screenshots are not a finishing pass. They are produced from the tested run (pipeline Stage
2) and planned in a **capture list** written *while the run is still on screen*, because
half of them can't be retaken later without paying for another run. Session 7's
`session-7/CAPTURES.md` is the reference artifact.

## The file has three parts

**1. A measured-numbers table**, headed *"put these on slides, not estimates"*:

> | What | Measured |
> |---|---|
> | One research call (web_search, terra) | 5 searches · 18 citations · ~42k in / 2.5k out ≈ **12¢** |
> | One hero image (gpt-image-2, medium, 1536×1024) | 1,372 image tokens ≈ **4¢** |
> | Whole pipeline per one-pager | ≈ **2–3 min, ~20¢** |

Each number reaches a slide with a business sentence attached — *"choosing terra over sol
across ten thousand prospects is a four-figure decision"* — never as bare trivia.

**2. A numbered `source → slide` shot list.** Every row names the artifact *and* its
destination, so nothing is captured speculatively and nothing is missing at deck time:

> 1. **Terminal: `s1_models.py` output** — model list + 3-row usage table → P1 concept slide
> 7. **`live/prospect_home.png`** (the screenshot the model *sees*) + terminal Brand fields → P3 vision pair
> 10. **`live/output/sezane_preview.png`** → capstone slide ("same code, different prospect")
> 11. **Browser: the form** mid-generation *and* done state → P5 protected moment

**3. The prompt boxes, derived from the code that ran** — so a student pasting one gets the
script you actually executed, not an idealized rewrite.

## What to capture

- **Both states of anything that takes time.** The mid-flight capture ("Researching,
  composing, painting…") is what makes an 86-second silence legible on a slide; the done
  state alone reads as instant.
- **The input the model sees**, not just its output — the homepage screenshot next to the
  typed hexes it returned. Grounding is invisible unless you show what it was grounded on.
- **The vendor's own docs, cropped.** Session 7 carries five (`images/api_*.png`), each
  beside the station it explains. They prove the mechanism is a first-class feature rather
  than a wrapper you invented, and they let the notes separate the durable part from the
  perishable one: *"their example model is older than terra; the TOOLS LIST is the durable
  part."*
- **A second run of the same pipeline on a different subject** — the generalization proof
  ("Nothing changed but the input", `session-7/DECK.md:814`).
- **Designed cards** for anything textual (terminal output, ✓/✗ comparisons, wireframes,
  step diagrams) via `visual-recipes.md` — real data, slide-legible formatting.
- **Terminal transcripts of every station, recorded as the tested run happens** — not
  reconstructed after. They become the expected-output blocks beside commands, and they
  feed the `SLIDES.md` per-slide content map (pipeline Stage 4).

## Discipline

- **Screenshots pin the file names.** Renaming a script after captures are taken puts the
  slides and the terminal images in contradiction. Freeze names (`s1_…` → `s6_…`, ordering
  self-evident) before the capture pass. Session 7's `CAPTURES.md` still says `models.py`,
  `s2_generate.py` and `store.py` — the drift this rule exists to prevent.
- **A planned capture that dies with its slide is deleted, not stored.** Session 7 planned
  *"Terminal: the temperature 400 → P1 failure beat"* and *"the open-dict 400 → P2 failure
  beat"*; both slides were cut (see `SKILL.md` §6), so both captures went with them.
- **The capture list is a planning doc, not a source of truth.** After the deck ships,
  re-check it: claims the build disproved must be corrected or the file retired. Session
  7's still asserts *"Never combine search and parse in one call: the citations come back
  empty"* — which the shipped deck teaches the opposite of (`DECK.md:352`). A stale planning
  file will re-infect the handout.
- **Zero placeholders ship.** A `[screenshot: ...]` in a delivered deck means the argument
  was never actually made.
