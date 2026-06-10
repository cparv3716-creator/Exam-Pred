# Phase 2A CAT Content Audit

Generated: 2026-06-08

## Summary

Phase 2A is integrated and build-verified. CAT is connected to local pipeline outputs from `content/cat` and `public/downloads/cat`. Other exams currently use demo previews until their pipelines are uploaded.

The legal boundary remains visible: ExamIQ provides pattern-based preparation insights and practice material, and does not claim leaked, official, exact, guaranteed, or sure-shot questions.

## Route Status And Timing

| Route | Status | Dev timing |
| --- | --- | ---: |
| `/` | 200 | 3.24s |
| `/exams` | 200 | 1.10s |
| `/exams/cat` | 200 | 1.15s |
| `/exams/cat/pyqs` | 200 | 0.58s |
| `/exams/cat/predicted-papers` | 200 | 1.82s |
| `/exams/cat/reports` | 200 | 0.51s |
| `/dashboard` | 200 | 1.11s |
| `/dashboard/exams/cat` | 200 | 0.60s |
| `/dashboard/exams/cat/reports` | 200 | 0.73s |
| `/admin/content-status` | 200 | 0.50s |
| `/pricing` | 200 | 0.41s |

Additional final spot checks after the polish pass returned 200 for `/exams/cat/predicted-papers` and `/admin/content-status`.

## CAT Files Detected

| Category | Files |
| --- | ---: |
| Markdown reports | 3 |
| Predicted paper markdown files | 5 |
| CAT data files | 5 |
| PDF downloads | 6 |

Detected report markdown:

- `content/cat/reports/FINAL_RECOMMENDED_CAT_PREDICTED_PAPERS.md`
- `content/cat/reports/FULL_PIPELINE_SUMMARY.md`
- `content/cat/reports/LATEX_CANDIDATE_PROCESSING_REPORT.md`

Detected predicted paper markdown:

- `content/cat/predicted-papers/final_predicted_paper_A_balanced.md`
- `content/cat/predicted-papers/final_predicted_paper_B_arithmetic_heavy.md`
- `content/cat/predicted-papers/final_predicted_paper_C_reasoning_heavy.md`
- `content/cat/predicted-papers/final_predicted_paper_D_recent_trend.md`
- `content/cat/predicted-papers/final_predicted_paper_E_wildcard.md`

Detected data files:

- `content/cat/data/scored_latex_candidates.csv`
- `content/cat/data/best_latex_qa_candidate_pool.csv`
- `content/cat/data/prediction_specs.csv`
- `content/cat/data/variant_backtest_report.csv`
- `content/cat/data/final_prediction_portfolio_weights.json`

Detected PDF downloads:

- `public/downloads/cat/FINAL_RECOMMENDED_CAT_PREDICTED_PAPERS.pdf`
- `public/downloads/cat/final_predicted_paper_A_balanced.pdf`
- `public/downloads/cat/final_predicted_paper_B_arithmetic_heavy.pdf`
- `public/downloads/cat/final_predicted_paper_C_reasoning_heavy.pdf`
- `public/downloads/cat/final_predicted_paper_D_recent_trend.pdf`
- `public/downloads/cat/final_predicted_paper_E_wildcard.pdf`

## CAT Pipeline Metrics Surfaced

| Metric | Value |
| --- | ---: |
| Selected candidate pool | 65 |
| Selected paper-eligible candidates | 37 |
| Selected LaTeX candidates | 26 |
| Specs represented | 19 |
| Recommended expected overlap | 0.865 |
| Recommended risk score | 0.35 |
| PDF downloads | 6 |

Coverage risk note preserved in UI:

`CAT_QA_SPEC_14 Circles remains under-covered; final paper variants should not force a weak circle candidate unless required by portfolio diversity.`

## Real Local CAT Vs Demo Data Pages

Real local CAT pipeline data:

- `/exams/cat`
- `/exams/cat/predicted-papers`
- `/exams/cat/reports`
- `/dashboard`
- `/dashboard/exams/cat`
- `/dashboard/exams/cat/analytics`
- `/dashboard/exams/cat/topic-probability`
- `/dashboard/exams/cat/predicted-questions`
- `/dashboard/exams/cat/mocks`
- `/dashboard/exams/cat/reports`
- `/admin/content-status`
- `/admin/reports`

Demo preview pages:

- Non-CAT exam detail pages
- Non-CAT dashboard exam pages
- Generic pricing/auth/profile/admin placeholders
- Mock charts where visualization-specific CAT data is not uploaded yet

Missing-file state:

- `/admin/content-status` reports absent artifacts as `Not uploaded yet`.

## Access-Gating Status

`/exams/cat/predicted-papers`:

- Guest: sees paper names and locked/blurred preview; no PDF downloads.
- Free: sees basic predicted paper summaries and free/basic report access.
- Premium/Admin: sees all paper markdown, detailed generated practice content, evidence lineage and PDFs.

`/exams/cat/reports`:

- Guest: PDF cards are visible but downloads are sign-up locked.
- Free: recommended/basic PDF is available; premium variants are locked.
- Premium/Admin: all CAT PDFs are downloadable.

`/dashboard/exams/cat/reports`:

- Same CAT PDF gating behavior as the public reports page.
- CAT markdown lineage is rendered from local report files.

Locked features clearly show `Premium locked` where access requires premium/admin.

## PDF Download Card Check

The CAT report download cards are backed by file discovery from `public/downloads/cat`.

The cards are ordered as:

1. Recommended CAT Predicted Papers
2. Balanced Paper PDF
3. Arithmetic-heavy Paper PDF
4. Reasoning-heavy Paper PDF
5. Recent-trend Paper PDF
6. Wildcard Paper PDF

## Performance Notes

- Homepage copy now clarifies CAT is local pipeline-backed while other exams remain demo previews.
- Removed the homepage Recharts dependency from the probability preview and replaced it with a lightweight static trend visual. Detailed Recharts widgets remain in dashboard/analytics surfaces.
- CAT content readers are server-side and local-file based; no database or network access is required for content loading.
- Dev timings are acceptable for Phase 2A. The slowest measured route is `/` at 3.24s, largely due to homepage breadth and dev compilation overhead.
- Production build prerenders the route tree successfully.

## Build Verification

- `npm install` completed after markdown renderer dependencies were added.
- `npm audit --omit=dev` reports `found 0 vulnerabilities`.
- `npm run build` passes.

## Remaining Phase 2B Tasks

- Real database schema for exams, questions, reports, files, roles and publish states.
- Real authentication and server-side authorization.
- Persistent admin upload pipeline for CSV, markdown and PDF artifacts.
- Storage for uploaded PDFs and source files.
- Admin validation workflow with publish/unpublish mutations.
- Payments/subscriptions and plan enforcement.
- Production deployment, observability and error monitoring.
