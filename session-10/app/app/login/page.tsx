"use client";
// Sign in, or create an account — one form, a toggle between the two.
// Sign-up: the server creates the user (pre-confirmed), then we sign in with the
// same password. Sign-in: Supabase checks the password and sets the session cookie;
// the proxy does the blocking everywhere else.
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function Login() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: { preventDefault(): void }) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    if (mode === "signup") {
      const r = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!r.ok) {
        setError((await r.json()).error ?? "Sign-up failed.");
        setBusy(false);
        return;
      }
    }

    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setBusy(false);
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="login-wrap">
      <form className="login" onSubmit={submit}>
        <h1>
          Aria<span className="brand-dot">·</span>Leads
        </h1>
        <p>
          {mode === "signin"
            ? "Sign in to the qualification console."
            : "Create your account — pick your own password (8+ characters)."}
        </p>
        <label>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={mode === "signup" ? 8 : undefined}
          required
        />
        <button className="btn" disabled={busy}>
          {busy ? "One moment…" : mode === "signin" ? "Sign in" : "Create account & sign in"}
        </button>
        {error && <div className="err">{error}</div>}
        <button
          type="button"
          className="login-toggle"
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setError(null);
          }}
        >
          {mode === "signin" ? "No account? Sign up" : "Have an account? Sign in"}
        </button>
      </form>
    </div>
  );
}
