// Next 16 calls this file proxy.ts (the old middleware.ts convention, renamed).
// Every page and API route requires a signed-in user — except the login page,
// the auth routes, and the pipeline's webhook (machines don't have cookies).
import { createServerClient, parseCookieHeader } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

const PUBLIC = ["/login", "/auth", "/api/auth", "/api/webhook"];

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request: { headers: request.headers } });

  if (PUBLIC.some((p) => request.nextUrl.pathname.startsWith(p))) {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return parseCookieHeader(request.cookies.toString());
        },
        setAll(
          cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[],
          headers?: Record<string, unknown>
        ) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
          Object.entries(headers ?? {}).forEach(([key, value]) => {
            response.headers.set(key, String(value));
          });
        },
      },
    }
  );

  const { data } = await supabase.auth.getSession();
  if (!data.session?.user) {
    if (request.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "signed out" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
