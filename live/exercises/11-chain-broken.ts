/**
 * 11 — The unconnected wire.  ⚠️ THIS ONE LIES TO YOU AND DOESN'T ERROR.
 *
 * Exercise 10 with the research line deleted from the second prompt. That's it.
 * The research still runs. It still costs money. It just never arrives.
 *
 * Nothing throws. Nothing goes red. The pipeline is green and the brief is
 * confident and completely invented.
 *
 * Watch the `facts` array — the typed field is the only thing in the system
 * that will admit what happened. The creative confabulates; the schema confesses.
 */
import { generateText, Output, isStepCount } from "ai";
import { openai } from "@ai-sdk/openai";
import { CampaignBrief } from "../lib/brief";
import { MODEL_ID, REQUEST, requireEnv, title, step, ms } from "./_shared";

requireEnv("OPENAI_API_KEY");
title("11", "the wire, disconnected", "an unconnected wire doesn't error — it hallucinates");

const t0 = Date.now();
step("step 1", "research the market (runs, costs money, is then thrown away)");
const research = await generateText({
  model: openai(MODEL_ID),
  prompt: `In 4 sentences with named sources: market trends relevant to this campaign: ${REQUEST}`,
  tools: { web_search: openai.tools.webSearch({ searchContextSize: "low" }) },
  stopWhen: isStepCount(4),
});
console.log(`  \x1b[2m(${research.sources?.length ?? 0} sources found, and discarded)\x1b[0m\n`);

step("step 2", "write the brief — with no research in the prompt");
const { output: brief } = await generateText({
  model: openai(MODEL_ID),
  output: Output.object({ schema: CampaignBrief }),
  prompt: [
    `Write a campaign brief for: ${REQUEST}`,
    `Use only real facts from this research, and name the sources in \`facts\`:`,
    // research.text     ←──────── THE WIRE, COMMENTED OUT. No error. No warning.
  ].join("\n\n"),
});

console.log(`\n  campaign  ${brief.campaign}`);
console.log(`  angle     ${brief.angle}`);
console.log(`\n  \x1b[33mfacts — read these carefully:\x1b[0m`);
brief.facts.forEach((f) => console.log(`  \x1b[33m·\x1b[0m ${f}`));

console.log(`\n  \x1b[2mexit code 0. ${ms(t0)}. Pipeline "succeeded".\x1b[0m`);
console.log(
  `\n  \x1b[33m→ Diff this file against 10-chain.ts. One line. Only one of these\n` +
    `    two briefs survives a meeting with the client.\x1b[0m\n`,
);
