create extension if not exists pgcrypto;

-- payment_orders existed in the auth foundation migration. Upgrade it to the
-- exam-scoped payment contract before enforcing the new required columns.
alter table public.payment_orders
  add column if not exists exam_id text,
  add column if not exists plan_id text,
  add column if not exists updated_at timestamptz default now();

-- Pre-subscription order stubs have no trustworthy exam/plan association and
-- cannot be verified safely under the new contract.
delete from public.payment_orders
where user_id is null
   or razorpay_order_id is null
   or amount is null
   or exam_id is null
   or plan_id is null;

alter table public.payment_orders
  alter column user_id set not null,
  alter column user_id drop default,
  alter column exam_id set not null,
  alter column plan_id set not null,
  alter column razorpay_order_id set not null,
  alter column amount set not null,
  alter column currency set default 'INR',
  alter column currency set not null,
  alter column status set default 'created',
  alter column status set not null,
  alter column created_at set default now(),
  alter column created_at set not null,
  alter column updated_at set default now(),
  alter column updated_at set not null;

alter table public.payment_orders
  drop constraint if exists payment_orders_user_id_fkey;

alter table public.payment_orders
  add constraint payment_orders_user_id_fkey
  foreign key (user_id) references auth.users(id) on delete cascade;

create unique index if not exists payment_orders_razorpay_order_id_idx
  on public.payment_orders (razorpay_order_id);

create index if not exists payment_orders_user_id_idx
  on public.payment_orders (user_id);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exam_id text not null,
  plan_id text not null,
  razorpay_order_id text not null,
  razorpay_payment_id text not null,
  razorpay_signature text,
  amount integer not null,
  currency text not null default 'INR',
  status text not null default 'verified',
  created_at timestamptz not null default now()
);

create index if not exists payments_user_id_idx
  on public.payments (user_id);

create unique index if not exists payments_razorpay_payment_id_idx
  on public.payments (razorpay_payment_id);

create table if not exists public.user_exam_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exam_id text not null,
  plan_id text not null,
  status text not null default 'active',
  valid_from timestamptz not null default now(),
  valid_until timestamptz not null,
  source_payment_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, exam_id)
);

create index if not exists user_exam_subscriptions_user_id_idx
  on public.user_exam_subscriptions (user_id);

create index if not exists user_exam_subscriptions_exam_id_idx
  on public.user_exam_subscriptions (exam_id);

create index if not exists user_exam_subscriptions_status_idx
  on public.user_exam_subscriptions (status);

alter table public.payment_orders enable row level security;
alter table public.payments enable row level security;
alter table public.user_exam_subscriptions enable row level security;

drop policy if exists "payment_orders_select_own" on public.payment_orders;
create policy "payment_orders_select_own"
  on public.payment_orders
  for select
  using (auth.uid() = user_id);

drop policy if exists "payments_select_own" on public.payments;
create policy "payments_select_own"
  on public.payments
  for select
  using (auth.uid() = user_id);

drop policy if exists "user_exam_subscriptions_select_own" on public.user_exam_subscriptions;
create policy "user_exam_subscriptions_select_own"
  on public.user_exam_subscriptions
  for select
  using (auth.uid() = user_id);

drop trigger if exists payment_orders_set_updated_at on public.payment_orders;
create trigger payment_orders_set_updated_at
  before update on public.payment_orders
  for each row execute function public.set_updated_at();

drop trigger if exists user_exam_subscriptions_set_updated_at on public.user_exam_subscriptions;
create trigger user_exam_subscriptions_set_updated_at
  before update on public.user_exam_subscriptions
  for each row execute function public.set_updated_at();

create or replace function public.activate_verified_payment(
  p_user_id uuid,
  p_exam_id text,
  p_plan_id text,
  p_razorpay_order_id text,
  p_razorpay_payment_id text,
  p_razorpay_signature text,
  p_amount integer,
  p_currency text,
  p_duration_months integer
)
returns table(valid_until timestamptz, already_processed boolean)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_order public.payment_orders%rowtype;
  v_existing_payment public.payments%rowtype;
  v_inserted_payment_id uuid;
  v_valid_until timestamptz;
begin
  select *
    into v_order
    from public.payment_orders
   where razorpay_order_id = p_razorpay_order_id
   for update;

  if not found
     or v_order.user_id <> p_user_id
     or v_order.exam_id <> p_exam_id
     or v_order.plan_id <> p_plan_id
     or v_order.amount <> p_amount
     or v_order.currency <> p_currency then
    raise exception 'Payment order does not match the authenticated purchase.';
  end if;

  insert into public.payments (
    user_id,
    exam_id,
    plan_id,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    amount,
    currency,
    status
  )
  values (
    p_user_id,
    p_exam_id,
    p_plan_id,
    p_razorpay_order_id,
    p_razorpay_payment_id,
    p_razorpay_signature,
    p_amount,
    p_currency,
    'verified'
  )
  on conflict (razorpay_payment_id) do nothing
  returning id into v_inserted_payment_id;

  if v_inserted_payment_id is null then
    select *
      into v_existing_payment
      from public.payments
     where razorpay_payment_id = p_razorpay_payment_id;

    if not found
       or v_existing_payment.user_id <> p_user_id
       or v_existing_payment.exam_id <> p_exam_id
       or v_existing_payment.plan_id <> p_plan_id
       or v_existing_payment.razorpay_order_id <> p_razorpay_order_id then
      raise exception 'Payment identifier is already associated with another purchase.';
    end if;

    select subscription.valid_until
      into v_valid_until
      from public.user_exam_subscriptions as subscription
     where subscription.user_id = p_user_id
       and subscription.exam_id = p_exam_id;

    if v_valid_until is null then
      raise exception 'Verified payment requires subscription reconciliation.';
    end if;

    return query select v_valid_until, true;
    return;
  end if;

  update public.payment_orders
     set status = 'verified',
         verified_at = coalesce(verified_at, now()),
         updated_at = now()
   where razorpay_order_id = p_razorpay_order_id;

  insert into public.user_exam_subscriptions (
    user_id,
    exam_id,
    plan_id,
    status,
    valid_from,
    valid_until,
    source_payment_id
  )
  values (
    p_user_id,
    p_exam_id,
    p_plan_id,
    'active',
    now(),
    now() + make_interval(months => p_duration_months),
    p_razorpay_payment_id
  )
  on conflict (user_id, exam_id) do update
    set plan_id = excluded.plan_id,
        status = 'active',
        valid_until = greatest(public.user_exam_subscriptions.valid_until, now())
          + make_interval(months => p_duration_months),
        source_payment_id = excluded.source_payment_id,
        updated_at = now()
  returning public.user_exam_subscriptions.valid_until into v_valid_until;

  return query select v_valid_until, false;
end;
$$;

revoke all on function public.activate_verified_payment(
  uuid, text, text, text, text, text, integer, text, integer
) from public;

revoke all on function public.activate_verified_payment(
  uuid, text, text, text, text, text, integer, text, integer
) from anon;

revoke all on function public.activate_verified_payment(
  uuid, text, text, text, text, text, integer, text, integer
) from authenticated;

grant execute on function public.activate_verified_payment(
  uuid, text, text, text, text, text, integer, text, integer
) to service_role;
