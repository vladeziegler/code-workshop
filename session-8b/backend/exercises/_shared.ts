// Loads .env.local for scripts that run outside `next dev`.
// Route handlers never need this — Next loads env itself.
import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(here, "..", ".env.local") });

export function requireEnv(...names: string[]) {
  const missing = names.filter((n) => !process.env[n]);
  if (missing.length) {
    console.error(`Missing env vars: ${missing.join(", ")} — fill backend/.env.local`);
    process.exit(1);
  }
}
