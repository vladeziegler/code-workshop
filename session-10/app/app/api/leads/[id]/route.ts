// PATCH /api/leads/:id — the human's decision. Body: { "status": "confirmed" | "rejected" | "escalated" }
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";

const ALLOWED = ["confirmed", "rejected", "escalated"] as const;

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { status } = await req.json();
  if (!ALLOWED.includes(status)) {
    return NextResponse.json({ error: `status must be one of ${ALLOWED.join(", ")}` }, { status: 400 });
  }
  const sb = supabaseServer();
  const { data, error } = await sb
    .from("aria_account")
    .update({ status })
    .eq("id", id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ lead: data });
}
