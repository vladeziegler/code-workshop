// POST /api/webhook/decision — the pipeline announces that a decision landed.
// The database is the source of truth; this endpoint validates the shared secret,
// logs the event, and answers 200. It writes nothing.
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  if (req.headers.get("x-webhook-secret") !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: "bad secret" }, { status: 401 });
  }
  const event = await req.json();
  console.log("decision webhook:", event.domain, "->", event.response);
  return NextResponse.json({ ok: true });
}
