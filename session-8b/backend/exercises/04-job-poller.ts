/**
 * 04 — Redeem the ticket from a different plug.  →  npm run ex 04 <job-id> [url]
 *
 * The console showed you a job id. This script polls the same public
 * endpoint the UI polls — GET /api/jobs/:id — until the job is done.
 * The ticket is part of the service's interface; any plug can redeem it.
 */
import "./_shared";

const jobId = process.argv[2];
const base = process.argv[3] ?? process.env.SCOUT_URL ?? "http://localhost:3000";
if (!jobId) {
  console.error("usage: npm run ex 04 <job-id> [url]");
  process.exit(1);
}

for (;;) {
  const res = await fetch(`${base}/api/jobs/${jobId}`);
  if (!res.ok) {
    console.error(`HTTP ${res.status} — no such job on this socket?`);
    process.exit(1);
  }
  const job = (await res.json()) as { status: string; kind: string; result?: string };
  process.stdout.write(`\r${job.kind} · ${job.status}          `);
  if (job.status === "done" || job.status === "failed") {
    console.log(`\n\n${job.result ?? "(no result)"}`);
    break;
  }
  await new Promise((r) => setTimeout(r, 2000));
}
