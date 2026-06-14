-- Admin access-control foundation for Statstrive.
-- Adds active admin status, exam-scoped manual premium grants, and audit logging.

alter table public.admin_users
  add column if not exists is_active boolean not null default true,
  add column if not exists updated_at timestamptz not null default now();

drop trigger if exists admin_users_set_updated_at on public.admin_users;
create trigger admin_users_set_updated_at
before update on public.admin_users
for each row execute function public.set_updated_at();

create table if not exists public.manual_premium_grants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exam_id text not null,
  status text not null default 'active' check (status in ('active', 'revoked', 'expired')),
  reason text,
  granted_by uuid references auth.users(id) on delete set null,
  revoked_by uuid references auth.users(id) on delete set null,
  valid_from timestamptz not null default now(),
  valid_until timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, exam_id)
);

create index if not exists manual_premium_grants_user_idx on public.manual_premium_grants(user_id);
create index if not exists manual_premium_grants_exam_idx on public.manual_premium_grants(exam_id);
create index if not exists manual_premium_grants_status_idx on public.manual_premium_grants(status);

drop trigger if exists manual_premium_grants_set_updated_at on public.manual_premium_grants;
create trigger manual_premium_grants_set_updated_at
before update on public.manual_premium_grants
for each row execute function public.set_updated_at();

create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  target_user_id uuid references auth.users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_audit_logs_admin_idx on public.admin_audit_logs(admin_user_id);
create index if not exists admin_audit_logs_target_idx on public.admin_audit_logs(target_user_id);
create index if not exists admin_audit_logs_action_idx on public.admin_audit_logs(action);

alter table public.manual_premium_grants enable row level security;
alter table public.admin_audit_logs enable row level security;

drop policy if exists "manual_premium_grants_select_own" on public.manual_premium_grants;
create policy "manual_premium_grants_select_own"
  on public.manual_premium_grants for select
  using (auth.uid() = user_id);

-- Admin management reads/writes for grants and audit logs are intentionally
-- performed through server-only service-role APIs. No public insert/update/delete
-- policies are created here.
