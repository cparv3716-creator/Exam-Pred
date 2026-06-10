-- ============================================================================
-- ExamIQ — Practice Progress foundation
-- Migration: 001_practice_progress
--
-- Creates the first real backend tables for saving practice attempts,
-- bookmarks, and progress. Designed for Supabase / PostgreSQL.
--
-- Safe to run on a fresh Supabase project. Row Level Security is enabled so a
-- user can only read/write their own rows. Apply with:
--   supabase db push      (Supabase CLI)
--   or paste into the Supabase SQL editor.
-- ============================================================================

create extension if not exists "pgcrypto";  -- for gen_random_uuid()

-- ----------------------------------------------------------------------------
-- Helper: keep updated_at fresh
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- 1. profiles  (1:1 with auth.users)
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  plan         text not null default 'free' check (plan in ('free', 'premium')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create a profile row when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', null))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists trg_on_auth_user_created on auth.users;
create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 2. practice_attempts
-- ----------------------------------------------------------------------------
create table if not exists public.practice_attempts (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users (id) on delete cascade,
  exam               text not null,
  section            text not null,
  question_id        text not null,
  question_source    text not null,
  selected_answer    text,
  correct_answer     text,
  is_correct         boolean,
  time_spent_seconds integer check (time_spent_seconds is null or time_spent_seconds >= 0),
  difficulty         text,
  topic              text,
  subtopic           text,
  attempted_at       timestamptz not null default now()
);

create index if not exists idx_practice_attempts_user        on public.practice_attempts (user_id);
create index if not exists idx_practice_attempts_user_question on public.practice_attempts (user_id, question_id);
create index if not exists idx_practice_attempts_user_exam    on public.practice_attempts (user_id, exam, section);
create index if not exists idx_practice_attempts_attempted_at on public.practice_attempts (attempted_at desc);

-- ----------------------------------------------------------------------------
-- 3. question_bookmarks
-- ----------------------------------------------------------------------------
create table if not exists public.question_bookmarks (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users (id) on delete cascade,
  exam            text not null,
  section         text not null,
  question_id     text not null,
  question_source text not null,
  created_at      timestamptz not null default now(),
  unique (user_id, question_id)
);

create index if not exists idx_bookmarks_user      on public.question_bookmarks (user_id);
create index if not exists idx_bookmarks_user_exam on public.question_bookmarks (user_id, exam, section);

-- ----------------------------------------------------------------------------
-- 4. practice_sessions
-- ----------------------------------------------------------------------------
create table if not exists public.practice_sessions (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users (id) on delete cascade,
  exam                text not null,
  section             text,
  started_at          timestamptz not null default now(),
  ended_at            timestamptz,
  questions_attempted integer not null default 0 check (questions_attempted >= 0),
  questions_correct   integer not null default 0 check (questions_correct >= 0),
  total_time_seconds  integer not null default 0 check (total_time_seconds >= 0)
);

create index if not exists idx_sessions_user      on public.practice_sessions (user_id);
create index if not exists idx_sessions_user_exam on public.practice_sessions (user_id, exam);

-- ============================================================================
-- Row Level Security — every user sees only their own rows.
-- ============================================================================
alter table public.profiles          enable row level security;
alter table public.practice_attempts enable row level security;
alter table public.question_bookmarks enable row level security;
alter table public.practice_sessions enable row level security;

-- profiles
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_upsert_own" on public.profiles;
create policy "profiles_upsert_own" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- practice_attempts
drop policy if exists "attempts_select_own" on public.practice_attempts;
create policy "attempts_select_own" on public.practice_attempts
  for select using (auth.uid() = user_id);

drop policy if exists "attempts_insert_own" on public.practice_attempts;
create policy "attempts_insert_own" on public.practice_attempts
  for insert with check (auth.uid() = user_id);

drop policy if exists "attempts_delete_own" on public.practice_attempts;
create policy "attempts_delete_own" on public.practice_attempts
  for delete using (auth.uid() = user_id);

-- question_bookmarks
drop policy if exists "bookmarks_select_own" on public.question_bookmarks;
create policy "bookmarks_select_own" on public.question_bookmarks
  for select using (auth.uid() = user_id);

drop policy if exists "bookmarks_insert_own" on public.question_bookmarks;
create policy "bookmarks_insert_own" on public.question_bookmarks
  for insert with check (auth.uid() = user_id);

drop policy if exists "bookmarks_delete_own" on public.question_bookmarks;
create policy "bookmarks_delete_own" on public.question_bookmarks
  for delete using (auth.uid() = user_id);

-- practice_sessions
drop policy if exists "sessions_select_own" on public.practice_sessions;
create policy "sessions_select_own" on public.practice_sessions
  for select using (auth.uid() = user_id);

drop policy if exists "sessions_insert_own" on public.practice_sessions;
create policy "sessions_insert_own" on public.practice_sessions
  for insert with check (auth.uid() = user_id);

drop policy if exists "sessions_update_own" on public.practice_sessions;
create policy "sessions_update_own" on public.practice_sessions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================================
-- End of migration 001_practice_progress
-- ============================================================================
