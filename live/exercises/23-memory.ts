/**
 * 23 — Memory, level 2: state that survives the process.
 *
 * Exercise 22's memory lived in a local variable, which is fine until the
 * process exits — and on a serverless platform the process exits after every
 * single request. Your route handler does not get to keep an array between
 * turns. Nothing does. So conversational memory is a persistence problem, and
 * you already know how to solve persistence problems: it's a table.
 *
 * Two tables, two kinds of memory:
 *
 *   conversations   the message array, verbatim. SHORT-TERM: complete, and it
 *                   gets more expensive every turn because you re-send it all.
 *   memories        facts the agent decided to keep. LONG-TERM: small, curated,
 *                   cheap to inject, and it survives the transcript being
 *                   summarised or thrown away.
 *
 * This script proves it by simulating a crash: it loads from the database,
 * takes one turn, saves, then THROWS THE ARRAY AWAY and reloads from scratch
 * before the next turn. Every turn starts with an empty variable.
 *
 * ── And this is where context earns its keep ──────────────────────────────
 * `conversationId` reaches the memory tools through `contextSchema`, not
 * `inputSchema` — so the model can choose WHAT to remember but never WHOSE
 * memory to write it to. See the long comment in lib/memory.ts. That
 * distinction is decorative in a single-user demo and load-bearing the moment
 * you have two customers.
 */
import { ToolLoopAgent, isStepCount, type ModelMessage } from "ai";
import { openai } from "@ai-sdk/openai";
import {
  loadConversation, saveConversation, resetConversation, listMemories,
  rememberTool, recallTool,
} from "../lib/memory";
import { MODEL_ID, requireEnv, title, done } from "./_shared";

requireEnv("OPENAI_API_KEY", "SUPABASE_URL", "SUPABASE_SERVICE_KEY");
title("23", "persistent memory", "the process dies; the conversation doesn't");

// In a real app this is the client, the thread, the ticket. It comes from the
// REQUEST — a session cookie, a URL segment — never from the model.
const CONVERSATION_ID = "muse-demo";

// Reset so the exercise is repeatable. Real apps obviously don't do this.
await resetConversation(CONVERSATION_ID);

// The agent is built per turn, because toolsContext is a constructor setting
// and conversationId varies per request. Same factory shape as lib/agent.ts.
function makeAgent(conversationId: string, longTermMemory: string[]) {
  return new ToolLoopAgent({
    model: openai(MODEL_ID),
    instructions:
      "You are Muse Studio's campaign assistant. Answer in one or two short " +
      "sentences.\n" +
      "When the client states a durable preference or constraint, call remember. " +
      "Call recall before answering anything that depends on past decisions.\n" +
      (longTermMemory.length
        ? `Known facts about this client:\n${longTermMemory.map((f) => `- ${f}`).join("\n")}`
        : "You have no saved facts about this client yet."),
    tools: { remember: rememberTool, recall: recallTool },
    // The model cannot see, set, or argue with this.
    toolsContext: {
      remember: { conversationId },
      recall: { conversationId },
    },
    stopWhen: isStepCount(6),
  });
}

async function turn(text: string) {
  // ── Every turn starts from nothing but the database. ────────────────────
  const messages: ModelMessage[] = await loadConversation(CONVERSATION_ID);
  const facts = await listMemories(CONVERSATION_ID);
  console.log(`\n  [cold start] loaded ${messages.length} messages + ${facts.length} saved facts`);

  messages.push({ role: "user", content: text });
  const result = await makeAgent(CONVERSATION_ID, facts).generate({ messages });
  messages.push(...result.steps.at(-1)!.response.messages);

  await saveConversation(CONVERSATION_ID, messages);

  console.log(`  you    ${text}`);
  console.log(`  agent  ${result.text.trim()}`);
  // `messages` goes out of scope here. Nothing is retained in this process.
}

await turn("We're doing a spring collab with a Scandinavian outerwear label. Always avoid the word 'elevate' in our copy — I hate it.");
await turn("Give me a headline for the collab.");

console.log(`\n  ── simulating a redeploy: nothing in memory, new process, same tables ──`);

await turn("What was the word I told you never to use? And what collab are we doing?");

const facts = await listMemories(CONVERSATION_ID);
const stored = await loadConversation(CONVERSATION_ID);

console.log(`
  In the database right now:
    conversations["${CONVERSATION_ID}"]  ${stored.length} messages
    memories                        ${facts.length} fact(s)`);
facts.forEach((f) => console.log(`      · ${f}`));

console.log(`
  Every turn above began with an empty variable and ended with a write. The
  agent's continuity is entirely those two tables — which means it survives a
  deploy, scales across instances, and can be inspected, exported, corrected
  or deleted. Try doing any of that with an array in a running process.

  The two kinds of memory, and when each one wins:

    conversations   verbatim, complete, grows without bound. Re-sent in full
                    every turn, so it is also your biggest input-token line.
                    Eventually you prune or summarise it — the SDK ships
                    pruneMessages() for the pruning half.

    memories        one line per thing that mattered. Cheap enough to inject
                    into instructions forever, and it is what the agent still
                    knows after the transcript is gone.

  And the reason conversationId lives in contextSchema rather than inputSchema:
  with two customers, that single choice is the difference between a memory
  feature and a data breach.
`);

done(
  "Memory is not an SDK feature. It's an array you persist and a small set of\n" +
    "  facts you curate — scoped by a value the model is never allowed to choose.",
);
