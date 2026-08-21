// Step 09's adapter: drive a socket you don't own.
//
// muse-studio speaks the same UIMessage stream — but it was built as a
// same-origin app, so its CORS answers to nobody. The console lends it an
// origin: requests come in here, go out to RELAY_TARGET, and the response
// body is handed back AS A STREAM.
//
// `new Response(upstream.body)` PIPES chunk by chunk. Compare
// app/api/naive-proxy/route.ts, which awaited the whole body and killed
// streaming. Same shape, one line different, opposite product.
export const maxDuration = 300;

export async function POST(req: Request) {
  const target = process.env.RELAY_TARGET;
  if (!target) {
    return Response.json({ error: "RELAY_TARGET is not set" }, { status: 500 });
  }
  const upstream = await fetch(`${target}/api/chat`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: await req.text(), // the request is small — buffering IT is fine
  });
  return new Response(upstream.body, {
    status: upstream.status,
    headers: { "content-type": upstream.headers.get("content-type") ?? "text/event-stream" },
  });
}
