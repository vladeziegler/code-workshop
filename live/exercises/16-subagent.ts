/**
 * 16 — Delegation: an agent, wrapped in a tool.
 *
 * A tool's `execute` is just an async function. Nothing stops it from being
 * another agent's `.generate()`. That single fact gives you subagents.
 *
 * Why bother, when the main agent could just have the tools directly?
 *   · CONTEXT. The researcher's 12 search results never enter the main agent's
 *     history — only its summary does. The main loop stays cheap and legible.
 *   · BUDGETS. Each agent carries its own stopWhen. A runaway researcher can't
 *     spend the studio's whole allowance.
 *   · INSTRUCTIONS. "Never speculate" and "be persuasive" can't coexist in one
 *     system prompt. In two agents they can.
 *
 * Note `abortSignal` being passed through — cancel the parent, the child dies
 * too. Forget it and you keep paying for work nobody is waiting for.
 */
import { ToolLoopAgent, tool, isStepCount } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { MODEL_ID, REQUEST, requireEnv, title, step, done } from "./_shared";

requireEnv("OPENAI_API_KEY");
title("16", "subagent delegation", "an agent is a function — so it can be a tool");

// ── The specialist. Strict instructions, its own budget, its own tools. ──────
const researchSubagent = new ToolLoopAgent({
  model: openai(MODEL_ID),
  instructions:
    "You are a research agent. Search, then report ONLY what you can attribute " +
    "to a named source. Never speculate. Summarise your findings in your final " +
    "response — that summary is the only thing your caller will ever see.",
  tools: { web_search: openai.tools.webSearch({ searchContextSize: "low" }) },
  stopWhen: isStepCount(6), // its own budget, separate from the studio's
});

let subagentTokens = 0;

const researchTool = tool({
  description:
    "Research a topic in depth and return a sourced summary. Use this before " +
    "writing anything factual. Ask one clear question at a time.",
  inputSchema: z.object({
    task: z.string().describe("The research question, in full"),
  }),
  execute: async ({ task }, { abortSignal }) => {
    step("delegating", task.slice(0, 70));
    const result = await researchSubagent.generate({ prompt: task, abortSignal });
    subagentTokens += result.usage.totalTokens ?? 0;
    console.log(
      `      \x1b[2m↳ subagent used ${result.steps.length} steps and ` +
        `${result.usage.totalTokens} tokens — the parent will see only the summary\x1b[0m`,
    );
    return result.text;
  },
});

// ── The generalist. Knows nothing about searching; only how to delegate. ─────
const studioAgent = new ToolLoopAgent({
  model: openai(MODEL_ID),
  instructions:
    "You are Muse Studio's creative lead. You do not research directly — you " +
    "delegate to the research tool, then write. Be concise and specific.",
  tools: { research: researchTool },
  stopWhen: isStepCount(6),
});

const result = await studioAgent.generate({
  prompt: `Give me a sourced creative angle for this campaign: ${REQUEST}`,
});

console.log(`\n  ${result.text.trim()}\n`);
console.log(`  \x1b[2mparent: ${result.steps.length} steps, ${result.usage.totalTokens} tokens\x1b[0m`);
console.log(`  \x1b[2mchild:  ${subagentTokens} tokens — spent, but never in the parent's context\x1b[0m`);

done(
  "The sixth shape. Chain, route, fan out, orchestrate, loop — and delegate,\n" +
    "  when a step deserves its own instructions and its own budget.",
);
