// The socket, grown up. Still recognizably the three-line version from step
// 02 — what's been added is state (step 07) and CORS (step 05), both on the
// SERVICE side. No client changed for any of it.
import { createAgentUIStreamResponse } from "ai";
import type { UIMessage } from "ai";
import { createScoutAgent } from "@/lib/agent";
import { CORS_HEADERS, preflight } from "@/lib/cors";
import { listMemories, loadConversation, saveConversation } from "@/lib/store";

export const maxDuration = 300;

export const OPTIONS = preflight;

export async function POST(req: Request) {
  // `id` is useChat's chat id — the client names the conversation, the
  // service stores under that name. Any plug that says the same id gets the
  // same history.
  const { id, messages }: { id?: string; messages: UIMessage[] } = await req.json();

  // Durable facts first: memory that outlives every conversation.
  const memories = await listMemories();
  const agent = createScoutAgent({ memories });

  // Merge server-side history — but carefully. A browser that lived the
  // conversation already carries it (its ids overlap what we stored), and
  // re-sending stored copies alongside would duplicate provider items
  // (OpenAI 400: "Duplicate item found with id rs_…" — the saved assistant
  // message gets a different MESSAGE id than the client's copy, so per-id
  // dedupe can't catch it). Rule: any id overlap → the client is synced,
  // trust its history. No overlap → a fresh plug joining by id (TUI, curl,
  // second device) → prepend everything we remember.
  const stored = id ? await loadConversation(id) : [];
  const incoming = new Set(messages.map((m) => m.id));
  const clientIsSynced = stored.some((m) => incoming.has(m.id));
  const uiMessages = clientIsSynced ? messages : [...stored, ...messages];

  return createAgentUIStreamResponse({
    agent,
    uiMessages,
    sendSources: true,
    headers: CORS_HEADERS,
    onStepEnd({ stepNumber, usage, finishReason }) {
      console.log(`[scout] step ${stepNumber} · ${JSON.stringify(usage)} · ${finishReason}`);
    },
    // Save AFTER the stream finishes — the response message included.
    onFinish: async ({ messages: finalMessages }) => {
      if (id) await saveConversation(id, finalMessages);
    },
  });
}
