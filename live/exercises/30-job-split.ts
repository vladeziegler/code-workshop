/**
 * 31 — The claim ticket: two agents, identical work, one can tell the truth.
 *
 * Some work takes longer than a reply. Research is the mild case (~20s); a
 * hero image is 70s; a scrape is minutes. In every case the agent has to say
 * something before the work is finished — and what it says depends entirely on
 * whether it kept a handle on the work.
 *
 * Both agents below start the SAME background research. The only difference is
 * one line inside one tool:
 *
 *   A. FLYING BLIND    start_research returns { started: true }
 *                      The job id is created and thrown away. There is no
 *                      check tool, because there is nothing to check with.
 *                      Ask "is it done?" and the agent has to guess.
 *
 *   B. CLAIM TICKET    start_research returns { job_id }
 *                      plus check_research, which reads the ledger by that id.
 *                      Ask "is it done?" and the agent reads a fact.
 *
 * ── Two tables, two meanings ──────────────────────────────────────────────
 *
 *     jobs = INTENT.  "somebody asked for this."   Written BEFORE the work.
 *     runs = FACT.    "this happened, here's how."  Written AFTER.
 *
 * check_research reads `runs`, never `jobs`. A queue row says "pending"
 * forever after a worker has quietly died. The ledger can only tell you what
 * actually occurred — which is why a failed job must STILL write a run.
 *
 * ⚠️ What a terminal script can't show you: here, "don't await it" is enough,
 * because the process stays alive. Inside a serverless route it is NOT — the
 * moment you return a response the platform may freeze your function
 * mid-flight. That's what `after()` does in lib/tools.ts (see
 * lib/background.ts). Same shape, one extra word, and without it your job
 * disappears in production with no error anywhere the browser can see.
 */
import { ToolLoopAgent, generateText, tool, isStepCount, type ModelMessage } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { supabase } from "../lib/supabase";
import { MODEL_ID, requireEnv, title, done } from "./_shared";

requireEnv("OPENAI_API_KEY", "SUPABASE_URL", "SUPABASE_SERVICE_KEY");
title("31", "jobs vs runs", "a claim ticket is what lets an agent tell the truth");

const sb = supabase();

// ── The background work. Identical for both agents. ────────────────────────
// Returns a job id immediately; the research happens after this function has
// already returned.
async function startResearchJob(topic: string): Promise<string> {
  // Idempotence, scoped to the topic: asking twice inserts one row, not two.
  const { data: pending } = await sb
    .from("jobs").select("id, created_at")
    .eq("kind", "research").eq("status", "pending").contains("payload", { topic })
    .order("created_at", { ascending: false }).limit(1);

  if (pending?.length) {
    const ageMs = Date.now() - new Date(pending[0].created_at).getTime();
    if (ageMs < 5 * 60_000) return pending[0].id;
    // Older than five minutes and still no run: nobody is coming back for it.
    // Reap it — and record the fact, because a job that vanished must still
    // leave a trace.
    await sb.from("jobs").update({ status: "failed" }).eq("id", pending[0].id);
    await sb.from("runs").insert({
      kind: "research", status: "failed", job_id: pending[0].id,
      error: "abandoned — no worker completed it", finished_at: new Date().toISOString(),
    });
  }

  const { data: job, error } = await sb
    .from("jobs").insert({ kind: "research", payload: { topic } }).select("id").single();
  if (error || !job) throw new Error(`could not enqueue: ${error?.message}`);

  // Not awaited. In a route this is wrapped in after().
  void (async () => {
    const t0 = Date.now();
    try {
      const r = await generateText({
        model: openai(MODEL_ID),
        instructions: "You are a research analyst. Report only what you can attribute to a named source.",
        prompt: `In 4 sentences with named sources: ${topic}`,
        tools: { web_search: openai.tools.webSearch({ searchContextSize: "low" }) },
        stopWhen: isStepCount(5),
      });
      // The FACT, written to the ledger. This is what check_research finds.
      await sb.from("runs").insert({
        kind: "research", status: "ok", job_id: job.id,
        finished_at: new Date().toISOString(),
        detail: { topic, findings: r.text, ms: Date.now() - t0 },
      });
      await sb.from("jobs").update({ status: "done" }).eq("id", job.id);
      console.log(`      [worker] job ${job.id.slice(0, 8)} finished in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
    } catch (e) {
      // A failed job MUST still write a run. Silence is the worst outcome:
      // the ticket exists, the work never lands, nothing errors visibly.
      const msg = e instanceof Error ? e.message : String(e);
      await sb.from("runs").insert({
        kind: "research", status: "failed", job_id: job.id, error: msg,
        finished_at: new Date().toISOString(),
      });
      await sb.from("jobs").update({ status: "failed" }).eq("id", job.id);
      console.log(`      [worker] job ${job.id.slice(0, 8)} FAILED: ${msg}`);
    }
  })();

  return job.id;
}

// ── AGENT A: flying blind ──────────────────────────────────────────────────

const blindAgent = new ToolLoopAgent({
  model: openai(MODEL_ID),
  instructions: "You are Muse Studio's research assistant. Answer in one or two short sentences.",
  tools: {
    start_research: tool({
      description: "Start researching a topic in the background. Takes about 20 seconds.",
      inputSchema: z.object({ topic: z.string() }),
      execute: async ({ topic }) => {
        const id = await startResearchJob(topic);
        console.log(`      [tool] job ${id.slice(0, 8)} started — and the id is discarded here`);
        return { started: true }; // ← THE ENTIRE DIFFERENCE. No handle escapes.
      },
    }),
    // No check tool. You cannot check what you cannot name.
  },
  stopWhen: isStepCount(6),
});

// ── AGENT B: claim ticket ──────────────────────────────────────────────────

const ticketAgent = new ToolLoopAgent({
  model: openai(MODEL_ID),
  instructions:
    "You are Muse Studio's research assistant. Answer in one or two short sentences.\n" +
    "When you start research, tell the user the job id. When they ask about " +
    "progress, ALWAYS call check_research first and report exactly what it says. " +
    "Never claim findings you have not read.",
  tools: {
    start_research: tool({
      description: "Start researching a topic in the background. Returns a job id. Takes about 20 seconds.",
      inputSchema: z.object({ topic: z.string() }),
      execute: async ({ topic }) => ({ job_id: await startResearchJob(topic) }),
    }),
    check_research: tool({
      description:
        "Check a research job by id. Returns its status, and the findings once ready.",
      inputSchema: z.object({ job_id: z.string() }),
      execute: async ({ job_id }) => {
        // Reads runs — the ledger of what happened. NEVER the jobs queue.
        const { data: run } = await sb
          .from("runs").select("status, detail, error").eq("job_id", job_id)
          .order("id", { ascending: false }).limit(1).maybeSingle();
        if (!run) return { status: "pending", note: "no run row yet — still working" };
        return run.status === "ok"
          ? { status: "ok", findings: (run.detail as { findings: string }).findings }
          : { status: "failed", error: run.error };
      },
    }),
  },
  stopWhen: isStepCount(6),
});

// ── Run both through the same conversation ─────────────────────────────────
// Multi-turn, so we carry the message array ourselves — exactly the mechanism
// from exercise 22. Without it, turn 2 wouldn't know a job id was ever issued.

/**
 * Takes a `generate` callback rather than an agent, so each call site keeps its
 * own fully-typed agent — the two agents have different tool sets, so they have
 * different types, and there's no honest way to pass them as one parameter.
 */
async function converse(
  label: string,
  turns: string[],
  generate: (messages: ModelMessage[]) => Promise<{
    text: string;
    steps: readonly {
      toolCalls?: readonly { toolName: string }[];
      response: { messages: ModelMessage[] };
    }[];
  }>,
  // Pass a previous conversation's array back in to CONTINUE it. That array is
  // how turn 3 still knows the job id it was handed in turn 1 — exercise 22's
  // mechanism, doing real work.
  history: ModelMessage[] = [],
) {
  console.log(`\n  ── ${label} ──`);
  const messages: ModelMessage[] = history;
  for (const text of turns) {
    messages.push({ role: "user", content: text });
    const r = await generate(messages);
    messages.push(...r.steps.at(-1)!.response.messages);
    const tools = r.steps.flatMap((s) => (s.toolCalls ?? []).map((t) => t.toolName));
    console.log(`  you    ${text}`);
    console.log(`  agent  ${r.text.trim()}`);
    console.log(`         tools used: ${tools.join(", ") || "none"}`);
  }
  return messages;
}

const TOPIC = "what cyclists want from spring commuter outerwear in 2026";
const ASK = "Is the research done? What did it find?";

await converse("A. flying blind", [`Research ${TOPIC}.`, ASK], (messages) =>
  blindAgent.generate({ messages }),
);

const ticketHistory = await converse(
  "B. claim ticket",
  [`Research ${TOPIC}.`, ASK],
  (messages) => ticketAgent.generate({ messages }),
);

console.log(`\n  waiting for the background work to land…`);
await new Promise((r) => setTimeout(r, 25_000));

// Same conversation continued — so the agent still has the job id from turn 1.
await converse(
  "B. claim ticket, same conversation, once the work has landed",
  ["How about now?"],
  (messages) => ticketAgent.generate({ messages }),
  ticketHistory,
);

console.log(`
  Read the "tools used" lines, then read the [worker] timestamps.

  A answered the research question immediately and fluently — before its own
  background job had finished. Compare when its answer appeared with when
  "[worker] job … finished" printed. Everything it said came from the model's
  memory, not from the research it had just commissioned. Then, asked whether
  the research was done, it used NO tools: it had none to use, so it improvised
  a status.

  Nothing errored. The research really ran. The answer just had nothing to do
  with it — and there was no way for the agent, or the user, to notice.

  B called check_research both times and reported what the ledger said:
  pending while the worker ran, findings once the run row existed. Note the
  third turn is the SAME conversation — the job id came from the message
  history, which is why "How about now?" is a complete sentence.

  That's the argument for a claim ticket, and it isn't about latency: both
  agents replied instantly. A job id is the difference between an agent that
  reports status and an agent that performs confidence.
`);

done(
  "jobs is intent · runs is fact · check reads facts.\n" +
    "  Hand back a ticket, not a promise — then you can be asked to prove it.",
);
