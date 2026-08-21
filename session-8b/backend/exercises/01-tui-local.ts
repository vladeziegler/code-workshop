/**
 * 01 — The whole agent, in your terminal.  →  npm run tui
 *
 * No server. No HTTP. The agent is a library: `runAgentTUI` imports the same
 * object the route will serve tomorrow, and drives it in-process.
 *
 * Ask it something that happened after the model's cutoff — watch it decide,
 * unscripted, to search.
 */
import "./_shared";
import { requireEnv } from "./_shared";
import { runAgentTUI } from "@ai-sdk/tui";
import { scoutAgent } from "../lib/agent";

requireEnv("OPENAI_API_KEY");

await runAgentTUI({
  title: "Muse Scout (local — no server anywhere)",
  agent: scoutAgent,
  tools: "auto-collapsed",
  reasoning: "auto-collapsed",
  responseStatistics: "outputTokensPerSecond",
  contextSize: 200_000,
});
