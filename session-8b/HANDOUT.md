# Session 8b — The Plug · student handout

Everything you type today, in order. Full code lives in this repo; catch up at
any boundary with `git checkout step-NN && npm install`. Fill `backend/.env.local`
from `.env.example` before step 01 (values arrive in the preflight message).

---

## 1.1 — The agent (hand-type this, all of it)

`backend/lib/agent.ts`:

```ts
import { ToolLoopAgent, isStepCount } from "ai";
import { openai } from "@ai-sdk/openai";

export const scoutAgent = new ToolLoopAgent({
  model: openai("gpt-5.6-terra"),
  instructions:
    "You are Muse Scout, a research agent. Search before answering anything " +
    "factual, cite your sources inline, and say so when you could not verify " +
    "a claim. Answer in markdown, and be brief.",
  tools: {
    web_search: openai.tools.webSearch({ searchContextSize: "low" }),
  },
  stopWhen: isStepCount(4),
});
```

## 1.2 — 🤖 the scaffold

```text
Scaffold a minimal Next.js 16 App Router app in backend/ (no pages, API only),
pinned to: ai@7.0.52, @ai-sdk/openai@4.0.30, next@16.2.12, react@19.2.8, zod@4.
Add lib/agent.ts (I'll paste mine), an exercises/01-tui-local.ts that runs
runAgentTUI({ agent }) from @ai-sdk/tui@1.0.53, and npm scripts: tui, ex.
Env: OPENAI_API_KEY in .env.local, names documented in .env.example.
```

**Run it** · `cd backend && npm install && npm run tui`
**✅** Ask something newer than the model. The `web_search` card appears — you never scripted it — and the answer carries source URLs.

---

## 2.1 — The socket (hand-type; three lines that matter)

`backend/app/api/chat/route.ts`:

```ts
import { createAgentUIStreamResponse } from "ai";
import { scoutAgent } from "@/lib/agent";

export const maxDuration = 300;

export async function POST(req: Request) {
  const { messages } = await req.json();
  return createAgentUIStreamResponse({ agent: scoutAgent, uiMessages: messages, sendSources: true });
}
```

Paste `app/api/health/route.ts` from the repo.

## 2.2 — Deploy

1. Create the GitHub repo and push (from the project root — the repo holds `backend/` *and* `frontend/`; Vercel picks the folder later):

```sh
git init -b main && git add -A && git commit -m "muse-scout"
gh repo create muse-scout --private --source=. --push
```

No `gh` CLI? [github.com/new](https://github.com/new) → create empty repo `muse-scout`, then:

```sh
git remote add origin https://github.com/<you>/muse-scout.git
git push -u origin main
```

2. [vercel.com/new](https://vercel.com/new) → **Import** your repo → **Root Directory = `backend`** → Deploy
3. Project → Settings → Environment Variables → `OPENAI_API_KEY` (paste value) → **Redeploy**

From here on, **deploy = `git push`** — never `vercel deploy` from a laptop.

**Run it** · `curl https://muse-scout-<you>.vercel.app/api/health`
**Expect** · `{"ok":true,"service":"muse-scout"}`
*(The bare domain 404s. Correct — there are no pages.)*

---

## 3.1 — The raw wire (hand-type)

`clients/curl-wire.sh`:

```sh
SCOUT_URL="${SCOUT_URL:?export SCOUT_URL=https://muse-scout-<you>.vercel.app}"
curl -N -X POST "$SCOUT_URL/api/chat" \
  -H 'content-type: application/json' \
  -d '{"messages":[{"id":"m1","role":"user","parts":[{"type":"text","text":"What happened in AI news today? Two lines, with sources."}]}]}'
```

First run: you'll get a **302 auth page**, not a stream. Dashboard → Deployment
Protection → **off** (protects nothing here — the socket has no secrets in its
responses; the key stays server-side). Re-run and read the chunks.

## 3.2 — Optional: the remote TUI (paste from repo: `clients/tui-remote.ts`, `clients/package.json`)

*Not covered live — for the curious after the session. Same point as the curl: a full chat app whose package has no OpenAI dependency and no key.*

**Run it** · `cd clients && npm install && SCOUT_URL=https://muse-scout-<you>.vercel.app npm run tui:remote`
**✅** A full conversation, from a package whose `package.json` has no `@ai-sdk/openai` and whose env has no key.

---

## 4.1 — The logbook (hand-type, 3 lines into the route options)

```ts
onStepEnd({ stepNumber, usage, finishReason }) {
  console.log(`[scout] step ${stepNumber} · ${JSON.stringify(usage)} · ${finishReason}`);
},
```

`git push`, then: **Run it** · `vercel logs https://muse-scout-<you>.vercel.app --follow`
**✅** Fire a TUI message; the `[scout] step 0 · {tokens} · stop` line appears in the tail.

---

## 5.0 — 🤖 the frontend scaffold

```text
Scaffold a Next.js 16 App Router app in frontend/ on port 3001, pinned to:
ai@7.0.52, @ai-sdk/react@4.0.55, next@16.2.12, react@19.2.8, react-markdown@10.
Dark product theme. Build these components (no wiring yet, I'll do that next):
Sidebar (conversation list), Messages, ToolChip (tool state machine),
SourceCard, Composer, JobStatus (ticket card), StageChip.
One env var: NEXT_PUBLIC_SCOUT_URL, in .env.local, documented in .env.example.
```

Fell behind? `git checkout step-05 && npm install` gives you the same result.

## 5.1 — The console (components are in `frontend/`; you wire them)

Hand-type `frontend/lib/transport.ts`:

```ts
import { DefaultChatTransport } from "ai";
export const SCOUT_URL = process.env.NEXT_PUBLIC_SCOUT_URL ?? "";
export const chatTransport = new DefaultChatTransport({ api: `${SCOUT_URL}/api/chat` });
```

`frontend/.env.local`: `NEXT_PUBLIC_SCOUT_URL=https://muse-scout-<you>.vercel.app`

## 5.2 — 🤖 the wiring

```text
Wire the muse-console frontend: page.tsx uses useChat({ id, transport }) from
@ai-sdk/react with the transport from lib/transport.ts. Composer calls
sendMessage({ text }) on Enter (Shift+Enter = newline), shows a stop button
while streaming. Messages renders message.parts: text via react-markdown with
a blinking cursor on the last part, tool-* parts through ToolChip with their
state machine, source-url parts as SourceCards. Auto-scroll unless the reader
scrolled up.
```

**Run it** · `cd frontend && npm install && npm run dev` → http://localhost:3001

Submit → **nothing**. Open DevTools (⌥⌘I) → Console: the CORS block. Note curl
still works. Do NOT proxy (we'll show you why); fix the socket:

## 5.3 — The CORS fix (hand-type on the BACKEND)

`backend/lib/cors.ts`:

```ts
export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
} as const;

export function preflight() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}
```

In the chat route: `export const OPTIONS = preflight;` and add
`headers: CORS_HEADERS,` to the `createAgentUIStreamResponse` options.
`git push` (scout redeploys; the console doesn't).

**✅** localhost:3001 streams token-by-token; the `web_search` chip runs to ✓ with source cards.

---

## 6.1 — Deploy the console

1. Vercel → Add New Project → **same repo** → **Root Directory = `frontend`**
2. Environment Variables → `NEXT_PUBLIC_SCOUT_URL` = your scout URL → **Redeploy**
   (*set after the first build? It won't work until you rebuild — the var is inlined.*)
3. Deployment Protection → off

**✅** `https://muse-console-<you>.vercel.app` answers on your phone.

---

## 7.1 — Tables (paste once in Supabase SQL editor — idempotent, double-paste is safe)

The full file is `backend/migration.sql`. The one you'll talk about:

```sql
create table if not exists scout_conversations (
  id text primary key,
  title text not null default 'Untitled',
  messages jsonb not null default '[]',
  updated_at timestamptz not null default now()
);
```

Add to the **scout's** Vercel env (never the console's): `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`.

## 7.2 — The route grows (hand-type the load/save; store bodies are 🤖)

```ts
const { id, messages }: { id?: string; messages: UIMessage[] } = await req.json();
// Any id overlap → the browser already carries the history: use ITS copy.
// No overlap → a fresh plug joining by id: prepend everything we remember.
// (Never both — duplicated history replays provider items and OpenAI 400s
// with "Duplicate item found with id rs_…".)
const stored = id ? await loadConversation(id) : [];
const incoming = new Set(messages.map((m) => m.id));
const clientIsSynced = stored.some((m) => incoming.has(m.id));
const uiMessages = clientIsSynced ? messages : [...stored, ...messages];
// …and in the options:
onFinish: async ({ messages: finalMessages }) => {
  if (id) await saveConversation(id, finalMessages);
},
```

🤖 box:

```text
Add backend/lib/store.ts with a Supabase service-role client and:
loadConversation(id) -> UIMessage[], saveConversation(id, messages) upserting
scout_conversations with a title from the first user message,
listConversations() -> last 30 {id,title,updated_at}, listMemories() and
addMemory(fact) over scout_memories. Add GET /api/conversations and
GET /api/conversations/[id] routes with the CORS headers, and a `remember`
tool on the agent that stores durable user facts via addMemory; inject
listMemories() into the instructions per request.
```

`git push`. **✅ three ways:**
- chat → hard-refresh → still there; the sidebar lists it and reopens it
- `npm run ex 03 <conversation-id>` — a script recalls what you told the browser
- "New chat" → "what do you know about me?" → your saved facts surface

---

## 8.1 — The ticket (hand-type just the split; the rest is 🤖 / repo)

```ts
const { data } = await supabase().from("scout_jobs")
  .insert({ kind: "deep_dive", payload: { topic } }).select("id").single();
after(() => runDeepDive(data.id, topic));   // work outlives the reply
return { job_id: data.id, note: "Deep dive queued …" };
```

**✅** Ask the console for "a deep dive on …" → ticket card appears instantly →
flips `queued → running → done` by itself → and `curl …/api/jobs/<id>` returns
the same report. *(If a ticket never flips: check the scout's function logs —
step 04 is your debugger now.)*

---

## 8.2 — See the whole API in Swagger

Your backend now has five endpoints. `backend/openapi.json` describes them all.

1. Open [editor.swagger.io](https://editor.swagger.io) → **File → Import file** → pick `backend/openapi.json`
2. The five endpoints render as an interactive list; **Try it out** calls your production URL directly (CORS is already open)

**Caveat** · `POST /api/chat` streams and Swagger buffers — it stays silent until the stream finishes. `curl -N` (section 3.1) is how you *watch* a stream. The other four endpoints work perfectly here.

## 9.1 — A socket you don't own

`curl -X OPTIONS https://<muse-studio-url>/api/chat -H "Origin: http://localhost:3001" -sI`
→ 204, **no** `access-control-allow-origin`. Your browser can't call it. Curl can.

## 9.2 — The piping relay (paste from repo: `frontend/app/api/relay/route.ts`)

The whole trick is one line: `return new Response(upstream.body)` — chunks flow
through. (`await upstream.text()` is the step-05 proxy that ate the stream.)

## 9.3 — 🤖 StageChip

```text
Add a StageChips component that renders any message part whose type starts
with "data-": key by part id (re-emits with the same id must update in place,
not append), show data.shape/kind, data.label, data.detail, a status dot for
running/done/failed, and data.ms as seconds. No imports from any agent
codebase — the part carries its own shape.
```

## 9.4 — Flip local

`frontend/.env.local`:

```text
NEXT_PUBLIC_SCOUT_URL=
NEXT_PUBLIC_USE_RELAY=1
NEXT_PUBLIC_AGENT_LABEL=muse studio
RELAY_TARGET=https://<muse-studio-url>
```

**Run it** · `npm run dev` → *"Put together a launch campaign kit for Muse's spring collab with a premium womenswear label — research the market first."*
**✅** The stage rail animates: router ✓ · fan-out with source counts · drafts · the judge rejecting one in red. Your console. Their factory.

---

## 10 — Ship the patch

On the deployed muse-console (Vercel → Settings → Environment Variables), set the
same four values as 9.4 → **Redeploy** (you know why). Phone out.

To patch back to scout: restore `NEXT_PUBLIC_SCOUT_URL`, set `NEXT_PUBLIC_USE_RELAY=0`, redeploy.

**✅ Capstone question:** would you send your console's URL to a client tonight?
What's the one thing you'd add first? *(The honest answer is auth — any visitor
spends your key. Next module inherits that requirement.)*
