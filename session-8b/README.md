# Session 8b — One agent, many ways to use it

Build a 15-line web-search agent, wrap it in an API endpoint, deploy it to a URL —
then connect a terminal, curl, and a real chat page to it. By the end, the same
page drives a completely different agent by changing one environment variable.

**Your guide during the session is [HANDOUT.md](HANDOUT.md)** — every step, every
command, every prompt, in order. Stuck? [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
has the symptom → fix table.

## What's in here

| Folder | What it is |
|---|---|
| `backend/` | the agent (`lib/agent.ts`) + the API that serves it (`app/api/`) — deploys to Vercel |
| `frontend/` | the chat page (muse-console) — a second Vercel deploy from the same repo |
| `clients/` | proof the API needs nothing special: a curl script and a terminal chat app, no API key in either |
| `backend/exercises/` | five small scripts, one per claim from the session — `npm run ex <n>` |
| `backend/openapi.json` | the API described for Swagger — import it at editor.swagger.io |

## Before the session

- Node 20+, git, a GitHub account connected to a Vercel account
- An OpenAI API key with credit (web-search calls are billed per search)
- A Supabase project (free tier is fine) — used from step 07 on

## Quickstart (step 01 — the agent on your laptop)

```sh
cd backend
npm install
cp .env.example .env.local     # then paste your OPENAI_API_KEY into it
npm run tui
```

Ask it something newer than the model's knowledge — watch it decide to search.
Everything after this moment is about letting other people reach that agent:
the handout takes it from here.

## The rule that keeps you safe

Real keys live in `.env.local` (gitignored) and in your deployment platform's
environment variables — never in git. The `.env.example` files document which
names you need; they never hold values.
