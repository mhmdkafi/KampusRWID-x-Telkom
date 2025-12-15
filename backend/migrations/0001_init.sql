create extension if not exists pgcrypto;

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  company text not null,
  location text,
  skills text[] default '{}',
  description text,
  created_at timestamptz default now()
);

create table if not exists public.cvs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  filename text not null,
  storage_path text not null,
  text_content text,
  created_at timestamptz default now()
);

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  job_id uuid not null references public.jobs(id) on delete cascade,
  score numeric not null,
  explanation jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_matches_user on public.matches(user_id);
create index if not exists idx_matches_job on public.matches(job_id);