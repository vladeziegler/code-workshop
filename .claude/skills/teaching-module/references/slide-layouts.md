# Slide Layouts — the Marp/HTML layer: archetypes, sizing, overflow rules

The deck is Marp markdown. Slides are fixed 1280×720 boxes: **content that doesn't fit gets
silently clipped** — the #1 render defect. This file is the layout system that prevents it.

## The house front matter (use verbatim)

```yaml
---
marp: true
paginate: true
theme: default
class: invert
style: |
  section { font-size: 27px; }
  h1 { font-size: 44px; }
  h2 { font-size: 34px; }
  code { font-size: 0.8em; }
  section.lead { text-align: center; }
  section.lead h1 { font-size: 56px; }
  blockquote { border-left: 4px solid #6cc7ff; color: #cfd6df; font-size: 0.78em; }
  img { display: block; margin: 8px auto; max-width: 1050px; height: auto; border-radius: 8px; }
  table { font-size: 0.85em; }
  strong { color: #6cc7ff; }
  em { color: #9fb4cc; }
---
```

Blockquotes are the 🤖 prompt boxes (blue bar). `strong` renders in the accent blue — use it
for the emphasis words, checkpoint lines, and "Why it matters / Tradeoff" labels.

## The height budget

720px total ≈ title (~110) + content (~560) + bottom margin. Everything below is derived
from that budget. When in doubt, remove content — never shrink fonts below the theme.

## Slide archetypes (pick one per slide; don't invent hybrids)

### A. Lead / title / divider
```markdown
<!-- divider -->
## Part 3 — Make it true, make it theirs
*the object is typed — now the facts and the look have to be real*
```
Title + the gap line in italics. Nothing else. Dividers are breathing beats.

### B. Concept slide
Title · ONE of {≤3-line code block | small table | one designed visual} · the
**Why it matters / Tradeoff** pair. Nothing more fits.

### C. Build slide (code-or-image + 🤖 prompt box)

    # Research and writing, one call
    [code block, ≤ 6 short lines]
    **🤖 → `compose.py`** — one line on what the file does:
    > "the prompt…"              ← ≤ 4 rendered lines at 0.78em
    **Why it matters:** … / **Tradeoff:** …   ← only if the code block is ≤4 lines

**Rule: an image sharing a slide with a prompt box gets `![h:275–340]`.** Never natural size.

### D. Artifact slide (the breathing slide)
Tall portrait output (a one-pager, a form result) **alone**: `![h:400–520]` + at most one
checkpoint line. If it needs explanation, the explanation is the previous slide.

### E. Comparison slide
One designed ✓/✗ card (`![h:390]`) + one payoff line. The card argues; the line lands it.

### F. Request/response slide
Two fenced blocks — the call and what comes back — then the 🤖 box. No image.

### G. Table slide (costs, decisions)
One table + ≤2 lines of consequence ("that gap is your margin"). Tables max ~6 rows.

## Image height table (calibrated on the audited Session-7 render)

| Situation | Cap |
|---|---|
| Image + 🤖 prompt box on one slide | `h:275`–`h:340` |
| Image + 2 lines of text | `h:390`–`h:420` |
| Tall portrait artifact, alone with 1 line | `h:400`–`h:520` |
| Wide strip (spine, flow diagram) + prompt | `h:275`–`h:295` |
| Terminal card + Why/Tradeoff pair | `h:330`–`h:340` |

## Don'ts (each of these shipped clipped or got rejected)

- ❌ Natural-size image + anything else on the slide → clipped prompt (the S.010 defect)
- ❌ More than ~6 lines of code on any slide (full code lives in the HANDOUT)
- ❌ Prompt box + code block + image on one slide — pick two, or split the slide
- ❌ Caption below a tall image (gets cut) — text goes **above** the image
- ❌ Two ideas on one slide; two archetypes on one slide
- ❌ Shrinking fonts to make content fit — the content is wrong, not the font

## The audit (mandatory before delivery)

```bash
marp DECK.md -o DECK.html                                        # deliverable
marp DECK.md --images png --allow-local-files -o audit/S.png     # per-slide PNGs
```

Read every PNG where an image shares a slide with text. **Re-render immediately before
auditing** — a stale render will "verify" fixes that aren't in it. Hash-based browser
navigation for spot checks is unreliable; the PNG export is the truth.
