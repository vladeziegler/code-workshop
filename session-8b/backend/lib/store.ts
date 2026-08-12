// State belongs to the service. This is the service's memory — the browser
// keeps nothing but the conversation id it minted.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { UIMessage } from "ai";

// No generated DB types here on purpose — the tables are four small shapes in
// migration.sql, and `any` keeps the workshop focused on the wire, not codegen.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let client: SupabaseClient<any, any, any> | null = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function supabase(): SupabaseClient<any, any, any> {
  if (!client) {
    client = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);
  }
  return client;
}

export async function loadConversation(id: string): Promise<UIMessage[]> {
  const { data } = await supabase()
    .from("scout_conversations")
    .select("messages")
    .eq("id", id)
    .maybeSingle();
  return (data?.messages as UIMessage[]) ?? [];
}

export async function saveConversation(id: string, messages: UIMessage[]) {
  const firstUser = messages.find((m) => m.role === "user");
  const title =
    firstUser?.parts
      .filter((p) => p.type === "text")
      .map((p) => (p as { text: string }).text)
      .join(" ")
      .slice(0, 80) || "Untitled";
  const { error } = await supabase().from("scout_conversations").upsert({
    id,
    title,
    messages: messages as unknown as object,
    updated_at: new Date().toISOString(),
  });
  if (error) console.error("[store] saveConversation:", error.message);
}

export async function listConversations() {
  const { data } = await supabase()
    .from("scout_conversations")
    .select("id, title, updated_at")
    .order("updated_at", { ascending: false })
    .limit(30);
  return data ?? [];
}

export async function listMemories(): Promise<string[]> {
  const { data } = await supabase()
    .from("scout_memories")
    .select("fact")
    .order("created_at", { ascending: true })
    .limit(50);
  return (data ?? []).map((r) => String(r.fact));
}

export async function addMemory(fact: string) {
  const { error } = await supabase().from("scout_memories").insert({ fact });
  if (error) console.error("[store] addMemory:", error.message);
  return { remembered: fact };
}
