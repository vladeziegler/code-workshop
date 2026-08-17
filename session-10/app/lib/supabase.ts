// Server-side Supabase client. The service key lives ONLY here (server code) —
// the browser never sees it. All reads and writes go through our API routes.
import { createClient } from "@supabase/supabase-js";

export function supabaseServer() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!, {
    auth: { persistSession: false },
  });
}
