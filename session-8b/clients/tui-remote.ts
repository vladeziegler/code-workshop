/**
 * The same terminal UI — but this package has no agent, no key, and no
 * @ai-sdk/openai. Open package.json and check. All it knows is a URL.
 *
 *   SCOUT_URL=https://muse-scout-<you>.vercel.app npm run tui:remote
 */
import { runAgentTUI } from "@ai-sdk/tui";
import { DefaultChatTransport } from "ai";

const SCOUT_URL = process.env.SCOUT_URL;
if (!SCOUT_URL) {
  console.error("export SCOUT_URL=https://muse-scout-<you>.vercel.app first");
  process.exit(1);
}

await runAgentTUI({
  title: `Muse Scout (remote — ${SCOUT_URL})`,
  transport: new DefaultChatTransport({ api: `${SCOUT_URL}/api/chat` }),
  tools: "auto-collapsed",
  reasoning: "auto-collapsed",
});
