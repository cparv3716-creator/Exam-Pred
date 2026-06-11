# Extraction Log — CAT DILR Full-Corpus Inference

**Run date:** 2026-06-10
**Operator:** Claude Code (Opus 4.8, 1M context)
**Scope:** Extract and structurally classify all DILR/LRDI sets from the four source PDFs in `sources/cat_pyqs/`, with `CAT PYQ.pdf` as the primary expansion beyond CAT 2025.

> No full CAT question is reproduced anywhere in this run's outputs. All set references use invented short labels and structural descriptions only.

## 1. Files processed

| File | Method | Result |
|------|--------|--------|
| `CAT PYQ.pdf` (693 pp) | `pdftotext -layout` → `.tmp/dilr_full_extract/CAT_PYQ.txt` (37,154 lines); PyMuPDF used to confirm text layer & page count | ✅ clean text, no OCR |
| `CAT-Actual-Paper-2025-Slot-1-Q-Sol.pdf` (28 pp) | `pdftotext -layout` | ✅ clean (with solutions) |
| `CAT-Actual-Paper-2025-Slot-2-Q-Sol.pdf` (28 pp) | `pdftotext -layout` | ✅ clean (with solutions) |
| `CAT-Actual-Paper-2025-Slot-3-Q-Sol.pdf` (32 pp) | `pdftotext -layout` | ✅ clean (with solutions) |

## 2. How text was extracted

1. **Text layer verification (PyMuPDF):** opened each PDF, confirmed `page_count` and that the first pages yield > 50 characters of real text (no scanned/image-only pages). All four passed; **OCR was not needed**.
2. **Layout extraction (`pdftotext -layout`):** preserves column/table geometry, which matters for CAT DILR (radar charts, grids, score tables render as positioned text).
3. **Structural mapping of `CAT PYQ.pdf`:**
   - Year blocks located via the repeating `Actual CAT 20XX` page header; first transition line per year recorded.
   - Section headers located via regex on `SECTION:` / `Section :` and intersected with a DILR pattern (`DATA INTERPRETATION`, `DI & LOG`, `DI & REAS`, `LOGICAL REASONING`).
   - Each DILR section's line-range = header line → next section header.
   - 24 DILR sections were sliced into `.tmp/dilr_full_extract/sections/DILR_<year>_slot<n>.txt`.

## 3. DILR/LRDI sections identified

Header styles evolved across years (all detected):
- 2017–2018: inline / `SECTION: DI & LOGICAL REASONING`
- 2019–2023: `Section : DI & Reasoning`
- 2024: `SECTION: DI & LOGICAL REASONING`
- 2025: `SECTION: DATA INTERPRETATION & LOGICAL REASONING`

Year-block start lines in `CAT_PYQ.txt` (verified): 2025 → L1, 2024 → L2586, 2023 → L5164, 2022 → L8138, 2021 → L10372, 2020 → L12743, 2019 → L19099, 2018 → L26338, 2017 → L31890.

## 4. DILR pages / ranges (line ranges in `CAT_PYQ.txt`)

| Year | Section line-ranges (DILR) |
|------|----------------------------|
| 2025 | L520–724, L1408–1601, L2272–2459 |
| 2024 | L3102–3333, L4001–4198, L4853–5035 |
| 2023 | L6059–6508, L7090–7263, L7824–7998 |
| 2022 | L8601–8760, L9351–9476, L10072–10256 |
| 2021 | L10815–11004, L11610–11783, L12383–12597 |
| 2020 | L13184–13410, L15406–15699, L17636–17975 |
| 2019 | L19671–19993, L23438–23785 |
| 2018 | L26913–27285, L29515–29872 |
| 2017 | L32437–32888, L35028–35482 |

## 5. Sets extracted per source

Each DILR section was read by a dedicated classifier pass (one per year) that segmented the section into distinct sets (a scenario + its question group) and recorded surface family, true reasoning engine, hidden/visible split, casework, a five-axis difficulty vector (L/R/C/D/M), question-ladder character, and CAT-likeness.

| Source | Years | Sets classified |
|--------|-------|-----------------|
| `CAT PYQ.pdf` | 2017 | 16 |
| `CAT PYQ.pdf` | 2018 | 16 |
| `CAT PYQ.pdf` | 2019 | 16 |
| `CAT PYQ.pdf` | 2020 | 15 |
| `CAT PYQ.pdf` | 2021 | 12 |
| `CAT PYQ.pdf` | 2022 | 12 |
| `CAT PYQ.pdf` | 2023 | 12 |
| `CAT PYQ.pdf` | 2024 | 15 |
| `CAT PYQ.pdf` / 2025 slot files | 2025 | 15 (with full solutions from files 2–4) |
| **Total** | **2017–2025** | **~129 sets** |

## 6. Extraction problems & how they were handled

- **Repeated scenarios (2023 especially):** the layout extraction repeats a set's scenario verbatim before every question. Handled by treating one repeated scenario as one set during classification.
- **TITA (numerical-entry) items render as MCQ stubs:** type-in-the-answer questions appear with only option `A)` populated (`B)/C)/D)` blank). This is a rendering artifact of the source, not a data error; noted so it is not mistaken for truncation.
- **Reversed slot order & swapped internal labels:** within each year the slots print III→II→I, so `DILR_<year>_slot1.txt` may carry an internal "Slot III" tag. Year boundaries were detected programmatically, so this affects only the slot *number* per set, not the year, the family, or the engine.
- **Mojibake on a few glyphs:** en-dashes / minus signs occasionally extract as the replacement char `�`. Cosmetic only; did not affect structural classification.
- **No solutions for 2017–2024:** casework depth and "killing clue" identification for these years are **inferred from set structure** and tagged `(inferred)`. Only CAT 2025 has examiner solutions (files 2–4), which were used to calibrate the inference of older casework patterns.

## 7. Skipped sections & why

- **VARC and QA sections** of all papers were located but **not analysed** — out of scope (DILR only).
- **No DILR set was skipped.** All 24 DILR slot-sections in `CAT PYQ.pdf` plus the three 2025 solution papers were classified.

## 8. Compilation note

LaTeX → PDF compilation status for the final report is recorded at the bottom of this log after the report is built.

---

### Compilation result

- `pdflatex` engine: MiKTeX-pdfTeX (MiKTeX 25.4), run **twice** for the table of contents from inside `reports/dilr_inference_full/`.
- Result: **SUCCESS** — `CAT_DILR_Full_PYQ_Inference_Report.pdf` produced; table of contents resolved (no unresolved `??` references); auxiliary files cleaned.
