/**
 * 02 — The plug, in bytes.  →  npm run ex 02 [url]
 *
 * POSTs one message to a socket and prints every UIMessage chunk type as it
 * arrives, with first-byte timing. This is what curl -N shows you raw; here
 * it's labeled. Works against localhost:3000, your deployed scout, or any
 * socket that speaks the protocol.
 */
import "./_shared";

const base = process.argv[2] ?? process.env.SCOUT_URL ?? "http://localhost:3000";
const t0 = Date.now();

const res = await fetch(`${base}/api/chat`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    messages: [
      {
        id: "m1",
        role: "user",
        parts: [{ type: "text", text: "In one line: what day is it and what's one AI headline?" }],
      },
    ],
  }),
});
console.log(`status ${res.status} · first byte at ${Date.now() - t0}ms\n`);

const reader = res.body!.getReader();
const dec = new TextDecoder();
let buf = "";
let text = "";
const counts: Record<string, number> = {};
for (;;) {
  const { done, value } = await reader.read();
  if (done) break;
  buf += dec.decode(value, { stream: true });
  let i;
  while ((i = buf.indexOf("\n\n")) >= 0) {
    const line = buf.slice(0, i).trim();
    buf = buf.slice(i + 2);
    if (!line.startsWith("data: ") || line === "data: [DONE]") continue;
    const chunk = JSON.parse(line.slice(6));
    counts[chunk.type] = (counts[chunk.type] ?? 0) + 1;
    if (chunk.type === "text-delta") text += chunk.delta;
    else console.log(`${String(Date.now() - t0).padStart(6)}ms  ${chunk.type}`);
  }
}
console.log(`\nchunk counts: ${JSON.stringify(counts)}`);
console.log(`text: ${text}`);
