-- Muse Scout tables. scout_ prefix = this module's namespace inside the
-- program's shared Supabase project. Idempotent: pasting twice is harmless.

-- Conversations: the message array, persisted. The id comes from the CLIENT
-- (useChat's chat id) — the service stores under whatever id the plug names.
create table if not exists scout_conversations (
  id text primary key,
  title text not null default 'Untitled',
  messages jsonb not null default '[]',
  updated_at timestamptz not null default now()
);

-- Memories: durable facts that outlive any single conversation.
create table if not exists scout_memories (
  id uuid primary key default gen_random_uuid(),
  fact text not null,
  created_at timestamptz not null default now()
);

-- Jobs = intent (the queue). Runs = fact (what actually happened).
-- Inherited verbatim from Module 8 — one decision, reused.
create table if not exists scout_jobs (
  id uuid primary key default gen_random_uuid(),
  kind text not null,
  payload jsonb not null default '{}',
  status text not null default 'queued',
  created_at timestamptz not null default now()
);

create table if not exists scout_runs (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references scout_jobs(id),
  kind text not null,
  status text not null,
  detail text,
  created_at timestamptz not null default now()
);
