# Razorpay Webhooks

The webhook endpoint is:

```text
POST /api/payments/webhook
```

The endpoint does not use the browser session or modify the authentication flow.
It verifies Razorpay's signature against the raw request body before parsing or
processing any event.

## Environment Variables

Configure these variables on the server:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

NEXT_PUBLIC_RAZORPAY_KEY_ID=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
NEXT_PUBLIC_APP_NAME=
```

`RAZORPAY_WEBHOOK_SECRET` is the secret entered while creating the webhook in
the Razorpay Dashboard. It is separate from `RAZORPAY_KEY_SECRET`.

Never expose `SUPABASE_SERVICE_ROLE_KEY`, `RAZORPAY_KEY_SECRET`, or
`RAZORPAY_WEBHOOK_SECRET` through a `NEXT_PUBLIC_` variable.

Apply the Supabase migrations before enabling webhook delivery:

```text
003_payment_subscriptions.sql
004_razorpay_webhooks.sql
```

## Razorpay Test-Mode Setup

1. Open the Razorpay Dashboard and switch to **Test Mode**.
2. Create a webhook with a public HTTPS URL:

   ```text
   https://your-test-host.example/api/payments/webhook
   ```

3. Set a strong webhook secret and configure the same value as
   `RAZORPAY_WEBHOOK_SECRET` on the test deployment.
4. Subscribe to:
   - `payment.captured`
   - `payment.failed`
   - `order.paid`
5. Deploy or restart the application after setting the environment variable.
6. Log in to Statstrive, open `/pricing`, select an exam and paid plan, and
   complete a Razorpay test payment.
7. Confirm:
   - `payment_orders.status` becomes `verified`.
   - A `payments` row exists with status `verified`.
   - `user_exam_subscriptions` contains active access for the purchased exam.
   - Re-delivering the same event does not extend access a second time.
8. Trigger a failed test payment and confirm:
   - The failure is logged by the webhook route.
   - The `payments` row stores status `failed` and Razorpay error metadata.
   - The order is marked `failed` unless it was already verified.
   - Existing paid access is not revoked by a failed retry.

Razorpay cannot deliver webhooks directly to `localhost`. Use a supported
public HTTPS tunnel or a staging deployment. Razorpay's current documentation
recommends `zrok` for localhost testing:

https://razorpay.com/docs/webhooks/validate-test/

## Processing Rules

- Unknown local Razorpay orders are acknowledged and ignored.
- Amount and currency must match the trusted local `payment_orders` row.
- `payment.captured` and `order.paid` both activate access through the same
  idempotent database function.
- Duplicate webhook delivery is safe.
- A later successful capture can upgrade a previously failed payment record.
- Failed events never deactivate an already verified subscription.
