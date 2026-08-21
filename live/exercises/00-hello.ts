/**
 * 00 — One call, one answer.
 *
 * The smallest thing the AI SDK does: a provider, a prompt, a string back.
 * If this fails, nothing else in the module will — run it first.
 */
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { MODEL_ID, requireEnv, title, done, ms } from "./_shared";

requireEnv("OPENAI_API_KEY");
title("00", "hello, model", "the unified provider call — one import, one function");

const t0 = Date.now();
const result = await generateText({
  model: openai(MODEL_ID),
  prompt: "In one sentence: what is a campaign brief?",
});

console.log(`  ${result.text}\n`);
console.log(`  \x1b[2min ${result.usage.inputTokens} tok · out ${result.usage.outputTokens} tok · ${ms(t0)}\x1b[0m`);
done("Your key works. Every other exercise is this call with more structure.");
