/**
 * The whole ladder, in order.  →  npm run ex:all
 *
 * Runs every exercise as its own process, in sequence, and prints a summary.
 * Two exercises are EXPECTED to disappoint you (04 and 11) — they're in the run
 * because seeing them fail in context is the point.
 *
 *   npm run ex:all              everything (~6-8 min, spends a few dollars)
 *   npm run ex:all core         00-07 only
 *   npm run ex:all patterns     10-17
 *   npm run ex:all context      20-21
 *   npm run ex:all jobs         30-31  (slow: two image renders)
 *
 * Not included: the TUI entry points, which are interactive by nature.
 */
import { spawn } from "node:child_process";
import { readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Anchor to this file, so it runs from live/ or live/exercises/ alike.
process.chdir(resolve(dirname(fileURLToPath(import.meta.url)), ".."));

const GROUPS: Record<string, RegExp> = {
  agent: /^0\d-/,
  patterns: /^1\d-/,
  state: /^2\d-/,
  jobs: /^3\d-/,
};

const group = process.argv[2];
const filter = group ? GROUPS[group] : /^\d\d-/;
if (group && !filter) {
  console.error(`Unknown group "${group}". Try: ${Object.keys(GROUPS).join(", ")}`);
  process.exit(1);
}

// 40 is the interactive TUI — it never exits, so it is not part of a batch run.
const files = readdirSync("exercises")
  .filter((f) => filter.test(f) && f.endsWith(".ts") && !f.startsWith("40"))
  .sort();

console.log(`\n\x1b[1mModule 8 — running ${files.length} exercises\x1b[0m`);
console.log(`\x1b[2m${files.join("  ")}\x1b[0m`);

const results: { file: string; ok: boolean; seconds: number }[] = [];

for (const file of files) {
  console.log(`\n\x1b[44m\x1b[1m  ${file}  \x1b[0m`);
  const t0 = Date.now();
  const code = await new Promise<number>((resolve) => {
    const child = spawn("npx", ["tsx", `exercises/${file}`], { stdio: "inherit", shell: process.platform === "win32" });
    child.on("close", (c) => resolve(c ?? 1));
  });
  results.push({ file, ok: code === 0, seconds: (Date.now() - t0) / 1000 });
}

console.log(`\n\x1b[1m  summary\x1b[0m`);
for (const r of results) {
  console.log(`  ${r.ok ? "\x1b[32m✓\x1b[0m" : "\x1b[31m✗\x1b[0m"} ${r.file.padEnd(24)} ${r.seconds.toFixed(1)}s`);
}
const failed = results.filter((r) => !r.ok);
console.log(
  failed.length
    ? `\n  \x1b[31m${failed.length} exited non-zero: ${failed.map((f) => f.file).join(", ")}\x1b[0m\n`
    : `\n  \x1b[32mall ${results.length} ran clean.\x1b[0m\n`,
);
console.log(
  `  \x1b[2mRemember: 11-chain-broken exits 0 while producing an invented brand.\n` +
    `  "It ran" and "it worked" are different claims.\x1b[0m\n`,
);
