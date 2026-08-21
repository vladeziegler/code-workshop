// POST /api/auth/signup — create an account, server-side.
// The server creates the user with the service key and marks the email confirmed,
// so no confirmation email is ever needed (Supabase's built-in mailer allows 2/hour —
// useless for a room). The browser then signs in normally with the same password.
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";

export async function POST(req: Request) {
  const { email, password } = await req.json();
  if (!email || !password || password.length < 8) {
    return NextResponse.json(
      { error: "Email and a password of at least 8 characters are required." },
      { status: 400 }
    );
  }
  const sb = supabaseServer();
  const { error } = await sb.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
