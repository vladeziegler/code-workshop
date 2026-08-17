"use client";
// The leads console. Polls /api/leads every 4 seconds — decisions made by the
// pipeline show up here within one poll.
import { useEffect, useState } from "react";
import { DraftPanel } from "@/components/DraftPanel";

type Person = { id: string; full_name: string | null; role: string | null; email: string; request: string | null };
type Fact = { id: string; fact: string; source_url: string | null };
type Lead = {
  id: string; domain: string; name: string | null;
  employees_count: number | null; us_based: boolean | null;
  premium_score: number | null; lead_quality: number | null;
  est_budget: string | null; response: string | null; status: string;
  aria_people: Person[]; aria_news: Fact[];
};

export default function Home() {
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openDraft, setOpenDraft] = useState<string | null>(null);

  async function load() {
    try {
      const r = await fetch("/api/leads");
      if (!r.ok) throw new Error(`GET /api/leads -> ${r.status}`);
      setLeads((await r.json()).leads);
      setError(null);
    } catch (e) {
      setError(String(e));
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 4000);
    return () => clearInterval(t);
  }, []);

  async function setStatus(id: string, status: string) {
    await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  return (
    <>
      <header className="topbar">
        <span className="brand">
          Aria<span className="brand-dot">·</span>Leads
        </span>
        <span className="brand-sub">inbound qualification</span>
        <span className="topbar-count">{leads ? `${leads.length} accounts` : "…"}</span>
        <form action="/auth/signout" method="post">
          <button className="signout">Sign out</button>
        </form>
      </header>

      {error && <div className="err-banner">{error}</div>}

      <main className="leads">
        {leads && leads.length === 0 && (
          <div className="empty">
            <div className="empty-mark">◌</div>
            <p>No leads yet. Run the pipeline.</p>
          </div>
        )}
        {leads?.map((lead) => (
          <article className="lead" key={lead.id}>
            <div className="lead-head">
              <span className="lead-name">{lead.name ?? lead.domain}</span>
              <span className="lead-domain">{lead.domain}</span>
              <span className="lead-budget">{lead.est_budget}</span>
            </div>

            <div className="chips">
              {lead.employees_count != null && (
                <span className="chip"><b>{lead.employees_count.toLocaleString()}</b> employees</span>
              )}
              {lead.us_based != null && <span className="chip">{lead.us_based ? "US-based" : "not US"}</span>}
              {lead.premium_score != null && <span className="chip">premium <b>{lead.premium_score}/5</b></span>}
              {lead.lead_quality != null && <span className="chip">quality <b>{lead.lead_quality}/5</b></span>}
              {lead.response && <span className={`chip response-${lead.response}`}>AI: {lead.response}</span>}
              <span className={`chip status-${lead.status}`}>{lead.status}</span>
            </div>

            <div className="people">
              {lead.aria_people.map((p) => (
                <div className="person" key={p.id}>
                  <span className="person-name">{p.full_name ?? "—"}</span>
                  {p.role && <span className="person-role">{p.role}</span>}
                  <span className="person-email">{p.email}</span>
                  {p.request && <span className="person-request">“{p.request}”</span>}
                </div>
              ))}
            </div>

            {lead.aria_news.length > 0 && (
              <details className="facts">
                <summary>research · {lead.aria_news.length} findings</summary>
                <ul>
                  {lead.aria_news.map((f) => (
                    <li key={f.id}>
                      {f.fact}{" "}
                      {f.source_url && (
                        <a href={f.source_url} target="_blank" rel="noreferrer">
                          source
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </details>
            )}

            <div className="actions">
              <button className="btn reject" onClick={() => setStatus(lead.id, "rejected")}>Reject</button>
              <button className="btn escalate" onClick={() => setStatus(lead.id, "escalated")}>Escalate</button>
              <button className="btn confirm" onClick={() => setStatus(lead.id, "confirmed")}>Confirm</button>
              <button
                className="btn draft"
                onClick={() => setOpenDraft(openDraft === lead.id ? null : lead.id)}
              >
                {openDraft === lead.id ? "Close draft" : "✉ Draft email"}
              </button>
            </div>

            {openDraft === lead.id && <DraftPanel leadId={lead.id} />}
          </article>
        ))}
      </main>
    </>
  );
}
