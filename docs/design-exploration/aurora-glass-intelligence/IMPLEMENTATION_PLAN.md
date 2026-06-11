# Implementation Plan — Aurora Glass Intelligence

> Design exploration only. **Nothing below is executed by this document.** It is the staged, reversible rollout plan. Each phase is independently shippable and revertible. Apply one mode at a time; never touch generated question JSON, parser/import/recovery scripts, or `next.config.ts`.

Global validation for every code phase:
```
npm run build          # must pass (Vercel-compatible)
npm run lint           # if configured
git status --short     # confirm only intended files changed
git diff --name-only   # confirm no generated JSON / scripts / next.config.ts
```
Global rollback for every code phase: work on a dedicated branch per phase; revert with `git restore <files>` or `git checkout -- <files>`, or drop the branch. Because tokens are additive and mode wrappers are opt‑in per route, a partial rollback never breaks other modes.

---

## Phase 0 — Design documentation only (this task)
- **Goal:** ratify Aurora Glass Intelligence; produce `DESIGN.md`, `PAGE_MODES.md`, `COMPONENT_GUIDELINES.md`, `IMPLEMENTATION_PLAN.md`.
- **Files changed:** only `docs/design-exploration/aurora-glass-intelligence/*.md`.
- **Risk:** none (no app code).
- **Validation:** `git status` shows only the new docs folder. **Do not run build** (no code changed).
- **Rollback:** delete the docs folder.

## Phase 1 — Global theme tokens & reusable visual utilities
- **Goal:** introduce the design tokens and utility classes *without* changing any page's look yet (tokens defined, not yet consumed).
- **Work:** add CSS variables (Section 5/8/9/11 of `DESIGN.md`) to global CSS under a scoped layer; add Tailwind theme extensions (colors/radius/shadow/keyframes) and utility classes (`.glass`, aurora bg, glow); add reduced‑motion media query; optionally register fonts via `next/font` (no runtime deps).
- **Files likely changed:** `app/globals.css`, `tailwind.config.ts`, maybe `app/layout.tsx` (font wiring). **New, additive** util/components allowed under `components/aurora/` (does not alter existing components).
- **Risk:** **Low–Medium** — global CSS/Tailwind are shared; risk is accidental override of existing utilities. Mitigate by namespacing new tokens/classes and not redefining existing class names.
- **Validation:** `npm run build`; visually diff a couple of existing pages to confirm **no unintended change**; `git diff` limited to the four files above + new additive files.
- **Rollback:** revert the four files; delete `components/aurora/`.

## Phase 2 — Showcase Mode → homepage only
- **Goal:** apply the full futuristic treatment to `/` (hero, AI orb, floating glass stat cards, aurora, scroll reveals, dual CTA).
- **Files likely changed:** `app/page.tsx`, `components/marketing/HeroSection.tsx`, new `components/aurora/IntelligenceCore.tsx`, `FloatingStatCard.tsx`, `AuroraBackground.tsx` (all new/additive); possibly `Footer` polish.
- **Risk:** **Medium** — animation perf + contrast under aurora. Mitigate: GPU‑only transforms, lazy‑load any Canvas orb, reduced‑motion fallback, headline on a calm band.
- **Validation:** `npm run build`; Lighthouse perf/a11y on `/`; verify reduced‑motion renders static; mobile has no overflow; other routes untouched (`git diff --name-only`).
- **Rollback:** revert `app/page.tsx`/`HeroSection.tsx`; remove new aurora components.

## Phase 3 — Library Mode → DILR listing page
- **Goal:** premium set cards, sticky search/filter bar, difficulty/topic chips, progress indicators on the DILR listing (then replicate to Quant/VARC listings in a follow‑up).
- **Files likely changed:** `app/exams/cat/dilr/source/page.tsx` (and/or DILR listing), a new `components/practice/DilrSetCard.tsx` + filter bar (additive). Reuse existing data readers only.
- **Risk:** **Low** — presentational; set‑grouping logic already exists in data layer.
- **Validation:** `npm run build`; confirm set grouping intact; mobile 1‑col; no generated JSON touched.
- **Rollback:** revert the listing page; remove new card/filter components.

## Phase 4 — Focus Mode → DILR practice viewer
- **Goal:** calm reading surfaces, sticky timer/navigator, option states, subtle solution reveal; **no decorative motion near text.**
- **Files likely changed:** the DILR practice viewer + its `[questionId]` page; new `components/practice/FocusTimerPanel.tsx` (additive). Use the "bare" app‑shell variant (no aurora wrapper) for these routes.
- **Risk:** **Medium** — must preserve question/passage/answer content exactly and keep reading legible; verify set context shows on every question.
- **Validation:** `npm run build`; manual read‑through (contrast, line length, no motion under text); reduced‑motion snaps solution open; content unchanged byte‑for‑byte.
- **Rollback:** revert the viewer/page; remove the timer panel component.

## Phase 5 — Command Mode → dashboard
- **Goal:** glass sidebar + analytics grid, readiness ring, streak/continue/plan, weak areas, recent attempts.
- **Files likely changed:** `app/dashboard/page.tsx`, `components/layout/DashboardShell.tsx`, new `components/dashboard/ReadinessRing.tsx` etc. (additive). Wire to existing/Backend progress helpers if present.
- **Risk:** **Medium** — data wiring + logged‑out state. Mitigate: graceful empty/anonymous state (Utility prompt); count‑ups once.
- **Validation:** `npm run build`; logged‑out renders a calm prompt (no crash); mobile drawer works; rings have `aria-label`.
- **Rollback:** revert dashboard page + shell; remove new dashboard components.

## Phase 6 — Intelligence Lab Mode → reports / AI insights
- **Goal:** readiness radar, weak‑topic heatmap, percentile trend, recommended practice, animated numbers — styled as trustworthy instruments.
- **Files likely changed:** `app/exams/cat/reports/page.tsx` (+ any insights route), new chart wrapper components styled to tokens using the existing chart lib (recharts). Additive.
- **Risk:** **Medium** — chart theming + honest labeling (no "guaranteed" claims). Mitigate: confidence bands, animate‑once, reduced‑motion → final state.
- **Validation:** `npm run build`; charts legible + labelled; reduced‑motion shows final; no fake‑precision copy.
- **Rollback:** revert reports page; remove chart wrappers.

## Phase 7 — Utility Mode → auth / settings
- **Goal:** centered glass auth card on a soft static aurora; clean inputs; calm settings forms; onboarding steps.
- **Files likely changed:** `app/login/page.tsx`, `app/signup/page.tsx`, `app/account/page.tsx` (+ settings/onboarding when they exist), new `components/auth/AuthCard.tsx` (additive).
- **Risk:** **Low** — small, self‑contained pages; must stay usable when auth backend/env is absent.
- **Validation:** `npm run build`; forms render + validate without backend; contrast on glass verified; mobile targets ≥ 44px.
- **Rollback:** revert the three pages; remove `AuthCard`.

---

## Sequencing rationale & guardrails
- **Order = value × safety:** tokens first (enables everything), then the highest‑impact, lowest‑coupling surface (homepage), then library → focus → command → lab → utility.
- **One mode per branch/PR** for clean review and rollback.
- **Never** in any phase: modify generated question JSON, `content/cat/practice/generated/`, parser/import/recovery scripts, question/passage/answer content, or `next.config.ts` output behavior.
- **Performance budget:** decorative motion must be GPU‑transform only, lazy‑loaded, and reduced‑motion‑safe; Focus routes ship with zero decorative layers.
- **Definition of done per phase:** build passes, a11y (contrast/focus/reduced‑motion) verified, mobile has no overflow, and `git diff --name-only` shows only intended files.

## Recommended first implementation phase
**Phase 1 (tokens & utilities)** — it is additive, low‑risk, and unlocks every later mode; immediately followed by **Phase 2 (Showcase homepage)** for the highest visible payoff.
