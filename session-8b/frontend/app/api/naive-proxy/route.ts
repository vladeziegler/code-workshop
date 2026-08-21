// ⚠️ Teaching artifact — the instinctive CORS "fix", kept to show its cost.
//
// Proxying through your own origin dodges CORS (same-origin now). It works.
// But `await r.text()` reads the ENTIRE upstream stream before replying —
// the browser sees nothing for the whole run, then the answer thuds in whole.
// A proxy that reads the body has un-streamed your stream.
export const maxDuration = 300;

export async function POST(req: Request) {
  const upstream = `${process.env.NEXT_PUBLIC_SCOUT_URL}/api/chat`;
  const r = await fetch(upstream, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: await req.text(),
  });
  const body = await r.text(); // ← the bug, in four words: buffer the whole body
  return new Response(body, {
    headers: { "content-type": r.headers.get("content-type") ?? "text/event-stream" },
  });
}
