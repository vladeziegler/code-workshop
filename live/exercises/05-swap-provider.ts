/**
 * 07 — The one-line swap, actually performed.
 *
 * The pitch for the AI SDK is that the provider is an import. This exercise
 * runs the identical agent definition — same instructions, same tool, same
 * stopWhen — against OpenAI and Anthropic, and diffs nothing but the model line.
 *
 * Set ANTHROPIC_API_KEY to see both halves. Without it you'll see the OpenAI
 * half and the exact one-line diff you'd make.
 */
import { ToolLoopAgent, tool, isStepCount, type LanguageModel } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { MODEL_ID, REQUEST, requireEnv, title, done, ms } from "./_shared";

requireEnv("OPENAI_API_KEY");
title("07", "swapping providers", "the model is an argument, not an architecture");

// Everything except the model. Written once, used twice.
function studioAgent(model: LanguageModel) {
  return new ToolLoopAgent({
    model,
    instructions: "You are Muse Studio. Be concise. Use the brand voice tool before answering.",
    tools: {
      brand_voice: tool({
        description: "Get the Muse brand voice rules. Call before writing anything.",
        inputSchema: z.object({}),
        execute: async () => ({
          tone: "understated, technical, never exclamatory",
          banned: ["elevate", "unleash", "game-changing"],
        }),
      }),
    },
    stopWhen: isStepCount(4),
  });
}

const prompt = `Write one campaign headline for: ${REQUEST}`;

const t0 = Date.now();
const a = await studioAgent(openai(MODEL_ID)).generate({ prompt });
console.log(`  \x1b[1mopenai(${MODEL_ID})\x1b[0m`);
console.log(`  ${a.text.trim()}`);
console.log(`  \x1b[2m${a.steps.length} steps · ${ms(t0)}\x1b[0m\n`);

if (!process.env.ANTHROPIC_API_KEY) {
  console.log("  \x1b[2m(set ANTHROPIC_API_KEY to run the Anthropic half)\x1b[0m");
  console.log("  \x1b[2mThe entire diff would be:\x1b[0m");
  console.log('  \x1b[31m- studioAgent(openai("gpt-5.6-terra"))\x1b[0m');
  console.log('  \x1b[32m+ studioAgent(anthropic("claude-opus-5"))\x1b[0m');
} else {
  const { anthropic } = await import("@ai-sdk/anthropic");
  const t1 = Date.now();
  const b = await studioAgent(anthropic("claude-opus-5")).generate({ prompt });
  console.log(`  \x1b[1manthropic(claude-opus-5)\x1b[0m`);
  console.log(`  ${b.text.trim()}`);
  console.log(`  \x1b[2m${b.steps.length} steps · ${ms(t1)}\x1b[0m`);
}

done(
  "Same tool, same loop, same stop condition, two vendors. This is the reason\n" +
    "  to define the agent as an object instead of scattering calls through routes.",
);
