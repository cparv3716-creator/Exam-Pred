alter table public.payments
  add column if not exists error_code text,
  add column if not exists error_description text,
  add column if not exists error_source text,
  add column if not exists error_step text,
  add column if not exists error_reason text,
  add column if not exists webhook_event_id text,
  add column if not exists updated_at timestamptz not null default now();

drop trigger if exists payments_set_updated_at on public.payments;
create trigger payments_set_updated_at
  before update on public.payments
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
     where razorpay_payment_id = p_razorpay_payment_id
     for update;

    if not found
       or v_existing_payment.user_id <> p_user_id
       or v_existing_payment.exam_id <> p_exam_id
       or v_existing_payment.plan_id <> p_plan_id
       or v_existing_payment.razorpay_order_id <> p_razorpay_order_id then
      raise exception 'Payment identifier is already associated with another purchase.';
    end if;

    if v_existing_payment.status = 'verified' then
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

    update public.payments
       set status = 'verified',
           razorpay_signature = coalesce(p_razorpay_signature, razorpay_signature),
           amount = p_amount,
           currency = p_currency,
           error_code = null,
           error_description = null,
           error_source = null,
           error_step = null,
           error_reason = null,
           updated_at = now()
     where id = v_existing_payment.id;
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

create or replace function public.record_failed_payment(
  p_user_id uuid,
  p_exam_id text,
  p_plan_id text,
  p_razorpay_order_id text,
  p_razorpay_payment_id text,
  p_amount integer,
  p_currency text,
  p_webhook_event_id text,
  p_error_code text,
  p_error_description text,
  p_error_source text,
  p_error_step text,
  p_error_reason text
)
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_order public.payment_orders%rowtype;
  v_existing_status text;
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
    raise exception 'Failed payment does not match a known purchase.';
  end if;

  insert into public.payments (
    user_id,
    exam_id,
    plan_id,
    razorpay_order_id,
    razorpay_payment_id,
    amount,
    currency,
    status,
    webhook_event_id,
    error_code,
    error_description,
    error_source,
    error_step,
    error_reason
  )
  values (
    p_user_id,
    p_exam_id,
    p_plan_id,
    p_razorpay_order_id,
    p_razorpay_payment_id,
    p_amount,
    p_currency,
    'failed',
    p_webhook_event_id,
    p_error_code,
    p_error_description,
    p_error_source,
    p_error_step,
    p_error_reason
  )
  on conflict (razorpay_payment_id) do nothing;

  select status
    into v_existing_status
    from public.payments
   where razorpay_payment_id = p_razorpay_payment_id
   for update;

  if v_existing_status <> 'verified' then
    update public.payments
       set status = 'failed',
           webhook_event_id = coalesce(p_webhook_event_id, webhook_event_id),
           error_code = p_error_code,
           error_description = p_error_description,
           error_source = p_error_source,
           error_step = p_error_step,
           error_reason = p_error_reason,
           updated_at = now()
     where razorpay_payment_id = p_razorpay_payment_id;

    update public.payment_orders
       set status = 'failed',
           updated_at = now()
     where razorpay_order_id = p_razorpay_order_id
       and status <> 'verified';
  end if;

  return coalesce(v_existing_status, 'failed');
end;
$$;

revoke all on function public.record_failed_payment(
  uuid, text, text, text, text, integer, text, text, text, text, text, text, text
) from public;

revoke all on function public.record_failed_payment(
  uuid, text, text, text, text, integer, text, text, text, text, text, text, text
) from anon;

revoke all on function public.record_failed_payment(
  uuid, text, text, text, text, integer, text, text, text, text, text, text, text
) from authenticated;

grant execute on function public.record_failed_payment(
  uuid, text, text, text, text, integer, text, text, text, text, text, text, text
) to service_role;
