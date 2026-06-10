# CAT Quant Exam Rendering Audit

Generated: 2026-06-09T14:53:47.012Z

Source: `content/cat/practice/generated/cat_quant_generated_practice.json`

## Summary

| Metric | Count |
| --- | ---: |
| Total questions | 304 |
| Clean exam-rendered questions | 113 |
| Safe display questions | 35 |
| Needs math review | 2 |
| Needs solution review | 98 |
| Rows still containing raw patterns | 13 |
| Rows where markdown is identical to raw | 24 |
| Rows with equations stuck in paragraphs | 95 |
| Rows with option fractions not rendered | 0 |

## Raw Token Breakdown

| Token | Rows |
| --- | ---: |
| `R -> R` | 0 |
| `t2` | 0 |
| `x2` | 0 |
| `loga` | 0 |
| `logb` | 0 |
| `10 3` | 0 |
| `99 16` | 0 |

## Top 20 Remaining Issues

1. `GEN_CAT_HARDENED_QUANT_PAPER_Q08` [needs_math_review / needs_math_review] — raw_residue_student:adjacent-number fraction (10 3 / 99 16); raw_residue_solution:adjacent-number fraction (10 3 / 99 16); equation_in_paragraph
2. `GEN_CAT_QUANT_VERIFIED_PRACTICE_BATCH_01_2_Q12` [needs_math_review / needs_math_review] — raw_residue_student:leaked LaTeX command outside math; equation_in_paragraph
3. `GEN_CAT_HARDENED_QUANT_15Q_Q06` [clean / clean_with_warnings] — equation_in_paragraph
4. `GEN_CAT_QUANT_BATCH02_Q02` [clean / clean_with_warnings] — equation_in_paragraph
5. `GEN_CAT_QUANT_BATCH02_Q06` [safe_display / safe_display] — equation_in_paragraph
6. `GEN_CAT_QUANT_HARDENED_Q06` [clean / clean_with_warnings] — equation_in_paragraph
7. `GEN_CAT_QUANT_PREMIUM_TOUGH_PRACTICE_15Q_Q08` [clean / clean_with_warnings] — equation_in_paragraph
8. `GEN_CAT_QUANT_TOUGH_BATCH03_Q07` [clean / clean_with_warnings] — equation_in_paragraph
9. `GEN_CAT_QUANT_TOUGH_END_PRACTICE_BATCH_Q06` [needs_solution_review / needs_solution_review] — equation_in_paragraph
10. `GEN_CAT_QUANT_TOUGH_END_PRACTICE_BATCH_Q08` [needs_solution_review / needs_solution_review] — equation_in_paragraph
11. `GEN_CAT_QUANT_TOUGH_END_VERIFIED_PRACTICE_BATCH_Q07` [clean / clean_with_warnings] — equation_in_paragraph
12. `GEN_CAT_QUANT_TOUGH_END_VERIFIED_PRACTICE_BATCH_Q08` [clean / clean_with_warnings] — equation_in_paragraph
13. `GEN_CAT_QUANT_VERIFIED_PRACTICE_BATCH_01_1_Q15` [clean / clean_with_warnings] — equation_in_paragraph
14. `GEN_CAT_QUANT_VERIFIED_PRACTICE_BATCH_01_2_Q06` [clean / clean_with_warnings] — equation_in_paragraph
15. `GEN_CAT_QUANT_VERIFIED_PRACTICE_BATCH_02_TOUGH_Q05` [safe_display / safe_display] — equation_in_paragraph
16. `GEN_CAT_QUANT_VERIFIED_PRACTICE_BATCH_02_TOUGH_Q06` [clean / clean_with_warnings] — equation_in_paragraph
17. `GEN_CAT_HARDENED_QUANT_15Q_Q04` [clean / clean_with_warnings] — equation_in_paragraph
18. `GEN_CAT_HARDENED_QUANT_15Q_Q12` [clean / clean_with_warnings] — equation_in_paragraph
19. `GEN_CAT_QUANT_BATCH02_Q01` [clean / clean_with_warnings] — equation_in_paragraph
20. `GEN_CAT_QUANT_HARDENED_Q04` [clean / clean_with_warnings] — equation_in_paragraph

## Notes

- "Clean exam-rendered" = `content_status: clean` with no raw residue, no paragraph-trapped equations, and no raw tokens.
- Student pages show only `clean` / `safe_display` (and `needs_solution_review` when the question + answer are clean).
- `needs_math_review` rows are hidden from students and listed here for admin follow-up.
- CSV: `content/cat/practice/reports/cat_quant_exam_rendering_issues.csv`
