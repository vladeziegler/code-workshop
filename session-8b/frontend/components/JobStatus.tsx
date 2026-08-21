"use client";
// The claim ticket, redeemable by any plug.
//
// The agent answered instantly with a job id; the actual work runs behind the
// socket. This card polls GET /api/jobs/:id every 2s and flips itself
// queued → running → done. The same id answers to curl — the ticket is part
// of the service's interface, not this UI's.
import { useEffect, useRef, useState } from "react";
import { SCOUT_URL } from "@/lib/transport";

type Job = {
  id: string;
  status: "queued" | "running" | "done" | "failed";
  kind?: string;
  result?: string | null;
  created_at?: string;
};

export function JobTicket({ jobId }: { jobId: string }) {
  const [job, setJob] = useState<Job | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const start = useRef(Date.now());

  useEffect(() => {
    let stop = false;
    async function poll() {
      try {
        const r = await fetch(`${SCOUT_URL}/api/jobs/${jobId}`);
        if (r.ok) {
          const j: Job = await r.json();
          if (!stop) setJob(j);
          if (j.status === "done" || j.status === "failed") return;
        }
      } catch {
        /* keep polling */
      }
      if (!stop) setTimeout(poll, 2000);
    }
    poll();
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - start.current) / 1000)), 1000);
    return () => {
      stop = true;
      clearInterval(t);
    };
  }, [jobId]);

  const status = job?.status ?? "queued";
  const terminal = status === "done" || status === "failed";

  return (
    <div className="ticket">
      <div className="ticket-head">
        <span className="ticket-label">Job</span>
        <span className="ticket-id">{jobId}</span>
        <span className={`ticket-badge ${status}`}>{status}</span>
      </div>
      <div className="ticket-meta">
        {job?.kind ?? "background work"} · {terminal ? "finished" : `${elapsed}s elapsed`} · polls{" "}
        /api/jobs/{jobId.slice(0, 8)}…
      </div>
      {job?.result && <div className="ticket-result">{job.result}</div>}
    </div>
  );
}
