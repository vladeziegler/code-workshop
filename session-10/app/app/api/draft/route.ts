// POST /api/draft — the Draft button kicks off an agent on the server.
// The agent writes the email AND files it as a real draft in the connected Gmail
// (via a Composio tool) — so the payoff is visible in the Drafts folder, not just
// on screen. Reasoning and tool activity stream back into the panel as they happen.
import { openai } from "@ai-sdk/openai";
import { Composio } from "@composio/core";
import { ToolLoopAgent, createAgentUIStreamResponse, isStepCount, tool } from "ai";
import { readFileSync } from "fs";
import { join } from "path";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase";

export const maxDuration = 300;

const HOUSE_RULES = readFileSync(join(process.cwd(), "instructions.md"), "utf-8");
const GMAIL_VERSION = "20260815_00";

const composio = new Composio({ apiKey: process.env.COMPOSIO_API_KEY! });

const createGmailDraft = tool({
  description:
    "File the finished email as a draft in our Gmail Drafts folder, addressed to the contact. Call this exactly once, after you have written the email.",
  inputSchema: z.object({
    to: z.string().describe("The contact's email address"),
    subject: z.string().describe("A short, specific subject line"),
    body: z.string().describe("The full email body, plain text"),
  }),
  execute: async ({ to, subject, body }) => {
    const result = await composio.tools.execute("GMAIL_CREATE_EMAIL_DRAFT", {
      userId: process.env.COMPOSIO_USER_ID!,
      version: GMAIL_VERSION,
      arguments: { recipient_email: to, subject, body },
    });
    if (!result.successful) {
      throw new Error(`Gmail draft failed: ${result.error}`);
    }
    const data = (result.data ?? {}) as { response_data?: { id?: string }; id?: string };
    const id = data.response_data?.id ?? data.id;
    return { ok: true, draft_id: id, note: "Draft saved to the Gmail Drafts folder." };
  },
});

export async function POST(req: Request) {
  const { id, messages } = await req.json();

  const sb = supabaseServer();
  const { data: lead, error } = await sb
    .from("aria_account")
    .select("*, aria_people(*), aria_news(*)")
    .eq("id", id)
    .single();
  if (error || !lead) {
    return new Response(JSON.stringify({ error: "lead not found" }), { status: 404 });
  }

  const contact = lead.aria_people[0];
  const agent = new ToolLoopAgent({
    model: openai("gpt-5.6-terra"),
    instructions: [
      HOUSE_RULES,
      "\n## This lead\n",
      `Company: ${lead.name ?? lead.domain} (${lead.domain})`,
      `Employees: ${lead.employees_count ?? "unknown"} · US-based: ${lead.us_based ?? "unknown"}`,
      `Premium score: ${lead.premium_score}/5 · lead quality: ${lead.lead_quality}/5 · AI response: ${lead.response}`,
      `Contacts: ${lead.aria_people.map((p: { full_name: string | null; role: string | null; email: string; request: string | null }) => `${p.full_name ?? "?"} (${p.role ?? "?"}) <${p.email}> — asked: ${p.request ?? "?"}`).join("; ")}`,
      `Research: ${lead.aria_news.map((n: { fact: string }) => n.fact).join(" · ")}`,
      "\n## Your job\n",
      "Write the email per the rules above, show it in your reply, then call",
      `create_gmail_draft once to file it, addressed to ${contact?.email ?? "the contact"}.`,
      "End with one short line confirming the draft is in the Drafts folder.",
    ].join("\n"),
    tools: { create_gmail_draft: createGmailDraft },
    stopWhen: isStepCount(4),
    providerOptions: { openai: { reasoningSummary: "auto" } },
  });

  return createAgentUIStreamResponse({ agent, uiMessages: messages, sendReasoning: true });
}
