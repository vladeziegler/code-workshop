/**
 * 13 — Parallel processing: specialists, not shortcuts.
 *
 * AI SDK pattern: "Parallel Processing"  —  ai-sdk.dev/docs/agents/workflows
 * The docs' reference example is parallelCodeReview(): three reviewers with
 * different instructions and different output schemas, then an aggregator.
 *
 * The point of a fan-out is NOT that it's faster. Speed is the side effect.
 * The point is that one model call with one system prompt gives you one
 * perspective, and folding three concerns into a single prompt gives you mush.
 * Three specialists — each with its own `instructions` and its own OUTPUT
 * SCHEMA — give you three genuinely different readings, which a synthesiser
 * then has to reconcile.
 *
 * This is the AI SDK's documented Parallel Processing pattern:
 *
 *     [ specialist A ]                 different instructions
 *     [ specialist B ]  → Promise.all  different Output schemas   → synthesise
 *     [ specialist C ]                 no shared context
 *
 * What makes it a pattern rather than a `Promise.all`: each branch has a
 * DIFFERENT `instructions` and a DIFFERENT typed schema. If all three branches
 * are the same call with a different string in the prompt, you don't have
 * specialists — you have retries.
 *
 * How this differs from its neighbours:
 *   · 13 (here)  you NAME the branches at write time. Fixed width.
 *   · 15         the MODEL plans the branches at runtime. Dynamic width.
 *   · 16         a branch is a whole agent, with its own tools and budget.
 *
 * Tradeoff: Promise.all fails as a unit — one rejected branch throws away the
 * other two, which already cost you money. The last section shows allSettled.
 */
import { generateText, Output, isStepCount } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { MODEL_ID, REQUEST, requireEnv, title, done, ms } from "./_shared";

requireEnv("OPENAI_API_KEY");
title("13", "parallel specialists", "three perspectives that don't touch, reconciled by a fourth");

// ── The three specialists. Different lens, different shape of answer. ───────

const market = {
  label: "market",
  instructions:
    "You are a market analyst. You care only about what is selling, at what " +
    "price, and where the category is moving. Never comment on creative.",
  schema: z.object({
    trends: z.array(z.string()).min(2).max(3).describe("Named, sourced market trends"),
    pricePosition: z.enum(["value", "mid", "premium", "luxury"]),
    risk: z.string().describe("The commercial risk in this campaign, one sentence"),
  }),
};

const audience = {
  label: "audience",
  instructions:
    "You are a cultural strategist. You care only about what the audience " +
    "believes, fears, and signals to each other. Never comment on price.",
  schema: z.object({
    tensions: z.array(z.string()).min(2).max(3).describe("What this audience is torn between"),
    languageToAvoid: z.array(z.string()).describe("Words that would mark the brand as an outsider"),
    proofRequired: z.string().describe("What this audience needs to see to believe a claim"),
  }),
};

const competitive = {
  label: "competitive",
  instructions:
    "You are a competitive analyst. You care only about what rival brands have " +
    "already said and done. Be specific and name them.",
  schema: z.object({
    claimedTerritory: z.array(z.string()).min(2).max(3).describe("Angles competitors own, with brand names"),
    whiteSpace: z.string().describe("The angle nobody credible has taken yet"),
  }),
};

// One helper, three configurations. The variation lives in the DATA above,
// which is what makes adding a fourth specialist a five-line change.
async function runSpecialist<S extends z.ZodType>(spec: {
  label: string;
  instructions: string;
  schema: S;
}): Promise<{ label: string; output: z.infer<S> }> {
  const t0 = Date.now();
  const { output } = await generateText({
    model: openai(MODEL_ID),
    instructions: spec.instructions,
    output: Output.object({ schema: spec.schema }),
    prompt: `Campaign under consideration: ${REQUEST}`,
    tools: { web_search: openai.tools.webSearch({ searchContextSize: "low" }) },
    stopWhen: isStepCount(4),
  });
  console.log(`  ${spec.label.padEnd(12)} done in ${Date.now() - t0}ms`);
  // The cast is only needed because this helper is generic over the schema —
  // at each call site below, `output` is fully typed from that specialist's own
  // schema. Write the three calls out longhand and you'd need no cast at all.
  return { label: spec.label, output: output as z.infer<S> };
}

// ── Fan out. No branch can see any other branch's work. ────────────────────

console.log("  running three specialists concurrently…\n");
const t0 = Date.now();
const [m, a, c] = await Promise.all([
  runSpecialist(market),
  runSpecialist(audience),
  runSpecialist(competitive),
]);
console.log(`\n  all three joined in ${ms(t0)} — the floor is the slowest branch, not the sum\n`);

console.log(`  market      price: ${m.output.pricePosition} · risk: ${m.output.risk}`);
console.log(`  audience    proof needed: ${a.output.proofRequired}`);
console.log(`  audience    avoid: ${a.output.languageToAvoid.join(", ")}`);
console.log(`  competitive white space: ${c.output.whiteSpace}\n`);

// ── Synthesise. THIS is why you fanned out. ────────────────────────────────
// The synthesiser is the only call that sees all three, and therefore the only
// place the perspectives can be caught contradicting each other — which is the
// most valuable output of the whole pattern.

const { output: synthesis } = await generateText({
  model: openai(MODEL_ID),
  instructions:
    "You are the creative director. You reconcile specialist input. Where two " +
    "specialists disagree, say so plainly rather than splitting the difference.",
  output: Output.object({
    schema: z.object({
      direction: z.string().describe("The creative direction all three findings support"),
      conflict: z.string().describe("Where the specialists actually disagree, named"),
      decision: z.string().describe("How you resolve that conflict, and what it costs"),
    }),
  }),
  prompt:
    `Campaign: ${REQUEST}\n\n` +
    [m, a, c].map((r) => `## ${r.label}\n${JSON.stringify(r.output, null, 2)}`).join("\n\n"),
});

console.log(`  direction  ${synthesis.direction}`);
console.log(`  conflict   ${synthesis.conflict}`);
console.log(`  decision   ${synthesis.decision}\n`);

// ── The failure mode nobody prices ─────────────────────────────────────────

console.log(`  One branch throwing takes all three down with it:

    await Promise.all([a, b, c])          // one rejection → you lose a and b
                                          // too, after paying for them

    const rs = await Promise.allSettled([a, b, c]);
    const ok = rs.filter(r => r.status === "fulfilled").map(r => r.value);
    // synthesise from what survived, and tell the user which lens is missing

  Use all() when every branch is load-bearing. Use allSettled() when the answer
  is still worth shipping with two of three — and name the one that's absent.
`);

done(
  "A fan-out is a design for DISAGREEMENT, not a speed trick. If your branches\n" +
    "  can never contradict each other, you didn't need three of them.",
);
