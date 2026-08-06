/**
 * 03 — The agent gets a hand.
 *
 * A tool is a typed function plus a paragraph of prompt. The description IS the
 * prompt: it's the only thing the model reads when deciding whether to call it.
 *
 * The tool here reads YOUR database — the runs table your Session 6 scraper has
 * been writing. Nothing is mocked.
 */
import { ToolLoopAgent, tool, isStepCount } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { supabase } from "../lib/supabase";
import { MODEL_ID, requireEnv, title, step, done } from "./_shared";

requireEnv("OPENAI_API_KEY", "SUPABASE_URL", "SUPABASE_SERVICE_KEY");
title("03", "a tool, and the loop that calls it", "tool = typed function + a paragraph of prompt");

const recentRuns = tool({
  description:
    "List the most recent runs this system has logged. Use whenever the user " +
    "asks what has happened, what ran, or what the history looks like.",
  inputSchema: z.object({
    limit: z.number().max(20).describe("How many runs to return"),
  }),
  execute: async ({ limit }) => {
    step("tool executing", `recent_runs(limit=${limit})`);
    const { data } = await supabase()
      .from("runs")
      .select("id, kind, status, finished_at")
      .order("id", { ascending: false })
      .limit(limit);
    return data ?? [];
  },
});

const agent = new ToolLoopAgent({
  model: openai(MODEL_ID),
  instructions: "You are a terse operations assistant. Answer with numbers, not prose.",
  tools: { recent_runs: recentRuns },
  stopWhen: isStepCount(5), // the budget lives in code, not the prompt
});

const result = await agent.generate({
  prompt: "What are the last 5 things this system ran, and did any fail?",
});

console.log(`\n  ${result.text}\n`);
console.log(`  \x1b[2msteps: ${result.steps.length} (model → tool → model)\x1b[0m`);
done("You wrote the function. The model decided when to call it.");
