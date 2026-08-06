/**
 * 14 — Evaluator / feedback loop.
 *
 * AI SDK pattern: "Evaluation/Feedback Loops"  —  ai-sdk.dev/docs/agents/workflows
 * The docs' reference example is translateWithFeedback(). This is that shape,
 * applied to a campaign brief.
 *
 * ── The shape ─────────────────────────────────────────────────────────────
 *
 *     draft once                       ← OUTSIDE the loop
 *     while (iterations < MAX) {
 *       evaluation = evaluate(draft)   ← typed SCORES, not a verdict
 *       if (goodEnough(evaluation))    ← YOUR CODE decides, not the model
 *         break
 *       draft = improve(draft, evaluation.issues, evaluation.suggestions)
 *       iterations++
 *     }
 *
 * Three details that are easy to get wrong, and that this exercise exists for:
 *
 * 1. THE FIRST DRAFT IS OUTSIDE THE LOOP. The loop's job is improvement, not
 *    generation. Put the draft inside and every iteration re-drafts from
 *    scratch, throwing away the thing you were supposed to be improving.
 *
 * 2. THE EVALUATOR RETURNS SCORES, NOT PASS/FAIL. Ask a model "is this good
 *    enough?" and you have handed it the stopping decision. Have it score
 *    specific dimensions instead, and let a plain `if` compare those numbers
 *    to a threshold you chose. That threshold is a business decision and it
 *    belongs somewhere you can grep — see BRIEF_THRESHOLD in lib/brief.ts.
 *
 * 3. THE FEEDBACK IS THE WIRE. `issues` and `suggestions` go straight into the
 *    improve prompt. A bare "fail" gives the rewrite nothing to act on, and
 *    the second draft is just a different random draft.
 *
 * And the budget: MAX_ITERATIONS is in code. "Loops until it's good" is not a
 * stop condition, it's a billing incident.
 *
 * ── A fourth thing, which the docs' version doesn't have ──────────────────
 * This loop has TWO exits: "good enough" and "no longer improving". Feedback
 * loops plateau — scores go 6 → 7 → 7 and then sit there while you keep paying
 * two model calls a round. Detecting the plateau is what separates a demo from
 * something you'd leave running on a client's account.
 */
import { generateText, Output, isStepCount } from "ai";
import { openai } from "@ai-sdk/openai";
import { CampaignBrief, BriefEvaluation, BRIEF_THRESHOLD, briefIsGoodEnough } from "../lib/brief";
import { MODEL_ID, REQUEST, requireEnv, title, done } from "./_shared";

requireEnv("OPENAI_API_KEY");
title("14", "evaluator / feedback loop", "the model scores; your code decides when to stop");

const MAX_ITERATIONS = 3;

// Research once, reused by every iteration — it isn't what we're improving.
console.log("  researching…");
const research = await generateText({
  model: openai(MODEL_ID),
  prompt: `In 4 sentences with named sources: market and audience notes for: ${REQUEST}`,
  tools: { web_search: openai.tools.webSearch({ searchContextSize: "low" }) },
  stopWhen: isStepCount(4),
});

// ── Initial draft — OUTSIDE the loop ───────────────────────────────────────
console.log("  drafting…\n");
let { output: draft } = await generateText({
  model: openai(MODEL_ID),
  instructions: "You are a campaign strategist.",
  output: Output.object({ schema: CampaignBrief }),
  prompt: `Write a campaign brief for: ${REQUEST}\n\nResearch:\n${research.text}`,
});

let iterations = 0;
let evaluation: BriefEvaluation | null = null;

// Plateau detection. The docs' version of this pattern doesn't have it, and
// you will want it about an hour after you ship one.
//
// A feedback loop does NOT improve monotonically. Run this file a few times and
// you'll see scores go 6 → 7 → 7, or even go down. Past a point the evaluator
// is just rephrasing the same complaint and the writer is just reshuffling the
// same draft — and you are paying two model calls per round for it.
//
// So: stop when it stops getting better, not only when the budget runs out.
const totalScore = (e: BriefEvaluation) => e.specificity + e.grounding + e.audienceClarity;
let bestScore = -Infinity;

// ── Evaluate → decide → improve ────────────────────────────────────────────
while (iterations < MAX_ITERATIONS) {
  const { output: e } = await generateText({
    model: openai(MODEL_ID),
    instructions:
      "You are a hard-to-please creative director evaluating campaign briefs. " +
      "Score honestly. A 10 means you would show it to the client unchanged.",
    output: Output.object({ schema: BriefEvaluation }),
    prompt:
      `Evaluate this brief against the request.\n\n` +
      `Request: ${REQUEST}\n\nResearch available:\n${research.text}\n\n` +
      `Brief:\n${JSON.stringify(draft, null, 2)}`,
  });
  evaluation = e;

  console.log(
    `  iteration ${iterations}  "${draft.campaign}"\n` +
      `    specificity ${e.specificity}/${BRIEF_THRESHOLD.specificity}` +
      `  grounding ${e.grounding}/${BRIEF_THRESHOLD.grounding}` +
      `  audience ${e.audienceClarity}/${BRIEF_THRESHOLD.audienceClarity}`,
  );

  // THE DECISION. Plain TypeScript. No model involved.
  if (briefIsGoodEnough(e)) {
    console.log(`    → passes threshold, stopping\n`);
    break;
  }

  // Second stopping condition: are we still making progress?
  if (totalScore(e) <= bestScore) {
    console.log(
      `    → below threshold AND no better than the last round ` +
        `(${totalScore(e)} vs ${bestScore}) — stopping early\n`,
    );
    break;
  }
  bestScore = totalScore(e);

  console.log(`    → below threshold: ${e.issues.slice(0, 2).join("; ")}`);

  // The feedback is the wire into the next draft.
  const { output: improved } = await generateText({
    model: openai(MODEL_ID),
    instructions: "You are a campaign strategist revising your own work.",
    output: Output.object({ schema: CampaignBrief }),
    prompt: [
      `Improve this campaign brief. Fix exactly these problems:`,
      e.issues.map((i) => `- ${i}`).join("\n"),
      `Apply these suggestions:`,
      e.suggestions.map((s) => `- ${s}`).join("\n"),
      `Request: ${REQUEST}`,
      `Research (use real facts, name sources):\n${research.text}`,
      `Current brief:\n${JSON.stringify(draft, null, 2)}`,
    ].join("\n\n"),
  });
  draft = improved;
  iterations++;
}

if (iterations === MAX_ITERATIONS && evaluation && !briefIsGoodEnough(evaluation)) {
  console.log(
    `  budget spent after ${MAX_ITERATIONS} iterations and it still isn't passing.\n` +
      `  Shipping the last draft is a DECISION — make it deliberately. The other\n` +
      `  honest options are escalating to a human, or returning the failure.\n`,
  );
}

console.log(`  final: "${draft.campaign}"`);
draft.headlines.forEach((h) => console.log(`         ${h}`));
console.log(`  ${iterations} improvement round(s)\n`);

done(
  "You couldn't name the steps, but you could measure done. That's the loop.\n" +
    "  The model scored it; a threshold in your code stopped it.",
);
