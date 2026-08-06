# Module 8 — the ladder

The module *is* this folder. Nineteen files, numbered in teaching order: run them
from `00` to `40` and you have done the day. Each one is standalone, teaches one
idea, and prints one thing.

Read the comment block at the top of a file before you run it — that's the
lesson; the code is the proof.

**The exercise number is an argument, not a script name.** It's `npm run ex 01`,
never `npm run 01`. Run from `live/` or from `live/exercises/` — both work.

```bash
cd session-8/live

npm run verify           # preflight — run this first
npm run ex               # list the ladder
npm run ex 01            # run one ("1" works too, so does "stream")
npm run ex:all patterns  # a whole group (agent | patterns | state | jobs)
npm run tui              # your research agent, interactive
```

## 0 — The agent

| | teaches |
|---|---|
| `00-hello` | the unified provider call. If this fails, nothing else will work |
| `01-stream` | the response begins before it ends |
| `02-structured` | `Output.object` + Zod. **Not `generateObject` — that's deprecated** |
| `03-tool` | a tool is a typed function plus a paragraph of prompt |
| `04-provider-tools` | who executes the tool — OpenAI's servers vs. your own `tool()` around Tavily |
| `05-swap-provider` | the same agent, OpenAI then Anthropic, one line changed |

## 1 — The patterns

These map 1:1 onto the workflow patterns at **ai-sdk.dev/docs/agents/workflows**,
plus delegation from the Agents docs. Each file names its doc reference example.

| | AI SDK pattern | docs example | teaches |
|---|---|---|---|
| `10-chain` | Sequential Processing | `generateMarketingCopy` | output keys are the wires |
| `11-chain-broken` | — | — | ⚠️ *lies on purpose.* An unconnected wire doesn't error |
| `12-router` | Routing | `handleCustomerQuery` | agent routing vs. workflow routing, measured |
| `13-fanout` | Parallel Processing | `parallelCodeReview` | specialists: different instructions, different schemas, then synthesis |
| `14-loop-judge` | Evaluation/Feedback Loops | `translateWithFeedback` | the model scores, your code decides — plus plateau detection |
| `15-orchestrator` | Orchestrator-Worker | `implementFeature` | a typed plan selects which specialist runs |
| `16-subagent` | Delegation (Agents docs) | `researchSubagent` | an agent is a function, so it can be a tool |

**The distinction worth saying out loud:** these are *workflows* — **your code**
holds the control flow, built from `generateText` + `Output.object`. A
`ToolLoopAgent` is an *agent* — **the model** holds the control flow. They
compose: a workflow can hide inside one tool an agent calls. Exercise `12` runs
both side by side so you can see what each costs.

## 2 — Watch it, and remember

| | teaches |
|---|---|
| `20-callbacks` | per-step tokens, per-tool ms, a total you can put on an invoice |
| `21-tools-context` | `contextSchema` — per-client values the model may not choose |
| `22-conversation` | **memory is the message array.** Re-sent every turn, and it costs |
| `23-memory` | memory that survives the process — two tables, scoped by context |

**On statefulness.** There is no memory feature in the AI SDK. An agent remembers
because you re-send `ModelMessage[]` every turn (`22`), and it remembers *after a
restart* because you persisted that array (`23`). Two kinds worth separating:
**conversations** (verbatim, grows without bound — prune with `pruneMessages()`)
and **memories** (small curated facts, cheap to inject forever). `23` is also
where context stops being a convenience: the model chooses *what* to remember,
`contextSchema` decides *whose* memory it lands in.

## 3 — Work that outlives the reply

| | teaches |
|---|---|
| `30-job-split` | two agents, same background work — one has a job id and can tell the truth, one improvises |

## 4 — The runtime

| | teaches |
|---|---|
| `40-tui` | the same agent object, rendered — streaming, tool sections, token usage |

`npm run tui` is what you leave with: one agent, one web-research ability, your
instructions. The five-tool version wired to a database, a PDF renderer and
Google Drive is **Module 8b**.

## Setup

`23` and `30` need Supabase tables. Run `live/migration.sql` in the Supabase SQL
editor — everything is `create table if not exists`, so re-running is safe.
`npm run verify` checks all of it.

## Things that will bite you

- **`generateObject` is deprecated** (v6). Use `generateText({ output: Output.object({ schema }) })`
  and read `.output`, not `.object`.
- **On a `ToolLoopAgent`, `runtimeContext` and `toolsContext` are constructor
  settings, not `.generate()` arguments.** When context varies per request, build
  the agent per request. `generateText`/`streamText` do take them per call.
- **Default step budgets differ:** `generateText`/`streamText` → 1, `ToolLoopAgent` → 20.
- **`runAgentTUI` refuses an agent that uses `output:`** or requires per-call options.
- **Use `@tavily/core`, not `@tavily/ai-sdk`** — the pre-built package declares peer
  `ai@^5 || ^6` and won't install against v7. Wrapping the core client in your own
  `tool()` is eight lines and is what you'd do for any client API anyway.
- **This package is `"type": "module"`** so the exercises can use top-level await.
