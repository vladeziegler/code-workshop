/**
 * Prefix runner: `npm run ex 13` finds and runs exercises/13-fanout.ts.
 * You never have to remember file names, only the numbers on the ladder.
 *
 * Forgiving on purpose:
 *   npm run ex 1        →  01-stream.ts     (single digits get padded)
 *   npm run ex 13       →  13-fanout.ts
 *   npm run ex fanout   →  13-fanout.ts     (name fragments work too)
 *   npm run ex          →  the list
 *
 * Works from `live/` or from `live/exercises/` — npm walks up to find
 * package.json, and we anchor paths to this file rather than the shell's cwd.
 */
import { readdirSync } from "node:fs";
import { spawn } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
process.chdir(resolve(HERE, ".."));

const all = readdirSync(HERE)
  .filter((f) => /^\d\d-/.test(f) && f.endsWith(".ts"))
  .sort();

const arg = process.argv[2];

if (!arg) {
  console.log("\n  \x1b[1mModule 8 — the ladder\x1b[0m");
  const GROUP: Record<string, string> = {
    "0": "the agent — anatomy, streaming, structured output, tools",
    "1": "the patterns — control flow you write",
    "2": "watch it and remember — callbacks, context, memory",
    "3": "work that outlives the reply",
    "4": "the runtime — your agent, with a face",
  };
  let group = "";
  for (const f of all) {
    if (f[0] !== group) {
      group = f[0];
      console.log(`\n  \x1b[2m${GROUP[group] ?? ""}\x1b[0m`);
    }
    console.log(`    npm run ex ${f.slice(0, 2)}   \x1b[2m${f}\x1b[0m`);
  }
  console.log(`\n  \x1b[2mand:\x1b[0m`);
  console.log(`    npm run verify       \x1b[2mpreflight — run this first\x1b[0m`);
  console.log(`    npm run tui          \x1b[2myour research agent, interactive\x1b[0m`);
  console.log(`    npm run ex:all       \x1b[2mthe whole ladder\x1b[0m\n`);
  process.exit(0);
}

// "1" → "01", so both work.
const needle = /^\d$/.test(arg) ? `0${arg}` : arg;
const file = all.find((f) => f.startsWith(needle)) ?? all.find((f) => f.includes(needle));

if (!file) {
  console.error(`\n  No exercise matching "${arg}".`);
  console.error(`  Available: ${all.map((f) => f.slice(0, 2)).join(" ")}`);
  console.error(`  Run \`npm run ex\` with no argument for the full list.\n`);
  process.exit(1);
}

spawn("npx", ["tsx", resolve(HERE, file)], { stdio: "inherit" }).on("close", (c) =>
  process.exit(c ?? 0),
);
