// The ticket window: a second socket. The console polls it; curl can too —
// the claim ticket is part of the service's interface, not the UI's.
import { supabase } from "@/lib/store";
import { CORS_HEADERS, preflight } from "@/lib/cors";

export const OPTIONS = preflight;

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = supabase();
  const { data: job } = await sb
    .from("scout_jobs")
    .select("id, kind, status, created_at")
    .eq("id", id)
    .maybeSingle();
  if (!job) return Response.json({ error: "no such job" }, { status: 404, headers: CORS_HEADERS });

  const { data: run } = await sb
    .from("scout_runs")
    .select("detail, status")
    .eq("job_id", id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return Response.json({ ...job, result: run?.detail ?? null }, { headers: CORS_HEADERS });
}
