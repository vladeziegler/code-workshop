// Slow work returns a ticket.
//
// The tool answers in milliseconds with a job id (intent, scout_jobs). The
// actual research runs AFTER the reply, via next/server's after() — inside
// the same function budget, which is exactly the ceiling Module 9 removes.
// The finished report lands in scout_runs (fact). Jobs = intent, runs = fact.
import { tool, generateText, isStepCount } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { after } from "next/server";
import { supabase } from "./store";

function background(work: () => Promise<void>) {
  try {
    after(work);
  } catch {
    void work(); // outside a request scope (scripts/TUI): float it
  }
}

async function runDeepDive(jobId: string, topic: string) {
  const sb = supabase();
  await sb.from("scout_jobs").update({ status: "running" }).eq("id", jobId);
  try {
    const { text } = await generateText({
      model: openai("gpt-5.6-terra"),
      tools: { web_search: openai.tools.webSearch({ searchContextSize: "low" }) },
      stopWhen: isStepCount(6),
      prompt:
        `Research this thoroughly with multiple searches, then write a ~250 word ` +
        `brief with inline source URLs. Topic: ${topic}`,
    });
    await sb.from("scout_runs").insert({ job_id: jobId, kind: "deep_dive", status: "done", detail: text });
    await sb.from("scout_jobs").update({ status: "done" }).eq("id", jobId);
  } catch (err) {
    await sb
      .from("scout_runs")
      .insert({ job_id: jobId, kind: "deep_dive", status: "failed", detail: String(err) });
    await sb.from("scout_jobs").update({ status: "failed" }).eq("id", jobId);
  }
}

export const deepDiveTool = tool({
  description:
    "Start a deep research dive on a topic. Returns a job id IMMEDIATELY; the " +
    "full report is written in the background. Use when the user asks for a " +
    "deep, thorough, or long-form report — not for quick questions.",
  inputSchema: z.object({ topic: z.string().describe("What to research in depth") }),
  execute: async ({ topic }) => {
    const { data, error } = await supabase()
      .from("scout_jobs")
      .insert({ kind: "deep_dive", payload: { topic } })
      .select("id")
      .single();
    if (error || !data) return { error: `could not queue job: ${error?.message}` };
    const jobId = String(data.id);
    background(() => runDeepDive(jobId, topic));
    return {
      job_id: jobId,
      note: "Deep dive queued — the report will be ready shortly. The UI tracks it by this id.",
    };
  },
});
