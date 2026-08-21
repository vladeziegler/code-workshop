-- Module 10 solution — lead qualification tables (aria_ namespace, shared project).
-- Idempotent: pasting twice is harmless.

create table if not exists aria_account (
  id uuid primary key default gen_random_uuid(),
  domain text unique not null,
  name text,
  employees_count int,
  us_based boolean,
  premium_score int check (premium_score between 1 and 5),
  lead_quality int check (lead_quality between 1 and 5),
  est_budget text,
  response text check (response in ('Escalate','Reject','Confirm')),
  status text not null default 'new'
    check (status in ('new','rejected','escalated','confirmed')),
  created_at timestamptz default now()
);

create table if not exists aria_people (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references aria_account(id) on delete cascade,
  email text unique not null,
  full_name text,
  role text,
  request text,
  created_at timestamptz default now()
);

create table if not exists aria_news (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references aria_account(id) on delete cascade,
  fact text not null,
  source_url text,
  created_at timestamptz default now()
);

-- Service-key only: RLS on, zero policies (the anon key can authenticate, not read).
alter table aria_account enable row level security;
alter table aria_people  enable row level security;
alter table aria_news    enable row level security;

-- Demo reset (run by hand when you want a clean re-run):
-- delete from aria_news; delete from aria_people; delete from aria_account;
