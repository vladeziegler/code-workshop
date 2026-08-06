/**
 * 12 — Routing.
 *
 * AI SDK pattern: "Routing"  —  ai-sdk.dev/docs/agents/workflows
 * The docs' reference example is handleCustomerQuery().
 *
 * Really: the decision to take a decision away from the model.
 *
 * This exercise is not really about an SDK feature. `Output.object` and a
 * `switch` are the whole API surface, and you met both in exercise 02. It is
 * about the judgment call that sits underneath every agent you will sell:
 *
 *     HOW MUCH of the control flow do you hand to the model?
 *
 * Every other exercise in this module pushes one way — give the agent tools,
 * give it a loop, let it decide. This one is the counterweight. It runs the
 * SAME three requests through two systems and prints what each one did:
 *
 *     A. AGENT ROUTING     ToolLoopAgent with three tools; the model decides
 *                          which to call, and in what order, every step.
 *     B. WORKFLOW ROUTING  one classifier returns an enum; a `switch` you
 *                          wrote calls exactly one function.
 *
 * Watch three columns: the path taken, the number of model calls, and whether
 * the system did work nobody asked for. Run it twice — A's path can change
 * between runs on identical input. B's cannot.
 *
 * ── Three different things get called "routing" ───────────────────────────
 *   1. workflow router   — this file, system B. Model picks a LABEL, your
 *                          code picks the BRANCH.
 *   2. the agent loop    — this file, system A, and lib/agent.ts. Model picks
 *                          a TOOL, every step, until stopWhen.
 *   3. delegation        — exercise 16. A tool whose execute() is ANOTHER
 *                          agent's .generate(). That's the one for "route to
 *                          a different agent."
 *
 * So no, this is not how you delegate to another agent — that's 16. This is
 * how you decide whether the model gets to choose at all.
 */
import { ToolLoopAgent, generateText, tool, Output, isStepCount } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { CampaignBrief, RouteDecision } from "../lib/brief";
import { MODEL_ID, requireEnv, title, done } from "./_shared";

requireEnv("OPENAI_API_KEY");
title("12", "agent routing vs. workflow routing", "how much control flow do you hand to the model?");

// ── The same three units of work, shared by both systems ───────────────────
// Only the thing that DECIDES which of these runs is different.

let calls = 0;
let path: string[] = [];

async function research(request: string) {
  calls++;
  path.push("research");
  const r = await generateText({
    model: openai(MODEL_ID),
    prompt: `In 2 sentences with named sources: ${request}`,
    tools: { web_search: openai.tools.webSearch({ searchContextSize: "low" }) },
    stopWhen: isStepCount(3),
  });
  return r.text.trim().slice(0, 100);
}

async function writeBrief(request: string) {
  calls++;
  path.push("brief");
  const { output } = await generateText({
    model: openai(MODEL_ID),
    output: Output.object({ schema: CampaignBrief }),
    prompt: `Write a campaign brief for: ${request}`,
  });
  return output.campaign;
}

async function startImage(direction: string) {
  path.push("image");
  // Stubbed. In production this is 60-80 seconds and real money — which is
  // exactly why it matters whether something decided to call it on its own.
  return `job_${direction.slice(0, 6).replace(/\W/g, "")}`;
}

// ── SYSTEM A: the model routes ─────────────────────────────────────────────

const agent = new ToolLoopAgent({
  model: openai(MODEL_ID),
  instructions: "You are Muse Studio. Help the user with their campaign request.",
  tools: {
    research: tool({
      description: "Research a topic on the web and return sourced findings.",
      inputSchema: z.object({ topic: z.string() }),
      execute: ({ topic }) => research(topic),
    }),
    write_brief: tool({
      description: "Write a typed campaign brief.",
      inputSchema: z.object({ request: z.string() }),
      execute: ({ request }) => writeBrief(request),
    }),
    start_image: tool({
      description: "Start rendering the hero image. Takes 60-80 seconds.",
      inputSchema: z.object({ direction: z.string() }),
      execute: ({ direction }) => startImage(direction),
    }),
  },
  stopWhen: isStepCount(8),
});

// ── SYSTEM B: you route ────────────────────────────────────────────────────

async function workflowRoute(request: string) {
  calls++;
  const { output: decision } = await generateText({
    model: openai(MODEL_ID),
    output: Output.object({
      // Keep the classifier dumb: one enum, plus a sentence you can read when
      // it gets the label wrong.
      schema: RouteDecision.extend({ reasoning: z.string() }),
    }),
    prompt:
      `Classify this request.\n` +
      `"research" = they only want findings.\n` +
      `"brief" = they want a creative brief, no imagery.\n` +
      `"full-kit" = brief plus hero image.\n\nRequest: ${request}`,
  });

  // THE ROUTER. Ordinary TypeScript. The model cannot reach past this switch.
  switch (decision.route) {
    case "research":
      return research(request);
    case "brief":
      return writeBrief(request);
    case "full-kit": {
      const campaign = await writeBrief(request);
      return startImage(campaign);
    }
  }
}

// ── Run both, on identical input ───────────────────────────────────────────

const REQUESTS = [
  "What are people wearing to commute by bike this spring? Just the research.",
  "Write me a creative brief for a Muse x Scandinavian outerwear collab.",
  "Give me the full campaign kit for the outerwear collab, hero image included.",
];

const totals = { agent: { calls: 0, ms: 0 }, workflow: { calls: 0, ms: 0 } };

for (const request of REQUESTS) {
  console.log(`\n"${request}"`);

  calls = 0; path = [];
  let t0 = Date.now();
  const a = await agent.generate({ prompt: request });
  const agentMs = Date.now() - t0;
  // Each agent step is a model call, plus whatever the tools spent internally.
  const agentCalls = a.steps.length + calls;
  totals.agent.calls += agentCalls;
  totals.agent.ms += agentMs;
  console.log(`  A agent     path: ${path.join(" → ") || "(answered directly)"}`);
  console.log(`              ${agentCalls} model calls, ${(agentMs / 1000).toFixed(1)}s`);

  calls = 0; path = [];
  t0 = Date.now();
  await workflowRoute(request);
  const wfMs = Date.now() - t0;
  totals.workflow.calls += calls;
  totals.workflow.ms += wfMs;
  console.log(`  B workflow  path: classify → ${path.join(" → ")}`);
  console.log(`              ${calls} model calls, ${(wfMs / 1000).toFixed(1)}s`);
}

const ratio = (totals.agent.ms / Math.max(1, totals.workflow.ms)).toFixed(1);
console.log(`\n  totals    A agent     ${totals.agent.calls} calls / ${(totals.agent.ms / 1000).toFixed(1)}s`);
console.log(`            B workflow  ${totals.workflow.calls} calls / ${(totals.workflow.ms / 1000).toFixed(1)}s`);
console.log(`            same three requests, same three units of work — A took ${ratio}× the wall clock`);

console.log(`
  What you're looking at:

  · B's path is a straight line you can read off the source. A's path was
    chosen at runtime and you had to run it to find out. Run this file again —
    A may take a different route on the same input. B cannot.

  · Look at how many times A called the same tool. On the research-only
    request it is common to see "research → research → research → research":
    the model deciding, four separate times, that it wants more. Every one of
    those was a real search and a real invoice line. Nothing errored. Nobody
    asked for four. B did one, because one is what the code says.

  · Watch for A calling start_image on a request that never mentioned an
    image. When it happens that's 70 seconds and real money spent on work
    nobody asked for — and, again, no error anywhere.

  · Now the fair half: B can only ever handle the three kinds you enumerated.
    A request that doesn't fit falls through to a default you have to write.
    A handles requests you never anticipated — that's what you bought.

  The rule: route when you can name the kinds. Let the model route when you
  genuinely can't. Most client work can name the kinds, and most people reach
  for the agent anyway because it's more fun to build.
`);

done(
  "This isn't an SDK feature, it's the architecture decision the SDK makes easy\n" +
    "  to get wrong: every decision you hand the model buys flexibility and costs\n" +
    "  predictability. Spend that deliberately.",
);
