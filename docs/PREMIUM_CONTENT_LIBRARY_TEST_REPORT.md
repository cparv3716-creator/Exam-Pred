# Premium Content Library Test Report

## Automated checks

- TypeScript: passed with `npx tsc --noEmit`.
- Production build: passed with `npm run build` on June 14, 2026.
- Payment and subscription mutation code was not changed.
- Premium access continues to read only from `user_exam_subscriptions`.

## Scenario matrix

| Scenario | Expected result | Coverage |
| --- | --- | --- |
| Active CAT subscriber | CAT workspace shows six premium content cards with live availability counts. | Availability is derived from CAT candidate, paper, prediction-spec, backtest, practice, and download files. |
| Active subscriber without uploaded content | Workspace shows `Premium access active. Content is being prepared.` and preparation-state cards. | Implemented for ISI MSQE, UGC NET, JEE, and NEET until premium bundles are uploaded. |
| Unpaid user | Workspace shows an upgrade card instead of subscriber content cards. | Uses the existing exam-scoped active subscription helper. |
| Predicted questions, mocks, probability, analytics | Available cards link to existing server-guarded premium routes. | Existing payment/access guards remain unchanged. |
| Practice planner | Available CAT card links to the server-guarded premium planner. | Existing any-active-subscription guard remains unchanged. |
| Downloadable CAT reports | Active CAT subscriber can open premium files even if the legacy demo-role store is stale. | Dashboard reports page now receives authoritative server subscription access. |
| Expired subscription | Treated as unpaid because active lookup requires `valid_until > now()`. | Covered by `hasActiveExamSubscription()`. |

## Live fixture checks

An authenticated Supabase fixture with active and expired subscriptions is
required for full browser-level confirmation of card visibility and downloads.
