-- Module 8 — everything the exercises need, in one paste.
--
-- Safe to run twice: every statement is `if not exists`. If you did Session 6,
-- `runs` already exists and this just adds the columns it's missing.
--
-- Supabase → SQL editor → paste → Run.

-- runs = fact. What actually happened, written after the work.
-- Exercises 03 and 20 read it; exercise 30 writes to it.
create table if not exists runs (
  id bigint generated always as identity primary key,
  kind text not null default 'scrape',
  status text not null default 'ok',
  started_at timestamptz not null default now()
);
alter table runs add column if not exists kind text not null default 'scrape';
alter table runs add column if not exists status text not null default 'ok';
alter table runs add column if not exists job_id uuid;
alter table runs add column if not exists detail jsonb;
alter table runs add column if not exists error text;
alter table runs add column if not exists finished_at timestamptz;

-- jobs = intent. Somebody asked for this, written before the work.
-- Exercise 30 inserts here and hands the id back as a claim ticket.
create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'research',
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

-- conversations = short-term memory: the message array, saved verbatim.
create table if not exists conversations (
  id text primary key,
  messages jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

-- memories = long-term memory: facts the agent chose to keep, scoped to a
-- conversation. conversation_id is supplied by your code, never by the model.
create table if not exists memories (
  id uuid primary key default gen_random_uuid(),
  conversation_id text not null,
  fact text not null,
  created_at timestamptz not null default now()
);
create index if not exists memories_conversation_idx on memories (conversation_id);

select 'module 8 migration ok' as result;
