/**
 * 05 — Parts you never defined.  →  npm run ex 05 [url]
 *
 * Point this at a RICHER socket (muse-studio) and dump every part type that
 * isn't plain text. The `data-*` parts carry their own id + shape — that's
 * why the console can render a service it has never met. Default URL is the
 * muse-studio deployment; pass any socket that speaks the protocol.
 */
import "./_shared";

const base = process.argv[2] ?? process.env.MUSE_URL ?? "http://localhost:3002";

const res = await fetch(`${base}/api/chat`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    messages: [
      {
        id: "m1",
        role: "user",
        parts: [
          {
            type: "text",
            text: "Create a campaign brief for Muse x a premium sneaker brand. Use create_brief.",
          },
        ],
      },
    ],
  }),
});
console.log(`status ${res.status} — watching for foreign parts…\n`);

const reader = res.body!.getReader();
const dec = new TextDecoder();
let buf = "";
for (;;) {
  const { done, value } = await reader.read();
  if (done) break;
  buf += dec.decode(value, { stream: true });
  let i;
  while ((i = buf.indexOf("\n\n")) >= 0) {
    const line = buf.slice(0, i).trim();
    buf = buf.slice(i + 2);
    if (!line.startsWith("data: ") || line === "data: [DONE]") continue;
    const c = JSON.parse(line.slice(6));
    if (c.type?.startsWith("data-")) {
      console.log(`${c.type} · id=${c.id} · ${JSON.stringify(c.data).slice(0, 110)}`);
    } else if (c.type === "tool-input-available") {
      console.log(`tool call · ${c.toolName ?? "?"}`);
    }
  }
}
console.log("\n✅ every data-* line above is a part this codebase never defined.");
