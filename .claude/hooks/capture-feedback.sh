#!/usr/bin/env bash
# UserPromptSubmit hook — AI Builder Program.
#
# A shell hook cannot tell feedback from instruction; only the model can. So this does the
# deterministic half: it pattern-matches prompts that LOOK corrective and injects a short
# reminder telling Claude to make the judgement call and log it if it's durable craft
# feedback. Non-matching prompts pass through untouched (empty output = no-op).
set -uo pipefail

INPUT=$(cat)
PROMPT=$(printf '%s' "$INPUT" | jq -r '.prompt // empty' 2>/dev/null)
[ -z "$PROMPT" ] && exit 0

# Skip slash commands — /fold-feedback and friends carry their own instructions.
case "$PROMPT" in /*) exit 0 ;; esac

# Corrective / preference-stating language. Deliberately broad: a false positive costs one
# sentence of context, a false negative loses a lesson.
SIGNALS='dont |don.t|do not |never |always |stop |instead|rather than|avoid |ensure |make sure|going forward|from now on|next time|no need|not relevant|isn.t relevant|we don.t|i said|that.s not|thats not|too much|too long|wrong|prefer|should (be|have|not)|why (are|did) you|remove the|cut the|reframe|focus on'

if printf '%s' "$PROMPT" | tr '[:upper:]' '[:lower:]' | grep -qE "$SIGNALS"; then
  jq -n '{
    hookSpecificOutput: {
      hookEventName: "UserPromptSubmit",
      additionalContext: (
        "[feedback-capture] This prompt may contain durable craft feedback. Decide: does it "
        + "change how work gets done NEXT TIME (framing, slide content, structure, wording, "
        + "delivery, workflow)? If yes, append a dated entry to curriculum/FEEDBACK.md using "
        + "that file'"'"'s format — DO / DON'"'"'T, the author'"'"'s own words under **Why**, a file:line "
        + "citation if one exists, status `pending` — and mention in one line that you logged "
        + "it. If it is a one-off task instruction, scope decision, or already in "
        + ".claude/skills/teaching-module/, do NOT log it and do not mention this. Never let "
        + "logging delay the actual request."
      )
    }
  }'
fi
exit 0
