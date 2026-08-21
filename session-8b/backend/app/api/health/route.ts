// The smallest possible proof that the service is up.
// An API-only app has no pages — this is what you look at instead.
import { CORS_HEADERS } from "@/lib/cors";

export function GET() {
  return Response.json({ ok: true, service: "muse-scout" }, { headers: CORS_HEADERS });
}
