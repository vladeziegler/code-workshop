// The one line that names a URL. Everything else in this app is rendering.
// Swap the env vars, and this console drives a different agent — that's step 09.
import { DefaultChatTransport } from "ai";

export const SCOUT_URL = process.env.NEXT_PUBLIC_SCOUT_URL ?? "";

// What the console calls whatever answers the socket. Cosmetic, and honest:
// the console doesn't know what's plugged in unless you tell it.
export const AGENT_LABEL = process.env.NEXT_PUBLIC_AGENT_LABEL ?? "muse scout";

// Two ways to plug in:
//   direct — a socket that speaks CORS (muse-scout does; you added it)
//   relay  — a socket you don't own goes through /api/relay on this origin
const USE_RELAY = process.env.NEXT_PUBLIC_USE_RELAY === "1";

export const chatTransport = new DefaultChatTransport({
  api: USE_RELAY ? "/api/relay" : `${SCOUT_URL}/api/chat`,
});
