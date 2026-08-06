/**
 * Shared plumbing for every exercise. Read this once, then ignore it.
 *
 * Every exercise file in this folder is standalone: `npm run ex 00` runs one
 * idea and prints one thing. Nothing here is AI SDK teaching — it's env loading
 * and console formatting so the exercises themselves stay short.
 */
import { config } from "dotenv";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Run from anywhere: `live/`, `live/exercises/`, or with an absolute path.
 * We anchor to this file's location rather than to the shell's cwd, so
 * .env.local and relative writes always resolve the same way.
 */
export const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
process.chdir(PROJECT_ROOT);

config({ path: resolve(PROJECT_ROOT, ".env.local") });

/** The model the whole module uses. One constant, so a swap is one edit. */
export const MODEL_ID = "gpt-5.6-terra";

export function requireEnv(...names: string[]) {
  const missing = names.filter((n) => !process.env[n]);
  if (missing.length) {
    console.error(`\n  Missing env: ${missing.join(", ")}`);
    console.error(`  Copy .env.example → .env.local and fill it in.\n`);
    process.exit(1);
  }
}

export function title(n: string, what: string, teaches: string) {
  console.log(`\n\x1b[1m${n} — ${what}\x1b[0m`);
  console.log(`\x1b[2mteaches: ${teaches}\x1b[0m\n`);
}

export function step(label: string, detail = "") {
  console.log(`  \x1b[36m▸\x1b[0m ${label}${detail ? ` \x1b[2m${detail}\x1b[0m` : ""}`);
}

export function done(label: string) {
  console.log(`\n  \x1b[32m✓\x1b[0m ${label}\n`);
}

export function ms(t0: number) {
  return `${((Date.now() - t0) / 1000).toFixed(1)}s`;
}

/** The campaign request every exercise works from, so outputs are comparable. */
export const REQUEST =
  "A spring collaboration between Muse and a Scandinavian outerwear label, " +
  "aimed at people who commute by bike in cold cities.";
