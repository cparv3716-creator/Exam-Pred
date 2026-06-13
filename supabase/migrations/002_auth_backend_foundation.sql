create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text default 'student',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.user_exam_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  exam_slug text not null,
  target_year int,
  target_month text,
  current_level text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.practice_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  exam_slug text not null,
  question_id text not null,
  source_type text default 'pyq',
  selected_answer text,
  correct_answer text,
  is_correct boolean,
  time_spent_seconds int,
  attempted_at timestamptz default now()
);

create table if not exists public.practice_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  exam_slug text not null,
  topic text,
  subtopic text,
  attempted_count int default 0,
  correct_count int default 0,
  accuracy numeric default 0,
  last_practiced_at timestamptz,
  updated_at timestamptz default now()
);

create table if not exists public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  exam_slug text not null,
  question_id text not null,
  note text,
  created_at timestamptz default now()
);

create table if not exists public.user_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  plan text default 'free',
  status text default 'active',
  starts_at timestamptz default now(),
  ends_at timestamptz,
  razorpay_customer_id text,
  razorpay_subscription_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.payment_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  razorpay_order_id text,
  amount int,
  currency text default 'INR',
  status text default 'created',
  created_at timestamptz default now(),
  verified_at timestamptz
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text default 'admin',
  permissions jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
alter table public.user_exam_preferences enable row level security;
alter table public.practice_attempts enable row level security;
alter table public.practice_progress enable row level security;
alter table public.bookmarks enable row level security;
alter table public.user_subscriptions enable row level security;
alter table public.payment_orders enable row level security;
alter table public.admin_users enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "preferences_crud_own" on public.user_exam_preferences;
create policy "preferences_crud_own" on public.user_exam_preferences for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "attempts_crud_own" on public.practice_attempts;
create policy "attempts_crud_own" on public.practice_attempts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "progress_select_own" on public.practice_progress;
create policy "progress_select_own" on public.practice_progress for select using (auth.uid() = user_id);

drop policy if exists "progress_update_own" on public.practice_progress;
create policy "progress_update_own" on public.practice_progress for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "bookmarks_crud_own" on public.bookmarks;
create policy "bookmarks_crud_own" on public.bookmarks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "subscriptions_select_own" on public.user_subscriptions;
create policy "subscriptions_select_own" on public.user_subscriptions for select using (auth.uid() = user_id);

drop policy if exists "payment_orders_select_own" on public.payment_orders;
create policy "payment_orders_select_own" on public.payment_orders for select using (auth.uid() = user_id);

drop policy if exists "admin_users_select_own" on public.admin_users;
create policy "admin_users_select_own" on public.admin_users for select using (auth.uid() = user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();

drop trigger if exists preferences_set_updated_at on public.user_exam_preferences;
create trigger preferences_set_updated_at before update on public.user_exam_preferences for each row execute function public.set_updated_at();

drop trigger if exists progress_set_updated_at on public.practice_progress;
create trigger progress_set_updated_at before update on public.practice_progress for each row execute function public.set_updated_at();

drop trigger if exists subscriptions_set_updated_at on public.user_subscriptions;
create trigger subscriptions_set_updated_at before update on public.user_subscriptions for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name', 'student')
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(public.profiles.full_name, excluded.full_name),
        updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
