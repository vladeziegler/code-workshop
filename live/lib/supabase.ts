// Server-only Supabase client. The service key never gets a NEXT_PUBLIC_ prefix:
// anything in the bundle belongs to everyone.
import { createClient } from "@supabase/supabase-js";

export function supabase() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);
}
