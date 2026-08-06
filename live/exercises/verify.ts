/**
 * Preflight.  →  npm run verify
 *
 * Run this the morning of the session, and have every student run it before
 * the room starts. It checks the five things that actually break on the day,
 * cheaply (~15 seconds, well under a cent), and tells you which one is wrong.
 */
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { supabase } from "../lib/supabase";
import { MODEL_ID } from "./_shared";

const checks: { name: string; run: () => Promise<string> }[] = [
  {
    name: "env vars present",
    run: async () => {
      const need = ["OPENAI_API_KEY", "SUPABASE_URL", "SUPABASE_SERVICE_KEY"];
      const missing = need.filter((n) => !process.env[n]);
      if (missing.length) throw new Error(`missing: ${missing.join(", ")}`);
      return `${need.length}/${need.length} set`;
    },
  },
  {
    name: "model reachable",
    run: async () => {
      const r = await generateText({ model: openai(MODEL_ID), prompt: "Reply with the single word: ready" });
      return `${MODEL_ID} → "${r.text.trim().slice(0, 20)}"`;
    },
  },
  {
    name: "supabase: runs table",
    run: async () => {
      const { data, error } = await supabase().from("runs").select("id, kind").limit(3);
      if (error) throw new Error(error.message);
      return `${data?.length ?? 0} rows readable`;
    },
  },
  {
    name: "supabase: jobs table",
    run: async () => {
      const { error } = await supabase().from("jobs").select("id").limit(1);
      if (error) throw new Error(`${error.message} — did you run migration.sql?`);
      return "exists";
    },
  },
  {
    name: "supabase: memory tables",
    run: async () => {
      for (const t of ["conversations", "memories"]) {
        const { error } = await supabase().from(t).select("*").limit(1);
        if (error) throw new Error(`${t}: ${error.message} — re-run migration.sql`);
      }
      return "conversations + memories exist";
    },
  },
];

console.log("\n\x1b[1m  Module 8 preflight\x1b[0m\n");
let failed = 0;

for (const check of checks) {
  try {
    const detail = await check.run();
    console.log(`  \x1b[32m✓\x1b[0m ${check.name.padEnd(26)} \x1b[2m${detail}\x1b[0m`);
  } catch (e) {
    failed++;
    console.log(`  \x1b[31m✗\x1b[0m ${check.name.padEnd(26)} \x1b[31m${e instanceof Error ? e.message : e}\x1b[0m`);
  }
}

console.log(
  failed
    ? `\n  \x1b[31m${failed} check(s) failed — fix before the session.\x1b[0m\n`
    : `\n  \x1b[32mReady. Start with: npm run ex 00\x1b[0m\n`,
);
process.exit(failed ? 1 : 0);
