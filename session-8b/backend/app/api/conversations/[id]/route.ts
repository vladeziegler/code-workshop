// One conversation, replayed. Any plug that knows the id can pick it up.
import { loadConversation } from "@/lib/store";
import { CORS_HEADERS, preflight } from "@/lib/cors";

export const OPTIONS = preflight;

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return Response.json(await loadConversation(id), { headers: CORS_HEADERS });
}
