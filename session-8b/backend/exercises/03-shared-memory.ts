/**
 * 03 — Two plugs, one memory.  →  npm run ex 03 <conversation-id> [url]
 *
 * Joins an EXISTING conversation by id — one you started in the console —
 * from a bare script, and asks what the service remembers. If the answer
 * knows things you only said in the browser, you've proven it: state lives
 * behind the socket, not in any client.
 */
import "./_shared";

const convId = process.argv[2];
const base = process.argv[3] ?? process.env.SCOUT_URL ?? "http://localhost:3000";
if (!convId) {
  console.error("usage: npm run ex 03 <conversation-id> [url]");
  console.error("grab the id from the console's sidebar (or use any id you chatted under)");
  process.exit(1);
}

const res = await fetch(`${base}/api/chat`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    id: convId,
    messages: [
      {
        id: `probe-${Math.random().toString(36).slice(2, 8)}`,
        role: "user",
        parts: [{ type: "text", text: "Without searching: what do you already know about me from this conversation?" }],
      },
    ],
  }),
});

const reader = res.body!.getReader();
const dec = new TextDecoder();
let buf = "";
let text = "";
for (;;) {
  const { done, value } = await reader.read();
  if (done) break;
  buf += dec.decode(value, { stream: true });
  let i;
  while ((i = buf.indexOf("\n\n")) >= 0) {
    const line = buf.slice(0, i).trim();
    buf = buf.slice(i + 2);
    if (line.startsWith("data: ") && line !== "data: [DONE]") {
      const c = JSON.parse(line.slice(6));
      if (c.type === "text-delta") {
        text += c.delta;
        process.stdout.write(c.delta);
      }
    }
  }
}
console.log(text ? "\n\n✅ if that includes things you told the BROWSER, the memory is the service's." : "\n(no text?)");
