/**
 * 02 — Prose out, object in.
 *
 * Zod is Pydantic. `Output.object` is the AI SDK's way of saying "don't hand me
 * a paragraph, hand me this shape" — and it validates before you ever see it.
 *
 * NOTE for anyone reading older tutorials: this used to be `generateObject`.
 * That function is deprecated as of AI SDK v6. The shape is now
 * `generateText({ output: Output.object({ schema }) })` and you read `.output`,
 * not `.object`. Same idea, new name — this is the version we teach.
 */
import { generateText, Output } from "ai";
import { openai } from "@ai-sdk/openai";
import { CampaignBrief } from "../lib/brief";
import { MODEL_ID, REQUEST, requireEnv, title, done, ms } from "./_shared";

requireEnv("OPENAI_API_KEY");
title("02", "structured output", "typed joints — Output.object + Zod");

const t0 = Date.now();
const { output } = await generateText({
  model: openai(MODEL_ID),
  output: Output.object({ schema: CampaignBrief }),
  prompt: `Write a campaign brief for: ${REQUEST}`,
});

// `output` is typed. Autocomplete works. A missing field would have thrown.
console.log(`  campaign   ${output.campaign}`);
console.log(`  audience   ${output.audience}`);
console.log(`  angle      ${output.angle}`);
output.headlines.forEach((h, i) => console.log(`  headline ${i + 1} ${h}`));
console.log(`  facts      ${output.facts.length} listed`);
console.log(`\n  \x1b[2m${ms(t0)}\x1b[0m`);

done("A schema is a contract with a model that can't argue. Type the joints.");
