"use client";
// An assistant message is an ordered list of typed PARTS, not a string.
// Render the states and the agent feels like a product instead of a spinner.
import Markdown from "react-markdown";
import type { UIMessage } from "ai";
import { AGENT_LABEL } from "@/lib/transport";
import { ToolChip } from "./ToolChip";
import { SourceCards } from "./SourceCard";
import { StageChips } from "./StageChip";

export function Message({ m, streaming }: { m: UIMessage; streaming: boolean }) {
  if (m.role === "user") {
    const text = m.parts
      .filter((p) => p.type === "text")
      .map((p) => (p as { text: string }).text)
      .join("");
    return (
      <div className="msg user">
        <div className="bubble-user">{text}</div>
      </div>
    );
  }

  // Group the flat part list into what the layout needs: sources render as one
  // card row, data-* parts as one stage rail, everything else in order.
  const sources = m.parts
    .filter((p) => p.type === "source-url")
    .map((p) => p as unknown as { url: string; title?: string });
  const stages = m.parts
    .filter((p) => p.type.startsWith("data-"))
    .map((p) => ({
      kind: p.type.slice(5),
      data: (p as unknown as { data: Record<string, unknown> }).data ?? {},
    }));

  const hasText = m.parts.some((p) => p.type === "text" && (p as { text: string }).text);

  return (
    <div className="msg assistant">
      <div className="who">{AGENT_LABEL}</div>

      {stages.length > 0 && <StageChips stages={stages} />}

      {m.parts.map((part, i) => {
        if (part.type === "text") {
          const t = (part as { text: string }).text;
          const last = i === m.parts.length - 1;
          return (
            <div key={i} className="md">
              <Markdown>{t}</Markdown>
              {streaming && last && <span className="cursor" />}
            </div>
          );
        }

        if (part.type === "reasoning") return null; // noise by default

        if (part.type.startsWith("tool-") || part.type === "dynamic-tool") {
          const name =
            part.type === "dynamic-tool"
              ? (part as unknown as { toolName: string }).toolName
              : part.type.slice(5);
          const p = part as unknown as {
            state?: string;
            input?: unknown;
            output?: unknown;
            errorText?: string;
          };
          return (
            <ToolChip
              key={i}
              name={name}
              state={p.state}
              input={p.input}
              output={p.output}
              errorText={p.errorText}
            />
          );
        }

        return null;
      })}

      {!hasText && streaming && (
        <div className="thinking">
          <span />
          <span />
          <span />
        </div>
      )}

      {sources.length > 0 && <SourceCards sources={sources} />}
    </div>
  );
}
