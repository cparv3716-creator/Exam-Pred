# Premium Access Test Report

## Automated checks

- TypeScript: passed with `npx tsc --noEmit`.
- Production build: passed with `npm run build` on June 14, 2026.
- Source-of-truth audit: premium helpers query only
  `user_exam_subscriptions`; no `user_subscriptions` access is used.

## Scenario matrix

| Test case | Expected result | Coverage |
| --- | --- | --- |
| Active CAT subscription | Dashboard shows `CAT Premium Active`, plan, expiry, and `Continue CAT Premium`. | Implemented through `getUserExamSubscriptions()` and `PremiumSubscriptionsPanel`. |
| No active subscription | Dashboard shows `No premium plan active` and `Upgrade to Premium`. | Implemented empty state. |
| Expired subscription | Dashboard lists the plan under `Expired plans`; active helper returns false. | Expiry is checked against the current time in both dashboard rendering and database access helpers. |
| Unpaid premium route | Server redirects the user to pricing before premium content renders. | Implemented on analytics, mocks, predicted questions, and topic probability routes. |
| Paid premium route | Server finds the matching active exam subscription and renders premium content. | Implemented with `requireActiveExamSubscription()`. |
| Premium practice planner | Any active exam subscription allows the planner; unpaid and expired users are redirected to pricing. | Implemented with `requireAnyActiveExamSubscription()`. |
| Multiple exams | CAT, ISI MSQE, UGC NET, JEE Main/Advanced, and NEET slugs map to their exam-scoped subscriptions. | Implemented with `getPaymentExamIdForSlug()`. |

## Live fixture checks

Authenticated active, unpaid, and expired database fixtures are required to
confirm redirects and card text end to end in a deployed or local Supabase
environment.
