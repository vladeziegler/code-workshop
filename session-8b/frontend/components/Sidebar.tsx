"use client";
// Conversation history lives behind the socket, not in this browser.
// This component just asks the service what it remembers — when the backend
// can't answer yet (step 05), the list is simply empty. No frontend change
// makes it light up in step 07; the SERVICE learns to remember.
import { useEffect, useState } from "react";
import { SCOUT_URL } from "@/lib/transport";

export type ConversationRow = {
  id: string;
  title: string;
  updated_at: string;
};

function relTime(iso: string) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export function Sidebar({
  activeId,
  refreshSignal,
  onSelect,
  onNew,
}: {
  activeId: string;
  refreshSignal: number;
  onSelect: (id: string) => void;
  onNew: () => void;
}) {
  const [rows, setRows] = useState<ConversationRow[]>([]);

  useEffect(() => {
    fetch(`${SCOUT_URL}/api/conversations`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setRows(Array.isArray(data) ? data : []))
      .catch(() => setRows([]));
  }, [refreshSignal]);

  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-name">
          muse<span className="brand-dot">◆</span>console
        </span>
        <span className="brand-sub">v1</span>
      </div>

      <button className="new-chat" onClick={onNew}>
        <span>＋</span> New chat
      </button>

      <div className="history-label">History</div>
      {rows.length === 0 ? (
        <div className="history-empty">
          Nothing yet. Conversations appear here once the service remembers
          them.
        </div>
      ) : (
        rows.map((c) => (
          <button
            key={c.id}
            className={`conv ${c.id === activeId ? "active" : ""}`}
            onClick={() => onSelect(c.id)}
          >
            <span className="conv-title">{c.title || "Untitled"}</span>
            <span className="conv-time">{relTime(c.updated_at)}</span>
          </button>
        ))
      )}

      <div className="sidebar-foot">
        socket: {SCOUT_URL ? new URL(SCOUT_URL).host : "not configured"}
      </div>
    </aside>
  );
}
