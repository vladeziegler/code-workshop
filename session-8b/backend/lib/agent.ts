// The whole agent. This is the file you hand-type — everything after it is delivery.
import { ToolLoopAgent, isStepCount, tool } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { addMemory } from "./store";
import { deepDiveTool } from "./jobs";

const INSTRUCTIONS =
  "You are Muse Scout, a research agent. Search before answering anything " +
  "factual, cite your sources inline, and say so when you could not verify " +
  "a claim. Answer in markdown, and be brief.";

export const scoutAgent = new ToolLoopAgent({
  model: openai("gpt-5.6-terra"),
  instructions: INSTRUCTIONS,
  tools: {
    web_search: openai.tools.webSearch({ searchContextSize: "low" }),
  },
  stopWhen: isStepCount(4),
});

// ── Step 07 grows the agent: durable memory ─────────────────────────────────
// Facts stored here outlive every conversation — that's what makes them
// memory rather than history. The route injects them back per request.
const rememberTool = tool({
  description:
    "Store a durable fact about the user or their preferences (name, role, " +
    "how they like answers). Use whenever the user tells you something worth " +
    "keeping beyond this conversation.",
  inputSchema: z.object({ fact: z.string().describe("The fact, stated plainly") }),
  execute: async ({ fact }) => addMemory(fact),
});

export function createScoutAgent({ memories = [] }: { memories?: string[] } = {}) {
  return new ToolLoopAgent({
    model: openai("gpt-5.6-terra"),
    instructions:
      memories.length === 0
        ? INSTRUCTIONS
        : `${INSTRUCTIONS}\n\nDurable facts you have saved about this user:\n${memories
            .map((m) => `- ${m}`)
            .join("\n")}`,
    tools: {
      web_search: openai.tools.webSearch({ searchContextSize: "low" }),
      remember: rememberTool,
      deep_dive: deepDiveTool, // step 08: slow work returns a ticket
    },
    stopWhen: isStepCount(4),
  });
}
