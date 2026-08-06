/**
 * 22 — Memory, level 1: the message array IS the memory.
 *
 * You have already seen an agent remember things — `npm run tui`, and the chat
 * box at localhost:3000. Nothing magic happened. This exercise is what's
 * underneath, written out by hand.
 *
 * ── The mechanism, complete ───────────────────────────────────────────────
 *
 *     const messages = [];
 *     messages.push({ role: "user", content: "…" });
 *     const r = await agent.generate({ messages });
 *     messages.push(...r.steps.at(-1).response.messages);   ← the whole trick
 *
 * A language model is stateless. It remembers nothing between calls. What
 * looks like memory is you re-sending the entire conversation every single
 * turn, and the model reading it fresh each time.
 *
 * Three consequences worth internalising, because all of them bite later:
 *
 *   1. Memory is not free and not constant — it costs input tokens, and the
 *      bill GROWS every turn. Watch the token column below.
 *   2. Anything not in the array does not exist. There is no hidden store.
 *   3. It lives in a variable. When this process exits, it's gone — which is
 *      exactly the problem exercise 23 solves.
 *
 * The script runs the same final question twice: once with the conversation,
 * once with an empty array. Same model, same question, same agent.
 */
import { ToolLoopAgent, isStepCount, type ModelMessage } from "ai";
import { openai } from "@ai-sdk/openai";
import { MODEL_ID, requireEnv, title, done } from "./_shared";

requireEnv("OPENAI_API_KEY");
title("22", "conversation memory", "the model is stateless — you re-send everything, every turn");

const agent = new ToolLoopAgent({
  model: openai(MODEL_ID),
  instructions: "You are Muse Studio's campaign assistant. Answer in one short sentence.",
  stopWhen: isStepCount(4),
});

// THE memory. A plain array. That's it.
const messages: ModelMessage[] = [];

async function say(text: string) {
  messages.push({ role: "user", content: text });

  const result = await agent.generate({ messages });

  // Append what the assistant said, so the next turn can see it. Forget this
  // line and the agent has amnesia while appearing to work perfectly.
  messages.push(...result.steps.at(-1)!.response.messages);

  console.log(`\n  you    ${text}`);
  console.log(`  agent  ${result.text.trim()}`);
  console.log(
    `         ${messages.length} messages in history · ` +
      `${result.steps.at(-1)!.usage.inputTokens} input tokens this turn`,
  );
  return result;
}

// ── A conversation. Each turn depends on the ones before it. ───────────────
await say("We're planning a spring collab with a Scandinavian outerwear label.");
await say("The audience is people who commute by bike in cold cities.");
await say("Give me one headline for it.");

// Turn 4 contains no nouns at all. It only works if the history is there.
const remembered = await say("Who did I say the audience was? Quote me.");

// ── The control: same question, empty history ──────────────────────────────
console.log(`\n  ── now the same question with no history ──`);
const amnesiac = await agent.generate({
  messages: [{ role: "user", content: "Who did I say the audience was? Quote me." }],
});
console.log(`\n  you    Who did I say the audience was? Quote me.`);
console.log(`  agent  ${amnesiac.text.trim()}`);
console.log(`         0 messages in history · ${amnesiac.steps.at(-1)!.usage.inputTokens} input tokens`);

console.log(`
  Same agent. Same model. Same question. The only difference is what was in
  the array — and notice the input token count, which is what memory costs.

  Turn 1 was cheap. Turn 4 paid for turns 1-3 all over again. That is why long
  conversations get expensive and eventually hit the context window, and why
  production systems summarise or prune old turns (the SDK ships pruneMessages
  for exactly this).

  Now the real limit: ${messages.length} messages are sitting in a local variable.
  Ctrl-C this script and the client's conversation is gone. Exercise 23.
`);

done(
  `The agent "remembered" because you re-sent ${messages.length} messages. There is no\n` +
    "  memory feature — there is an array you own, and a bill that grows with it.",
);

void remembered;
