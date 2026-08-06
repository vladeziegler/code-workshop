/**
 * 06 — Make the loop tell you what it did.
 *
 * An agent is a black box that eventually returns a string. Callbacks open it.
 *
 * ── The whole idea, in three lines ────────────────────────────────────────
 *
 *     await agent.generate({
 *       prompt: "…",
 *       onStepEnd: (step) => console.log(step.usage.totalTokens),
 *     });
 *
 * That's it. You pass functions alongside the prompt; the SDK calls them as the
 * loop runs. Below is the same thing with all six, so you can see when each one
 * fires and what it hands you.
 *
 * ── Where they attach ─────────────────────────────────────────────────────
 * PER CALL, not on the agent — the mirror image of context:
 *
 *     new ToolLoopAgent({ tools, stopWhen, toolsContext })   ← what it IS
 *     agent.generate({ prompt, onStepEnd, onEnd })           ← what you WATCH
 *
 * So one agent definition can have three different observers: a script that
 * prints, a route that writes rows to `runs`, a test that asserts "never more
 * than 3 steps". No conditionals inside the agent.
 *
 * (Tutorials showing `experimental_onStart` or `onFinish` are out of date —
 * those are the deprecated aliases now.)
 */
import { ToolLoopAgent, tool, isStepCount } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { supabase } from "../lib/supabase";
import { MODEL_ID, requireEnv, title, done } from "./_shared";

requireEnv("OPENAI_API_KEY", "SUPABASE_URL", "SUPABASE_SERVICE_KEY");
title("06", "lifecycle callbacks", "observability — the loop is countable");

const agent = new ToolLoopAgent({
  model: openai(MODEL_ID),
  instructions: "You are a terse operations assistant.",
  tools: {
    // runs in THIS process
    recent_runs: tool({
      description: "List the most recent runs this system has logged.",
      inputSchema: z.object({ limit: z.number().max(20) }),
      execute: async ({ limit }) => {
        const { data } = await supabase()
          .from("runs").select("id, kind, status").order("id", { ascending: false }).limit(limit);
        return data ?? [];
      },
    }),
    // runs on OPENAI'S servers
    web_search: openai.tools.webSearch({ searchContextSize: "low" }),
  },
  stopWhen: isStepCount(6),
});

const result = await agent.generate({
  prompt:
    "Summarise the last 5 runs of this system, then tell me one current trend " +
    "in AI agent observability. Keep it to four lines.",

  // once, before anything happens
  onStart({ modelId }) {
    console.log(`onStart          model=${modelId}`);
  },

  // before every model call — a good place to enforce your own ceiling
  onStepStart({ stepNumber }) {
    console.log(`  onStepStart    step ${stepNumber}`);
  },

  // just before a tool's execute() runs
  onToolExecutionStart({ toolCall }) {
    console.log(`    toolStart    ${toolCall.toolName}`);
  },

  // just after it returns — toolExecutionMs is measured for you
  onToolExecutionEnd({ toolCall, toolExecutionMs, toolOutput }) {
    console.log(`    toolEnd      ${toolCall.toolName} ${Math.round(toolExecutionMs)}ms ${toolOutput.type}`);
  },

  // after every model call. THIS is the one you wire into your runs table.
  onStepEnd({ stepNumber, usage, performance, finishReason, toolCalls }) {
    console.log(
      `  onStepEnd      step ${stepNumber}`,
      `| ${usage.inputTokens} in, ${usage.outputTokens} out`,
      `| ${Math.round(performance.stepTimeMs)}ms`,
      `| ${finishReason}`,
      `| tools: ${toolCalls?.map((t) => t.toolName).join(",") || "none"}`,
    );
  },

  // once, at the end — totals for the whole run
  onEnd({ usage, steps }) {
    console.log(`onEnd            ${steps.length} steps, ${usage.totalTokens} tokens total`);
  },
});

console.log(`\n  answer: ${result.text.split("\n")[0]}\n`);

console.log(`  Two things to notice in the trace above:

  1. The order. onStart wraps everything; onStepStart/onStepEnd wrap each
     model call; the tool callbacks nest inside a step.

  2. Step 1 called web_search — you can see it in onStepEnd's tool list — but
     it produced NO toolStart/toolEnd lines. That tool ran on OpenAI's servers,
     so there was nothing here to time. recent_runs, which runs in your
     process, got both. Exercise 04's lesson, visible in your telemetry.
`);

done(
  "Per-step cost and per-tool latency, without writing a single Date.now().\n" +
    '  This is how you answer "what does one campaign kit cost?" before a client asks.',
);
