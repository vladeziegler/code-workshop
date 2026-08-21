"use client";
// The generic renderer that makes step 09 work.
//
// This console imports NOTHING from any agent's codebase. `data-*` parts carry
// their own id and shape on the wire, and re-emits with the same id update in
// place — so a service this UI has never met (muse-studio's four pipeline
// stages, say) still renders as a live progress rail. The wire is
// self-describing enough; that's the whole bet of the module.

type AnyStage = {
  id?: string;
  label?: string;
  detail?: string;
  status?: string;
  shape?: string;
  ms?: number;
  [k: string]: unknown;
};

export function StageChips({ stages }: { stages: { kind: string; data: AnyStage }[] }) {
  if (!stages.length) return null;
  return (
    <div className="stages">
      {stages.map((s, i) => {
        const d = s.data ?? {};
        const status = String(d.status ?? "done");
        const icon = status === "running" ? "running" : status === "failed" ? "failed" : "done";
        return (
          <div className="stage" key={d.id ?? i}>
            <span className={`stage-icon ${icon}`} />
            <span className="stage-kind">{String(d.shape ?? s.kind)}</span>
            <span className="stage-label">{String(d.label ?? "")}</span>
            {d.detail ? <span className="stage-detail">{String(d.detail)}</span> : null}
            <span className="stage-ms">
              {typeof d.ms === "number" ? `${(d.ms / 1000).toFixed(1)}s` : status}
            </span>
          </div>
        );
      })}
    </div>
  );
}
