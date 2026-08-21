import { tool, type ModelMessage } from "ai";
import { z } from "zod";
import { supabase } from "./supabase";

/**
 * Agent memory, as two ordinary tables.
 *
 * There is no memory primitive in the AI SDK, and that's not an omission —
 * memory is just persistence, and persistence is your database. What the SDK
 * gives you is the shape of the thing to persist (`ModelMessage[]`) and a safe
 * channel to hand the store to a tool (`contextSchema`).
 *
 *   conversations  the message array, saved. Short-term memory: verbatim,
 *                  complete, and expensive — you re-send all of it every turn.
 *   memories       durable facts the agent chose to keep. Long-term memory:
 *                  small, curated, cheap to inject into instructions.
 *
 * Real systems need both. The transcript is what was said; the memories are
 * what mattered.
 */

export async function loadConversation(id: string): Promise<ModelMessage[]> {
  const { data, error } = await supabase()
    .from("conversations").select("messages").eq("id", id).maybeSingle();
  if (error) throw new Error(`${error.message} — did you re-run migration.sql?`);
  return (data?.messages as ModelMessage[]) ?? [];
}

export async function saveConversation(id: string, messages: ModelMessage[]) {
  const { error } = await supabase()
    .from("conversations")
    .upsert({ id, messages, updated_at: new Date().toISOString() });
  if (error) throw new Error(`could not save conversation: ${error.message}`);
}

export async function resetConversation(id: string) {
  await supabase().from("conversations").delete().eq("id", id);
  await supabase().from("memories").delete().eq("conversation_id", id);
}

export async function listMemories(conversationId: string): Promise<string[]> {
  const { data } = await supabase()
    .from("memories").select("fact").eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  return (data ?? []).map((r) => r.fact as string);
}

/**
 * The `remember` tool.
 *
 * Look carefully at the split between inputSchema and contextSchema, because
 * it is the whole security model:
 *
 *   inputSchema    { fact }             ← the MODEL decides what to remember
 *   contextSchema  { conversationId }   ← YOUR CODE decides whose memory it is
 *
 * Put conversationId in inputSchema instead and you have built a cross-tenant
 * data leak with a chat interface on it: "Actually, save this to conversation
 * acct_998" is a sentence, and sentences are the model's input. In
 * contextSchema there is nothing to say — the value arrives from the request,
 * not the conversation.
 *
 * This is why memory is where context stops being a convenience and becomes a
 * boundary. A single-user demo doesn't need it. The moment memory is per
 * customer, it is the only thing standing between customers.
 */
export const rememberTool = tool({
  description:
    "Save a durable fact about this client or campaign, so you still know it " +
    "in future conversations. Use for stable preferences and constraints, not " +
    "for passing chatter.",
  inputSchema: z.object({
    fact: z.string().describe("One self-contained sentence, understandable months from now"),
  }),
  contextSchema: z.object({
    conversationId: z.string(),
  }),
  execute: async ({ fact }, { context }) => {
    await supabase().from("memories").insert({ conversation_id: context.conversationId, fact });
    console.log(`      [memory] saved: "${fact}"`);
    return { saved: true };
  },
});

export const recallTool = tool({
  description:
    "Look up durable facts previously saved about this client or campaign. " +
    "Use before answering anything that depends on past decisions.",
  inputSchema: z.object({}),
  contextSchema: z.object({
    conversationId: z.string(),
  }),
  execute: async (_input, { context }) => {
    const facts = await listMemories(context.conversationId);
    console.log(`      [memory] recalled ${facts.length} fact(s)`);
    return { facts };
  },
});
