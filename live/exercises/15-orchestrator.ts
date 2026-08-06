/**
 * 15 — Orchestrator-worker.
 *
 * AI SDK pattern: "Orchestrator-Worker"  —  ai-sdk.dev/docs/agents/workflows
 * The docs' reference example is implementFeature(): a planner emits a typed
 * list of work items, then one specialised worker runs per item, in parallel.
 *
 * Fan-out when you don't know the branches yet.
 *
 * Exercise 13's fan-out was the easy case — you knew there were exactly two
 * searches because you typed both. Here the MODEL decides how many branches
 * there are and what each one is, and then you `Promise.all` over its plan.
 *
 * This is the shape behind almost every "research this properly" product:
 *   1. a planner produces a typed list of work items
 *   2. one worker per item, in parallel, each with its own specialised prompt
 *   3. a synthesiser folds the results into one artifact
 *
 * The budget question comes back immediately: a planner that can emit 40 items
 * is a planner that can spend $40. Cap it in the schema (`.max(4)`), not in
 * the prompt.
 */
import { generateText, Output, isStepCount } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { MODEL_ID, REQUEST, requireEnv, title, step, done, ms } from "./_shared";

requireEnv("OPENAI_API_KEY");
title("15", "orchestrator → workers → synthesis", "fan-out over a plan the model wrote");

const ResearchPlan = z.object({
  angles: z
    .array(
      z.object({
        label: z.string().describe("Two or three words, e.g. 'commuter behaviour'"),
        question: z.string().describe("The specific question this worker should research"),
        // The orchestrator doesn't just say WHAT to research, it says WHAT KIND
        // of work it is — which selects the worker's instructions below. This is
        // the detail that makes it orchestrator-worker rather than just a
        // dynamic fan-out: workers are specialised, not interchangeable.
        kind: z
          .enum(["market", "culture", "competitive"])
          .describe("Which kind of specialist should handle this angle"),
      }),
    )
    .min(2)
    .max(4) // ← the budget, enforced by the schema, not requested in the prompt
    .describe("Distinct, non-overlapping research angles"),
  estimatedComplexity: z.enum(["low", "medium", "high"]),
});

// One worker prompt per kind. The orchestrator picks which one runs.
const WORKER_INSTRUCTIONS = {
  market:
    "You are a market analyst. Report only what is selling, at what price, and " +
    "where the category is moving. Attribute every claim to a named source.",
  culture:
    "You are a cultural strategist. Report only what the audience believes, " +
    "fears and signals to each other. Attribute every claim to a named source.",
  competitive:
    "You are a competitive analyst. Report only what rival brands have already " +
    "said and done, and name them explicitly.",
} as const;

// ── 1. Orchestrator: plan the work ───────────────────────────────────────────
const t0 = Date.now();
step("orchestrator", "planning the research angles");
const { output: plan } = await generateText({
  model: openai(MODEL_ID),
  output: Output.object({ schema: ResearchPlan }),
  prompt:
    `Plan the research for this campaign brief. Choose the angles that would ` +
    `actually change the creative. Do not overlap.\n\nCampaign: ${REQUEST}`,
});
console.log(`    complexity: ${plan.estimatedComplexity}`);
plan.angles.forEach((a) => console.log(`    · [${a.kind}] ${a.label} — ${a.question}`));

// ── 2. Workers: one per planned angle, all at once ───────────────────────────
// Note `instructions: WORKER_INSTRUCTIONS[angle.kind]` — the orchestrator's
// plan selects which specialist runs. Same call site, different expert.
step("workers", `${plan.angles.length} branches in parallel`);
const findings = await Promise.all(
  plan.angles.map(async (angle) => {
    const w0 = Date.now();
    const r = await generateText({
      model: openai(MODEL_ID),
      instructions: WORKER_INSTRUCTIONS[angle.kind],
      prompt: `In 3 sentences with named sources: ${angle.question}`,
      tools: { web_search: openai.tools.webSearch({ searchContextSize: "low" }) },
      stopWhen: isStepCount(4),
    });
    console.log(`    ${angle.kind.padEnd(12)} ${angle.label.padEnd(24)} ${String(Date.now() - w0).padStart(6)}ms · ${r.sources?.length ?? 0} sources`);
    return { label: `${angle.kind}: ${angle.label}`, text: r.text };
  }),
);

// ── 3. Synthesis: fold the workers' output into one artifact ─────────────────
step("synthesis", "folding findings into one set of implications");
const { output: synthesis } = await generateText({
  model: openai(MODEL_ID),
  output: Output.object({
    schema: z.object({
      implications: z.array(z.string()).min(2).max(4).describe("What the creative should do, given the findings"),
      tension: z.string().describe("The one place the findings disagree or complicate each other"),
    }),
  }),
  prompt:
    `Synthesise these research findings into creative implications for: ${REQUEST}\n\n` +
    findings.map((f) => `## ${f.label}\n${f.text}`).join("\n\n"),
});

console.log();
synthesis.implications.forEach((i) => console.log(`  → ${i}`));
console.log(`\n  \x1b[33mtension:\x1b[0m ${synthesis.tension}`);
console.log(`\n  \x1b[2mwhole orchestration: ${ms(t0)}\x1b[0m`);

done(
  "A fan-out whose width you didn't choose. Cap the plan in the schema — that\n" +
    "  `.max(4)` is the only thing standing between you and a $40 request.",
);
