"use client";
// web_search citations, as things you can click — not URLs dumped in prose.

export function SourceCards({ sources }: { sources: { url: string; title?: string }[] }) {
  if (!sources.length) return null;
  return (
    <div className="sources">
      {sources.map((s, i) => {
        let host = "";
        try {
          host = new URL(s.url).hostname.replace(/^www\./, "");
        } catch {
          host = s.url;
        }
        return (
          <a key={i} className="source" href={s.url} target="_blank" rel="noreferrer">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://www.google.com/s2/favicons?domain=${host}&sz=32`}
              alt=""
              loading="lazy"
            />
            <span className="source-title">{s.title ?? host}</span>
            <span className="source-domain">{host}</span>
          </a>
        );
      })}
    </div>
  );
}
