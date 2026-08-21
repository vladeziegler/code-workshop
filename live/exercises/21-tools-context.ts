/**
 * 21 — Tool context: one deployment, many clients.
 *
 * Look at lib/tools.ts as it stands today:
 *
 *     userId: process.env.COMPOSIO_USER_ID!
 *
 * That is a single global. It means this deployment can deliver to exactly one
 * client's Google Drive, forever. To serve a second client you'd deploy a
 * second copy of the whole app — which is not a product, it's a fork per
 * customer.
 *
 * `contextSchema` fixes it. The tool declares what it needs; the CALLER supplies
 * it per request via `toolsContext`; the SDK validates it before `execute` runs.
 * Each tool receives only its own context — never the whole map.
 *
 * Three rules worth saying out loud:
 *   · context is NOT in the prompt — the model cannot see, leak, or invent it
 *   · treat it as immutable inside the tool
 *   · secrets go here, not in the input schema, or the model gets to choose them
 */
import { ToolLoopAgent, tool, isStepCount } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { MODEL_ID, requireEnv, title, done } from "./_shared";

requireEnv("OPENAI_API_KEY");
title("21", "toolsContext + contextSchema", "per-client credentials, out of the prompt");

// The tool the model sees: one string in, a receipt out.
const deliverKit = tool({
  description:
    "Deliver the finished campaign kit to the client's Drive folder. " +
    "Use when the user asks to ship, send, or file the kit.",

  // What the MODEL supplies. Keep it to things the model should decide.
  inputSchema: z.object({
    fileName: z.string().describe("PDF file name, e.g. muse-spring-kit.pdf"),
  }),

  // What YOUR CODE supplies. The model never sees these and cannot set them.
  contextSchema: z.object({
    clientName: z.string(),
    composioUserId: z.string(),
    driveFolderId: z.string(),
  }),

  execute: async ({ fileName }, { context }) => {
    // In lib/tools.ts this is where the real Composio call goes. The only
    // change is `userId: context.composioUserId` instead of the env var.
    console.log(
      `    \x1b[2mwould upload ${fileName} → folder ${context.driveFolderId} ` +
        `as composio user ${context.composioUserId}\x1b[0m`,
    );
    return { delivered: true, client: context.clientName, file: fileName };
  },
});

// On a ToolLoopAgent, toolsContext is a CONSTRUCTOR setting — so an agent that
// serves many clients is a factory, called per request. The tools, instructions
// and budget are still written once; only the context varies.
type Client = { clientName: string; composioUserId: string; driveFolderId: string };

const makeStudioAgent = (client: Client) =>
  new ToolLoopAgent({
    model: openai(MODEL_ID),
    instructions:
      "You are Muse Studio. When asked to ship the kit, call deliver_kit with a " +
      "sensible kebab-case file name. Confirm in one line.",
    tools: { deliver_kit: deliverKit },
    toolsContext: {
      deliver_kit: client, // validated against contextSchema before execute runs
    },
    stopWhen: isStepCount(4),
  });

// Two clients. One definition. One deployment.
const CLIENTS: Client[] = [
  { clientName: "Nordwerk", composioUserId: "user_nordwerk", driveFolderId: "folder_nw_2026" },
  { clientName: "Halda", composioUserId: "user_halda", driveFolderId: "folder_hd_2026" },
];

for (const client of CLIENTS) {
  console.log(`\n  \x1b[1m${client.clientName}\x1b[0m`);
  const result = await makeStudioAgent(client).generate({
    prompt: "Ship the spring collab kit to our Drive, please.",
  });
  console.log(`  ${result.text.trim()}`);
}

console.log(
  `\n  \x1b[2mTry it: change composioUserId to a number and re-run. The SDK rejects it\n` +
    `  before your tool body executes — the same guarantee inputSchema gives you,\n` +
    `  applied to the half of the arguments the model isn't allowed to touch.\x1b[0m`,
);

done(
  "This is the line between a demo and a product. A demo has one client's id in\n" +
    "  an env var. A product takes it as an argument.",
);
