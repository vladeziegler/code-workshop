"use client";
import { useRef, useState } from "react";
import { AGENT_LABEL } from "@/lib/transport";

export function Composer({
  busy,
  onSend,
  onStop,
}: {
  busy: boolean;
  onSend: (text: string) => void;
  onStop: () => void;
}) {
  const [input, setInput] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  function submit() {
    const text = input.trim();
    if (!text || busy) return;
    onSend(text);
    setInput("");
    if (ref.current) ref.current.style.height = "auto";
  }

  return (
    <div className="composer-wrap">
      <form
        className="composer"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <textarea
          ref={ref}
          rows={1}
          value={input}
          placeholder={`Ask ${AGENT_LABEL} anything…`}
          onChange={(e) => {
            setInput(e.target.value);
            e.target.style.height = "auto";
            e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
        />
        {busy ? (
          <button type="button" className="send stop" onClick={onStop} title="Stop">
            ■
          </button>
        ) : (
          <button type="submit" className="send" disabled={!input.trim()} title="Send">
            ↑
          </button>
        )}
      </form>
      <div className="composer-hint">Enter to send · Shift+Enter for a new line</div>
    </div>
  );
}
