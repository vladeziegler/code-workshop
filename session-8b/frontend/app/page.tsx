"use client";
// The console. Everything below is rendering — the only thing this app knows
// about any agent is the URL in lib/transport.ts.
import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { chatTransport, SCOUT_URL } from "@/lib/transport";
import { Sidebar } from "@/components/Sidebar";
import { Composer } from "@/components/Composer";
import { Message } from "@/components/Messages";

const HINTS = [
  "What happened in AI this week?",
  "Compare the latest iPhone and Pixel — with sources",
  "Is the 4-day work week actually spreading?",
];

export default function Page() {
  const [convId, setConvId] = useState<string>(() => crypto.randomUUID());
  const [initial, setInitial] = useState<UIMessage[]>([]);
  const [refresh, setRefresh] = useState(0);

  async function openConversation(id: string) {
    try {
      const r = await fetch(`${SCOUT_URL}/api/conversations/${id}`);
      const msgs = r.ok ? await r.json() : [];
      setInitial(Array.isArray(msgs) ? msgs : []);
    } catch {
      setInitial([]);
    }
    setConvId(id);
  }

  return (
    <div className="shell">
      <Sidebar
        activeId={convId}
        refreshSignal={refresh}
        onSelect={openConversation}
        onNew={() => {
          setInitial([]);
          setConvId(crypto.randomUUID());
        }}
      />
      <Chat
        key={convId}
        convId={convId}
        initial={initial}
        onFinished={() => setRefresh((x) => x + 1)}
      />
    </div>
  );
}

function Chat({
  convId,
  initial,
  onFinished,
}: {
  convId: string;
  initial: UIMessage[];
  onFinished: () => void;
}) {
  const { messages, sendMessage, status, stop, error } = useChat({
    id: convId,
    messages: initial,
    transport: chatTransport,
    onFinish: onFinished,
  });
  const busy = status === "submitted" || status === "streaming";

  // Auto-scroll, released the moment the reader scrolls up.
  const threadRef = useRef<HTMLDivElement>(null);
  const stick = useRef(true);
  useEffect(() => {
    const el = threadRef.current;
    if (el && stick.current) el.scrollTop = el.scrollHeight;
  }, [messages]);

  return (
    <main className="main">
      <div
        className="thread"
        ref={threadRef}
        onScroll={(e) => {
          const el = e.currentTarget;
          stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
        }}
      >
        <div className="thread-inner">
          {messages.length === 0 ? (
            <div className="empty">
              <div className="empty-mark">◆</div>
              <h2>Muse Console</h2>
              <p>
                A web-searching research agent lives on the other end of this
                socket. Ask it something it can only answer by looking.
              </p>
              <div className="empty-hints">
                {HINTS.map((h) => (
                  <button key={h} className="empty-hint" onClick={() => sendMessage({ text: h })}>
                    {h}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m, i) => (
              <Message key={m.id} m={m} streaming={busy && i === messages.length - 1} />
            ))
          )}
        </div>
      </div>

      {error && <div className="err-banner">{error.message}</div>}

      <Composer busy={busy} onSend={(text) => sendMessage({ text })} onStop={stop} />
    </main>
  );
}
