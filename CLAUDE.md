# code-workshop

This repo is a Claude Code harness for building workshop modules (outline → deck → captures → HTML/PPTX render). The method is not in this file — it lives in the skill.

## Standing rules

- **Any module work** (new module, outline, deck, revision, critique) goes through the `teaching-module` skill. Read `references/pipeline.md` first — the stage order is mandatory.
- **Feedback discipline:** durable craft feedback gets logged to `curriculum/FEEDBACK.md` the moment it's given (the UserPromptSubmit hook reminds you). `/fold-feedback` moves pending entries into the skill with their evidence. Folded entries are never deleted.
- **Nothing ships untested.** Every slide-bound command runs verbatim against the real deploy before it reaches a slide; every number is measured; every 🤖 prompt box reproduces a script that exists and passed.
- **Register:** everything the author reads is written the way they talk — plain words, no invented vocabulary, no punchline-per-slide. `SKILL.md` §14.
- **Exemplars:** `session-7/` is the approved reference build (deck register, capture list, visual factory, PPTX exporter). Match it.

## Layout

Module N gets a `session-N/` folder: `DECK.md`, `CAPTURES.md`, `SLIDES.md`, `images/`, `live/` (tested build), `starter/`, `exercises/`. Curriculum-level files (outlines, FEEDBACK.md, VERIFIED-FACTS.md) live in `curriculum/`.
