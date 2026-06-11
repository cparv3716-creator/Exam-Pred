# Source Coverage Table — CAT DILR Full-Corpus Inference

**Source folder inspected:** `sources/cat_pyqs/`
**Inspection date:** 2026-06-10
**Gate rule:** The report is invalid unless `CAT PYQ.pdf` is detected, readable, and included. — **GATE STATUS: PASSED.**

## 1. Inventory & coverage

| # | Filename | Path | Size | Readable | Pages | Extraction method | DILR detected | Years / slots detected | DILR sets (detected/est.) | Included in final analysis | Notes / problems |
|---|----------|------|------|----------|-------|-------------------|---------------|------------------------|---------------------------|----------------------------|------------------|
| 1 | `CAT PYQ.pdf` | `sources/cat_pyqs/CAT PYQ.pdf` | 29.47 MB (30,901,648 B) | ✅ Yes | 693 | `pdftotext -layout` + PyMuPDF (text layer present, no OCR needed) | ✅ Yes — 24 DILR sections | CAT **2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025** (9 years; 24 slot-sections) | **~129 sets** (detailed below) | ✅ **Yes — PRIMARY corpus** | Questions only, **no worked solutions** for 2017–2024. Slot labels printed in reverse order (III→II→I) inside each year; year-block boundaries verified programmatically. |
| 2 | `CAT-Actual-Paper-2025-Slot-1-Q-Sol.pdf` | `sources/cat_pyqs/CAT-Actual-Paper-2025-Slot-1-Q-Sol.pdf` | 351 KB (359,690 B) | ✅ Yes | 28 | `pdftotext -layout` | ✅ Yes — Section II: DI & LR | CAT **2025 Slot 1** | 5 sets / 22 Q | ✅ Yes — solution-grade depth | Includes **full worked solutions** (casework visible). Cross-checks 2025 content in `CAT PYQ.pdf`. |
| 3 | `CAT-Actual-Paper-2025-Slot-2-Q-Sol.pdf` | `sources/cat_pyqs/CAT-Actual-Paper-2025-Slot-2-Q-Sol.pdf` | 442 KB (452,569 B) | ✅ Yes | 28 | `pdftotext -layout` | ✅ Yes — Section II: DI & LR | CAT **2025 Slot 2** | 5 sets / 22 Q | ✅ Yes — solution-grade depth | Full worked solutions. |
| 4 | `CAT-Actual-Paper-2025-Slot-3-Q-Sol.pdf` | `sources/cat_pyqs/CAT-Actual-Paper-2025-Slot-3-Q-Sol.pdf` | 580 KB (594,110 B) | ✅ Yes | 32 | `pdftotext -layout` | ✅ Yes — Section II: DI & LR | CAT **2025 Slot 3** | 5 sets / 26 Q | ✅ Yes — solution-grade depth | Full worked solutions. |

**All four mandatory PDFs detected, readable, and included.** No file was missing, unreadable, image-only, or excluded.

## 2. `CAT PYQ.pdf` internal DILR coverage (the primary expansion)

| Year | Slots (sections) in file | DILR sets detected/est. | Section header style | Solutions |
|------|--------------------------|-------------------------|----------------------|-----------|
| CAT 2017 | 2 | ~16 (8/slot) | `SECTION: DI & ... ` / inline | Questions only |
| CAT 2018 | 2 | ~16 (8/slot) | inline | Questions only |
| CAT 2019 | 2 | ~16 (8/slot) | `Section : DI & Reasoning` | Questions only |
| CAT 2020 | 3 | ~15 (5/slot) | `Section : DI & Reasoning` | Questions only |
| CAT 2021 | 3 | ~12 (4/slot) | `Section : DI & Reasoning` | Questions only |
| CAT 2022 | 3 | ~12 (4/slot) | `Section : DI & Reasoning` | Questions only |
| CAT 2023 | 3 | ~12 (4/slot) | `Section : DI & Reasoning` | Questions only |
| CAT 2024 | 3 | ~15 (5/slot) | `SECTION: DI & LOGICAL REASONING` | Questions only |
| CAT 2025 | 3 | ~15 (5/slot) | `SECTION: DATA INTERPRETATION & LOGICAL REASONING` | Questions only (solutions via files 2–4) |
| **Total** | **24 slot-sections** | **~129 DILR sets** | — | 2025 has solutions; 2017–2024 do not |

## 3. Coverage gaps & honesty notes

- **No OCR was required.** Every PDF carries a real text layer; extraction was clean (`extractable=True`, thousands of characters on the first pages of each).
- **Worked solutions exist only for CAT 2025** (files 2–4). For 2017–2024, casework depth, surviving-case counts, and "killing clues" are **structurally inferred from the set design** (constraints + question phrasing), and are explicitly tagged `(inferred)` throughout the analysis.
- **Slot identity** within `CAT PYQ.pdf` is printed in reverse (Slot III appears before Slot II/I within each year). Year-block boundaries and section ranges were detected programmatically (not by trusting page-header slot tags), so set counts and family classification are unaffected; only the slot *number* label per set is approximate.
- **2025 appears in both** `CAT PYQ.pdf` (questions) and files 2–4 (questions + solutions). The 2025 analysis uses the solution-bearing files as the authority and treats the `CAT PYQ.pdf` 2025 pages as a consistency cross-check (no contradictions found).
