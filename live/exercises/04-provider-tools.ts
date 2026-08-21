/**
 * 05 — Who actually runs the tool?
 *
 * There are four kinds of tool in the AI SDK, and the axis that matters is
 * WHERE THE CODE RUNS:
 *
 *   function tool        you define it, YOUR server executes it   (exercise 03)
 *   dynamic tool         same, but shape unknown until runtime     (MCP, plugins)
 *   provider-defined     provider defines the schema, you execute  (anthropic.bash)
 *   provider-executed    provider defines AND runs it              (openai webSearch)
 *
 * Same question, asked twice:
 *
 *   A. openai.tools.webSearch — PROVIDER-EXECUTED. The search happens inside
 *      OpenAI's infrastructure. You never see an HTTP request, can't log it,
 *      can't cache it, can't swap the engine. It arrives working.
 *
 *   B. Tavily, wrapped in your own `tool()` — a FUNCTION TOOL around a third-
 *      party API. Eight lines, and you own all of it: the schema, the result
 *      shape, the latency, the retry policy, the bill.
 *
 * B is the shape most client work actually takes. Any API with a JS client
 * becomes an agent capability exactly this way — their internal search, their
 * CRM, their inventory system. Tavily is just a legible example.
 *
 * Needs TAVILY_API_KEY in .env.local. Free tier at tavily.com.
 */
import { generateText, tool, isStepCount } from "ai";
import { openai } from "@ai-sdk/openai";
import { tavily } from "@tavily/core";
import { z } from "zod";
import { MODEL_ID, requireEnv, title, step, done, ms } from "./_shared";

requireEnv("OPENAI_API_KEY");
title("05", "provider-executed vs. your own function tool", "the four tool types — and who executes them");

const QUESTION = "What are two named 2026 trends in technical outerwear? Cite the sources by name.";

// ── A. Provider-executed: the search happens inside OpenAI's infrastructure ──
step("provider-executed", "openai.tools.webSearch — runs on OpenAI's servers");
const a0 = Date.now();
const a = await generateText({
  model: openai(MODEL_ID),
  prompt: QUESTION,
  tools: { web_search: openai.tools.webSearch({ searchContextSize: "low" }) },
  stopWhen: isStepCount(4),
});
console.log(`\n  ${a.text.trim().slice(0, 380)}\n`);
console.log(`  \x1b[2m${a.sources?.length ?? 0} sources · ${ms(a0)} · billed by OpenAI (~$10/1k calls)\x1b[0m`);
console.log(`  \x1b[2mwhat you can log about that search: nothing. It's a black box.\x1b[0m\n`);

// ── B. Your own function tool, wrapping a third-party API ───────────────────
if (!process.env.TAVILY_API_KEY) {
  console.log("  \x1b[2m(set TAVILY_API_KEY in .env.local to run the second half)\x1b[0m");
} else {
  const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

  // This is the whole integration. Note what you get to decide here that you
  // didn't in half A: the description, the arguments the model may pass, the
  // search depth, and — critically — the SHAPE of what comes back.
  const tavilySearch = tool({
    description:
      "Search the web for current, sourced information. Use whenever the " +
      "answer depends on facts you cannot verify from memory.",
    inputSchema: z.object({
      query: z.string().describe("The search query"),
    }),
    execute: async ({ query }) => {
      const res = await tvly.search(query, { searchDepth: "advanced", maxResults: 5 });
      // Trimming here is a real design decision, not tidiness: everything you
      // return enters the model's context and you pay for it again on every
      // subsequent step. Return the three fields that matter, not the payload.
      return res.results.map((r) => ({
        title: r.title,
        url: r.url,
        content: r.content.slice(0, 600),
      }));
    },
  });

  step("your function tool", "@tavily/core — runs here, on your key");
  const b0 = Date.now();
  const b = await generateText({
    model: openai(MODEL_ID),
    prompt: QUESTION,
    tools: { tavily_search: tavilySearch },
    stopWhen: isStepCount(4),

    // You can only write these two callbacks for a tool that runs in YOUR
    // process. Half A gives you nothing to hook.
    onToolExecutionStart({ toolCall }) {
      console.log(`  \x1b[2m  ↳ calling ${toolCall.toolName}(${JSON.stringify(toolCall.input)})\x1b[0m`);
    },
    onToolExecutionEnd({ toolCall, toolExecutionMs, toolOutput }) {
      const out = (toolOutput as { output?: unknown }).output;
      const n = Array.isArray(out) ? out.length : 0;
      console.log(
        `  \x1b[2m  ↳ ${toolCall.toolName} returned ${n} results in ${Math.round(toolExecutionMs)}ms\x1b[0m`,
      );
    },
  });

  console.log(`\n  ${b.text.trim().slice(0, 380)}\n`);
  console.log(`  \x1b[2m${ms(b0)} · billed by Tavily · every request loggable, cacheable, swappable\x1b[0m`);
}

done(
  "Portability, billing, observability and cost control all follow from one\n" +
    "  question: whose machine executes the function? Half A is faster to write.\n" +
    "  Half B is the one you can debug at 2am for a client.",
);
