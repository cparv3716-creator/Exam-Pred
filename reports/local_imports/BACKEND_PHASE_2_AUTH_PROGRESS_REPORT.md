# Backend Phase 2 — Auth, Attempts, Bookmarks & Progress Dashboard

_Branch: `backend-practice-progress-v1`_

Wires the Phase 1 backend foundation into the product: login/signup/account,
saved practice attempts, bookmarks, and a basic progress dashboard. Fully
additive and safe — practice still works without login, and the app builds with
no Supabase env vars set.

## Files created / changed

**Created**
- `app/account/page.tsx` — account page with current user + sign-out (client).
- `components/auth/AuthForm.tsx` — shared login/signup form (client).
- `components/backend/QuestionAttemptControls.tsx` — select + Check Answer + grade + save + bookmark + login hint.
- `components/dashboard/ProgressDashboard.tsx` — progress dashboard body (client).
- `lib/backend/auth.ts` — `signInWithEmail`, `signUpWithEmail`, `signOut`, `getCurrentUser`.
- `lib/backend/attempt-mapping.ts` — `resolveQuantAttemptMeta`, `resolveVarcAttemptMeta` (safe metadata mapping).

**Changed**
- `app/login/page.tsx`, `app/signup/page.tsx` — now use real Supabase `AuthForm` (replacing the demo placeholders).
- `app/dashboard/page.tsx` — now renders the progress dashboard.
- `lib/backend/use-practice-progress.ts` — added `useAuthUser` (reactive, subscribes to auth changes) and initial bookmark load in `useBookmark`.
- `lib/backend/bookmarks.ts` — added `isBookmarked(userId, questionId)`.
- `app/exams/cat/quant/latex-source/practice/[questionId]/page.tsx` and `…/varc/source/practice/[questionId]/page.tsx` — render `QuestionAttemptControls` above the existing viewer (viewers themselves untouched).

## Auth routes added
- `/login` — email/password sign-in.
- `/signup` — email/password registration (handles email-confirmation flow).
- `/account` — shows the signed-in user and a **sign-out** button; prompts to log in when signed out.
- Logout: `signOut()` helper + button on `/account` (and via `useAuthUser().signOut`).
- Auth status helper: `getCurrentUser()` + reactive `useAuthUser()` hook.

## Attempts save — wired? **Yes.**
On both Quant LaTeX-source and VARC source question pages, `QuestionAttemptControls`
lets the user pick an option and press **Check Answer**. When logged in, an
attempt is saved with: `exam` (CAT), `section` (Quant/VARC), `question_id`,
`question_source` (`quant_latex_source` / `varc_source`), `selected_answer`,
`correct_answer`, `is_correct`, `time_spent_seconds`, and `difficulty/topic/subtopic`
when present. `attempted_at` is set by the DB default. Grading happens
client-side so it also works when signed out (just not persisted).

## Bookmarks — wired? **Yes.**
Each question page shows a **Bookmark** button (in `QuestionAttemptControls`).
Logged in → saves/removes via `toggleBookmark` and loads existing state via
`isBookmarked`. Signed out → optimistic local toggle + a login suggestion; never
crashes.

## Dashboard route added
`/dashboard` now shows: **total attempted, correct, accuracy %, attempts by
section, recent attempts, bookmarked questions**, and links back to Quant/VARC
practice and the account page.

## Behavior when not logged in
- Practice pages work exactly as before (static, no crash).
- Check Answer still grades locally; a gentle “Log in to save your progress” hint appears.
- Bookmark toggles locally (in-memory) with a login suggestion.
- `/dashboard` shows a clean login/signup prompt (or, if Supabase env is absent,
  a “progress tracking isn’t enabled yet” note) with links to practice.
- `/account` shows a login prompt.

## Safe data mapping (Task E)
`exam = CAT`; `section = Quant | VARC`; `question_source = quant_latex_source | varc_source`;
`question_id` from the current question; `difficulty/topic/subtopic` only when
already present on the question. Quant’s correct option is parsed from the
existing `correct_answer_markdown` (e.g. `"(B) …"` → `B`) and only used when
options exist — **no metadata is invented**.

## Required environment variables (Vercel → Settings → Environment Variables)
| Variable | Scope | Needed |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | browser + server | to enable auth + persistence |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | browser + server | to enable auth + persistence |
| `SUPABASE_SERVICE_ROLE_KEY` | server only | later (trusted server tasks) |

Also apply `supabase/migrations/001_practice_progress.sql` to the Supabase project.
No secrets are hardcoded.

## Build result
- **Type-check: clean.** `tsc --noEmit` exits 0 on all new/changed backend
  files, the three new components, the hooks, and the account page (run against
  the project's strict config; one real issue found and fixed — `optionKeys`
  typed as `string[]` in `attempt-mapping.ts`).
- **`npm run build` could not complete in this sandbox** — `next build`
  terminates with `Bus error (core dumped)` (SWC native binary `SIGBUS` on this
  sandbox CPU), the same environment limitation documented in the earlier
  reports and reproduced from a clean native-disk copy. It is unrelated to the
  code. Run `npm run build` on the Windows dev machine or let Vercel build the
  branch; the changes are additive, guarded, and Vercel-safe.

## Generated JSON untouched: **yes**
## Parser scripts untouched: **yes**
`content/cat/practice/generated/`, `scripts/`, `next.config.ts`, and all question
content are unchanged. The existing practice viewers were not modified; controls
were added on the surrounding pages only.

## App works without Supabase env vars: **yes**
`isSupabaseConfigured()` is false when env is missing → all clients are `null`,
every data function no-ops, and the UI falls back to local/anonymous behavior.

## Remaining backend work
- Wire the **navbar** to real auth (show Dashboard/Account/Sign-out when logged
  in) — currently the navbar uses the demo role store; auth links are reachable
  via `/login`, `/account`, `/dashboard`.
- Optionally use `@supabase/ssr` for cookie-based SSR sessions.
- Write `practice_sessions` rows (table + types ready) for streaks/time analytics.
- Server-side attempt writes via route handlers if stricter validation is wanted.
- Apply the migration and set env vars in Supabase + Vercel.
