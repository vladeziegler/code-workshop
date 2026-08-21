---
name: fold-feedback
description: Fold pending entries from curriculum/FEEDBACK.md into the teaching-module skill, with supporting examples, then mark them folded. Use when the author says "incorporate the feedback", "fold this into the skill", "update the skill from feedback", or runs /fold-feedback.
---

# Fold Feedback Into The Skill

`curriculum/FEEDBACK.md` is the inbox; `.claude/skills/teaching-module/` is the system of
record. This skill moves entries from the first to the second **without losing the evidence
that made them credible**.

## Procedure

1. **Read** `curriculum/FEEDBACK.md`. Collect every entry whose status is `pending`. If
   there are none, say so and stop — do not go looking for feedback elsewhere.

2. **Group before writing.** Several pending entries often express one principle at
   different altitudes. Fold the principle once, in the highest-altitude place it belongs,
   and let the specifics become its examples. Never append six near-duplicate bullets.

3. **Route each entry to its home** — the file that already owns that stage:

   | Entry is about | Goes to |
   |---|---|
   | What a module *is* — framing, the one idea, ship-every-module | `SKILL.md` (numbered section) |
   | Slide *content* — titles, framing, prompt boxes, voice, what's on screen | `references/slide-patterns.md` |
   | Slide *rendering* — layout, archetypes, image sizing, overflow | `references/slide-layouts.md` |
   | Screenshots, designed cards, the shot list | `references/capture-list.md` |
   | Producing a visual (HTML→PNG recipes) | `references/visual-recipes.md` |
   | Stage order, definition of done, what happens when | `references/pipeline.md` |
   | The exercise/capstone | `references/exercise-design.md` |
   | Outline sections | `references/outline-template.md` |

   A rule that changes what "done" means also earns a line in `pipeline.md`'s
   **Definition of done** checklist. A rule with a rejected-vs-shipped pair belongs in
   `slide-patterns.md` even if it also gets a sentence in `SKILL.md`.

4. **Write it in house register.** The references are calibrated on real material, so:
   - State the rule as an instruction, not a report of what happened.
   - Carry the **evidence** across — the `file:line` citation and, where one exists, the
     ❌ rejected / ✅ shipped pair. A rule without its example is the first thing a future
     draft will talk itself out of.
   - Quote the author's *why* when it's the sharpest form of the rule.
   - Keep the anti-slop discipline: no audit markers, no hedging, no "as of".

5. **Deduplicate against what's already there.** If the skill already states the rule,
   strengthen the existing text or add the new example to it — do not create a second
   home for the same idea. If the new feedback *contradicts* existing skill text, the
   feedback wins: rewrite the old text and note the change in your summary.

6. **Mark the entries** in `FEEDBACK.md`: status becomes `folded → <file> §<n>`. Keep the
   entry — the log is the audit trail of why the skill says what it says. Never delete.

7. **Report** in a few lines: which entries folded, which files changed, anything that
   contradicted the skill, and anything you deliberately did not fold (with the reason).

## Rules

- **Never fold an entry the author hasn't confirmed.** Anything ambiguous gets asked about
  first, in one question, with a recommended default.
- **Never fold a one-off.** "Use the HTML not the MD" is a task instruction; "planning docs
  go stale and must not outlive their claims" is the rule underneath it. If an entry reads
  as a one-off, either extract the general rule or mark it `dropped (one-off)`.
- **Cite, don't paraphrase.** Where a shipped artifact demonstrates the rule, point at it by
  path and line so the next draft can read the real thing.
- **Leave the deck alone.** Folding updates the skill. Fixing a module is a separate,
  explicitly-requested job.
