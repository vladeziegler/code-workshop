"use client";
// The Draft button's payoff: the agent streams back everything it does, in order —
// its reasoning (dim), the Gmail tool call (chip), and the email itself.
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef } from "react";

const transport = new DefaultChatTransport({ api: "/api/draft" });

type Part = {
  type: string;
  text?: string;
  state?: string;
  output?: { note?: string };
  errorText?: string;
};

export function DraftPanel({ leadId }: { leadId: string }) {
  const { messages, sendMessage, status } = useChat({ id: leadId, transport });
  const kicked = useRef(false);

  useEffect(() => {
    if (!kicked.current) {
      kicked.current = true;
      sendMessage({ text: "Draft the outreach email for this lead and file it in Gmail." });
    }
  }, [sendMessage]);

  const reply = messages.filter((m) => m.role === "assistant").at(-1);
  const busy = status === "submitted" || status === "streaming";

  return (
    <div className="draft-panel">
      <div className="draft-label">Draft — the agent, live</div>
      {!reply && <span>Starting…</span>}
      {(reply?.parts as Part[] | undefined)?.map((part, i) => {
        if (part.type === "reasoning" && part.text) {
          return (
            <div className="agent-reasoning" key={i}>
              <span className="agent-reasoning-label">thinking</span> {part.text}
            </div>
          );
        }
        if (part.type.startsWith("tool-")) {
          const done = part.state === "output-available";
          const failed = part.state === "output-error";
          return (
            <div className="agent-tool" key={i}>
              <span className={`tool-dot ${failed ? "error" : done ? "done" : "running"}`} />
              <span className="agent-tool-name">{part.type.replace("tool-", "")}</span>
              <span className="agent-tool-state">
                {failed ? part.errorText ?? "failed" : done ? part.output?.note ?? "done" : "running…"}
              </span>
            </div>
          );
        }
        if (part.type === "text") {
          return <div key={i}>{part.text}</div>;
        }
        return null;
      })}
      {busy && <span className="cursor" />}
    </div>
  );
}
