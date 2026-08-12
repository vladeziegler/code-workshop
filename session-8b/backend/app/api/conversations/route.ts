// What the service remembers, listed. The sidebar reads this.
import { listConversations } from "@/lib/store";
import { CORS_HEADERS, preflight } from "@/lib/cors";

export const OPTIONS = preflight;

export async function GET() {
  return Response.json(await listConversations(), { headers: CORS_HEADERS });
}
