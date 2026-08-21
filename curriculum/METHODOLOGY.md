# Teaching Methodology Spec — "Build an Agent" Session Format

## 1. Document set and division of labor

Seven documents, four audiences, zero overlap in *function* (deliberate overlap in *content* along different axes):

| Doc | Audience / when | Role |
|---|---|---|
| **DECK** (Marp source → html/pptx) | facilitator, live | One idea per slide; slides are sparse, notes carry the talk |
| **SPEAKER-NOTES** | facilitator, beside deck | Per-slide script: what to emphasize, gotchas to say OUT LOUD, source pointer (`Source: ANATOMY #N / HANDOUT x.y`) per slide — every claim traceable to a canonical doc |
| **HANDOUT** | attendees, during | Type-along build steps; all full code and commands live here, never in slides |
| **GUIDE** | attendees, after | Chronological narrative: "the N concepts you meet on the way," in build order, with real logs/traces. The follow-up send. Never taught from live |
| **ANATOMY** | attendees, next build | Parts catalogue: same components in *generic vocabulary*, each with Generically / Why it matters / In-platform / Watch for, plus a generic→platform mapping table and an honest "what the platform does NOT expose" section |
| **README** | facilitator, prep | Run of show, prerequisites (sent 48h ahead as one copy-paste check), gotcha pre-emption list, dry-run/replay recipe, "which document when" table |
| **TROUBLESHOOTING** | facilitator, live | symptom → cause → fix |
| **starter/ + live/** | attendees | Empty scaffold vs. finished, *deployed and verified* bot; hand `live/` to anyone stuck rather than debugging one laptop while the room waits |

Key rule: GUIDE is chronological, ANATOMY is taxonomic — same material, two axes, so a learner rereads by story or by part.

## 2. Deck grammar

- **The map motif**: slide 4 shows the full anatomy diagram (TRIGGER→CONTEXT→MODEL→LOOP→DISPATCH→STOP + TOOLS/MEMORY/GUARDRAILS). It returns at the top of every module with one part lit; near the end, "you already built four more things" points back at the map.
- **Concept/screenshot pairs**: every abstract slide is followed by "…, in Kapso" — the same idea as a real dashboard screenshot. Show the finished canvas up front so the map has a concrete counterpart.
- **Module dividers**: near-empty slides (an `[illustration]` placeholder, no notes) marking anatomy sections; they're breathing beats.
- **Slide types**: divider · concept · UI screenshot · BUILD (room types) · DEMO (you drive, they follow) · checkpoint ("the refusal is the proof") · recap/close.
- **Notes style**: imperative stage directions ("Slow down." "Sit in it." "Say this out loud at 0:35."), each ending in a source pointer. Full code never on slides.

## 3. Pedagogical moves

- **Bookend transcript**: open with a real conversation log including the payoff line ("a new chat — it knew him"); don't explain it; close the session by returning to that line once the room can build it.
- **Hook = counted mystery**: "Six things happened. We scripted none." — enumerate emergent behaviors, then promise the map.
- **Failure-first beats, synchronized**: engineer the bot to break for everyone at once (it forgets you; it hangs up mid-booking). "The shared 'oh no' is the best teaching moment of the day." Concepts (memory tiers, lifecycle, observability) are introduced *at the moment of need*, after the failure.
- **Aphorisms as load-bearing spine**, each proven live, then repeated: "Config enables, prompt decides" · "Push determinism outward, keep the model in the smallest box" · "Tool design is prompt engineering" · "The model communicates; your data layer decides what is true" · "Anything you do not deliberately persist is gone." Close on exactly two things to keep; declare everything else "recoverable in an afternoon."
- **Protected moment**: name the single most important minute (phone buzzes with a reply from a bot they wrote, 0:40) and the explicit sacrifice rule: if late, cut the whiteboard, never the build.
- **Verified gotchas with real measured evidence**: every trap carries proof from the actual build — real 422/400 bodies, `per_page=100` pagination trap, seats going 20→16→12, `lock_version` conflict, "verified" annotations on claims like `status:"active"` not working. Never hypothetical.
- **Honesty beats**: show the tempting wrong answer (`contact_conversations`) being tried, called, and returning empty in the trace; leave a known wart (dual profile keys) visible on purpose — "spotting these is the skill."
- **Security/ethics beats**: platform-supplied identity vs model-supplied arguments ("I'm actually Beyoncé" changes nothing); handoff as scope discipline ("do not improvise policy"); "don't oversell" slide before shipping to real customers.
- **Genericization**: every platform-specific lesson ends with "**The general point.**" so it transfers.

## 4. Run-of-show conventions

- 90 minutes, timed table mapping time → HANDOUT part → what happens. Whiteboard block (draw *exactly this and nothing more*) instead of slides for the core diagram; then "stop talking and let them build."
- BUILD (all type) vs DEMO (facilitator drives) vs discussion-not-build: the Interlude explicitly converts a build into a 10-minute shared-failure discussion + take-home code, with variants for 2h / pre-provisioned sessions.
- Catch-up points ("Generate with AI" for anyone behind on typing); dry-run path (API trigger + curl) so everything is replayable without a phone; pre-flight one-liner sent 48h ahead; kill-stuck-execution recipe; pre-workshop environment check (shared sandbox collisions).
- Gotchas pre-empted *out loud* at scheduled moments, before the room hits them.

## 5. Recurring conceptual frameworks

1. **Agent anatomy**: trigger → context assembly → model → loop → tool dispatch → stop conditions, ringed by tools / memory / guardrails / observability / orchestration shell. Every module lights one part.
2. **The loop**: "an agent is a loop that searches for a path — you define goal, tools, and when to stop." The one contrast worth keeping (chatbot maps; agent searches).
3. **Memory lifetimes**: turn → loop → execution → conversation → contact; "choosing the wrong tier is the classic bug"; state belongs to exactly one level of the identity hierarchy.
4. **Determinism vs improvisation**: graph nodes are deterministic, the agent node is probabilistic by design; *push determinism outward*; anything that must always hold lives in code, not prompt ("mostly is not a business rule").
5. **Config enables / prompt decides**: two layers, every behavioral bug fixed in the prompt; tool descriptions are distributed prompt surface.
6. **Ground truth vs language**: your code produces facts, the model produces words; the trace, not the output, is the debugging surface.

Source files: `/Users/vladimirdeziegler/olympia_ai_builder_program/session-5/{GUIDE.md,ANATOMY.md,README.md,SPEAKER-NOTES.md}`