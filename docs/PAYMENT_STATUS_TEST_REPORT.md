# Payment Status Test Report

## Automated verification

- Production build: passed with `npm run build` on June 14, 2026.
- TypeScript: covered by `npm run build`.
- Payment status API authentication: enforced with `getCurrentUser()`.
- Premium source of truth: `user_exam_subscriptions`, via
  `getActiveExamSubscription()` and `getAnyActiveExamSubscription()`.

## Scenario matrix

| Scenario | Expected result | Verification |
| --- | --- | --- |
| Successful Razorpay checkout | Browser routes to `/payment/status?order_id=...&examId=...&planId=...` after the success handler, regardless of transient browser verification errors. | Code path verified in `RazorpayPricing`. Razorpay sandbox checkout required for end-to-end confirmation. |
| Active subscription | Status API returns `active`; page shows `Payment successful`, `Premium unlocked`, exam, plan, expiry, and dashboard button. | API and UI state implemented. Requires an authenticated database fixture or sandbox payment for live confirmation. |
| Cancelled checkout | Razorpay modal dismissal routes to `/payment/failure?reason=cancelled`. | Code path verified in `RazorpayPricing`. |
| Razorpay payment failure | Razorpay `payment.failed` event routes to `/payment/failure`. | Code path verified in `RazorpayPricing`. |
| Verified payment still activating | Status API returns `verified_but_activating`; page continues polling for up to 20 seconds. | API precedence and polling behavior implemented. |
| Dashboard premium access | Active access is read from `user_exam_subscriptions`, never `user_subscriptions`. | Verified in `lib/backend/payments.ts`, `lib/backend/access.ts`, and `/api/access/check`. |
