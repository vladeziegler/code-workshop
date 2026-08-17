// GET /api/leads — every account with its people and research facts, newest first.
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";

export async function GET() {
  const sb = supabaseServer();
  const { data, error } = await sb
    .from("aria_account")
    .select("*, aria_people(*), aria_news(*)")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ leads: data });
}
