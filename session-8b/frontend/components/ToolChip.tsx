"use client";
// A tool call is a state machine, not a spinner. Four states worth showing:
//   input-streaming  → the model is still deciding what to ask for
//   input-available  → executing
//   output-available → done (expand for input/output — your fastest debugger)
//   output-error     → failed, honestly
import { JobTicket } from "./JobStatus";

const LABEL: Record<string, string> = {
  "input-streaming": "deciding…",
  "input-available": "running…",
  "output-available": "done",
  "output-error": "failed",
};

export function ToolChip({
  name,
  state,
  input,
  output,
  errorText,
}: {
  name: string;
  state?: string;
  input?: unknown;
  output?: unknown;
  errorText?: string;
}) {
  const dot =
    state === "output-available" ? "done" : state === "output-error" ? "error" : "running";

  // A tool that returns a claim ticket gets rendered as one — the ticket
  // component polls the jobs endpoint on its own.
  const jobId =
    state === "output-available" && output && typeof output === "object" && "job_id" in output
      ? String((output as { job_id: unknown }).job_id)
      : null;

  return (
    <>
      <details className="tool">
        <summary>
          <span className={`tool-dot ${dot}`} />
          <span className="tool-name">{name}</span>
          <span className="tool-state">{LABEL[state ?? ""] ?? state ?? ""}</span>
        </summary>
        {input != null && <pre className="tool-io">{JSON.stringify(input, null, 2)}</pre>}
        {state === "output-available" && !jobId && (
          <pre className="tool-io">{JSON.stringify(output, null, 2)}</pre>
        )}
        {state === "output-error" && <pre className="tool-io err">{errorText}</pre>}
      </details>
      {jobId && <JobTicket jobId={jobId} />}
    </>
  );
}
