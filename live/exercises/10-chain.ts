/**
 * 10 — Sequential processing (chains).
 *
 * AI SDK pattern: "Sequential Processing"  —  ai-sdk.dev/docs/agents/workflows
 * The docs' reference example is generateMarketingCopy().
 *
 * Two calls. The output of the first is interpolated into the prompt of the
 * second. That interpolation — that one `${research}` — is the architecture.
 * Everything else in Part 3 is this rule applied four ways.
 *
 * Reach for a chain first, always. It never improvises, which is exactly why
 * you can debug it.
 */
import { generateText, Output, isStepCount } from "ai";
import { openai } from "@ai-sdk/openai";
import { CampaignBrief } from "../lib/brief";
import { MODEL_ID, REQUEST, requireEnv, title, step, done, ms } from "./_shared";

requireEnv("OPENAI_API_KEY");
title("10", "chain", "output keys are the wires");

// Step 1 — research. Output key: `research.text`
const t0 = Date.now();
step("step 1", "research the market");
const research = await generateText({
  model: openai(MODEL_ID),
  prompt: `In 4 sentences with named sources: market trends relevant to this campaign: ${REQUEST}`,
  tools: { web_search: openai.tools.webSearch({ searchContextSize: "low" }) },
  stopWhen: isStepCount(4),
});
console.log(`\n  \x1b[2m${research.text.trim().slice(0, 300)}…\x1b[0m\n`);

// Step 2 — the brief. The wire is on the line marked ←
step("step 2", "write the typed brief");
const { output: brief } = await generateText({
  model: openai(MODEL_ID),
  output: Output.object({ schema: CampaignBrief }),
  prompt: [
    `Write a campaign brief for: ${REQUEST}`,
    `Use only real facts from this research, and name the sources in \`facts\`:`,
    research.text, // ←──────────── THE WIRE
  ].join("\n\n"),
});

console.log(`\n  campaign  ${brief.campaign}`);
console.log(`  angle     ${brief.angle}`);
brief.facts.forEach((f) => console.log(`  fact      ${f}`));
console.log(`\n  \x1b[2mchain finished in ${ms(t0)}\x1b[0m`);

done("Messy prose in, typed object out. Clients buy this shape on its own.");
