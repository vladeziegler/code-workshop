// The browser's contract for cross-origin calls. curl never asks permission;
// a browser sends a preflight OPTIONS and refuses to read the response unless
// the server names who may plug in. The socket answers here.
//
// "*" is workshop mode: any origin may call this socket (it has no auth
// anyway — that honesty line is in the capstone). For a client project you
// lock this to the console's origin.
export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
} as const;

export function preflight() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}
