// `npm run ex 02` → runs exercises/02-*.ts (in-process, extra args pass through)
import { readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const num = process.argv[2];
if (!num) {
  console.error("usage: npm run ex <number> [args]   e.g. npm run ex 02");
  process.exit(1);
}
const file = readdirSync(here).find((f) => f.startsWith(`${num.padStart(2, "0")}-`));
if (!file) {
  console.error(`no exercise ${num} in exercises/`);
  process.exit(1);
}
console.log(`── ${file} ──`);
// Re-shape argv so the exercise sees its own args at argv[2+]
process.argv = [process.argv[0], path.join(here, file), ...process.argv.slice(3)];
await import(path.join(here, file));
