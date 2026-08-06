/**
 * 40 — Your agent, with a face.  →  npm run tui
 *
 * Everything so far printed once and exited. This is the same agent, running
 * as something you can actually talk to — and it is the artifact you leave with.
 *
 * ── What a runtime adds ───────────────────────────────────────────────────
 * `agent.generate()` gives you a string. A runtime gives you the loop, rendered:
 *
 *   · the conversation array, kept for you        (exercise 22, done automatically)
 *   · streaming text as it arrives                (exercise 01)
 *   · every tool call as an expandable section    (exercise 03 — press ↑↓ to open)
 *   · reasoning, foldable
 *   · tokens per second, and usage against the context window
 *
 * Nothing here is new capability. It's the same object from the same file,
 * driven by a different caller — which is the whole argument for defining the
 * agent as an object instead of scattering calls through your code.
 *
 * ── Deliberately one tool ─────────────────────────────────────────────────
 * One agent, one ability: research the web and report what it can source. That
 * is a product on its own — "ask it a question, get an answer with sources it
 * actually read" — and you can hand it to someone today.
 *
 * The five-tool version, wired to a database, a PDF renderer and Google Drive,
 * is Module 8b. Start here.
 *
 * ⚠️ `runAgentTUI` refuses an agent that uses structured output (`output:`) or
 * requires per-call options. Structured output belongs to pipelines; a chat
 * agent returns prose and calls tools.
 */
import "./_shared"; // loads .env.local
import { runAgentTUI } from "@ai-sdk/tui";
import { ToolLoopAgent, tool, isStepCount } from "ai";
import { openai } from "@ai-sdk/openai";
import { tavily } from "@tavily/core";
import { z } from "zod";
import { MODEL_ID, requireEnv } from "./_shared";

requireEnv("OPENAI_API_KEY");

// The one tool. Tavily if you have a key, OpenAI's hosted search if not —
// the agent cannot tell the difference, which is exercise 04's point.
const tvly = process.env.TAVILY_API_KEY
  ? tavily({ apiKey: process.env.TAVILY_API_KEY })
  : null;

const researchTools = tvly
  ? {
      web_research: tool({
        description:
          "Search the web for current, sourced information. Use whenever the " +
          "answer depends on facts you cannot verify from memory.",
        inputSchema: z.object({
          query: z.string().describe("The search query"),
        }),
        execute: async ({ query }) => {
          const res = await tvly.search(query, { searchDepth: "advanced", maxResults: 5 });
          // Trim before returning: everything here enters the context and you
          // pay for it again on every later step.
          return res.results.map((r) => ({
            title: r.title,
            url: r.url,
            content: r.content.slice(0, 600),
          }));
        },
      }),
    }
  : { web_research: openai.tools.webSearch({ searchContextSize: "low" }) };

const researchAgent = new ToolLoopAgent({
  model: openai(MODEL_ID),
  instructions:
    "You are a research assistant. Search before answering anything factual, " +
    "and name your sources inline. If you could not verify a claim, say so " +
    "rather than filling the gap. Answer in markdown, and be brief.",
  tools: researchTools,
  stopWhen: isStepCount(8), // the budget, in code
});

await runAgentTUI({
  title: tvly ? "Research Agent (Tavily)" : "Research Agent (OpenAI web search)",
  agent: researchAgent,
  tools: "auto-collapsed",     // 'full' | 'collapsed' | 'auto-collapsed' | 'hidden'
  reasoning: "auto-collapsed",
  responseStatistics: "outputTokensPerSecond",
  contextSize: 200_000,        // shows usage as a % of the window
});
