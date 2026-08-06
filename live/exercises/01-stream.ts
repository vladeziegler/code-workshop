/**
 * 01 — The same answer, arriving.
 *
 * Run 00 and 01 back to back. Same model, same latency to the *last* token —
 * completely different to sit through. That difference is the entire reason
 * the chat UI in this app streams.
 */
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { MODEL_ID, REQUEST, requireEnv, title, done, ms } from "./_shared";

requireEnv("OPENAI_API_KEY");
title("01", "streaming", "the response begins before it ends");

const t0 = Date.now();
let firstToken = 0;

const result = streamText({
  model: openai(MODEL_ID),
  prompt: `Write a short creative angle for this campaign: ${REQUEST}`,
});

process.stdout.write(" ---- ");
for await (const chunk of result.textStream) {
  if (!firstToken) firstToken = Date.now();
  process.stdout.write(chunk);
}
console.log("\n");

console.log(`  \x1b[2mfirst token at ${((firstToken - t0) / 1000).toFixed(1)}s · finished at ${ms(t0)}\x1b[0m`);
done("8 seconds of silence reads as broken. 8 seconds of typing reads as thinking.");
