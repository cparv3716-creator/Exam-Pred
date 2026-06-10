# LaTeX Candidate Processing Report

- `.tex` files found: **9**
- Compiled successfully: **7**
- Parsed successfully: **99**
- Candidates extracted: **99**
- Batch 01 candidates count: **24**
- Batch 02 candidates count: **24**
- Batch 02B candidates count: **8**
- Selected candidates in best pool: **65**
- Selected from LaTeX pool: **26**
- LaTeX paper-eligible candidates: **27**
- LaTeX coverage-recovery-eligible candidates: **6**
- Selected paper-eligible candidates: **37**
- Selected coverage-recovery candidates: **4**

## Accepted Count By Spec

| spec_id | selected |
| --- | --- |
| CAT_QA_SPEC_01 | 4 |
| CAT_QA_SPEC_02 | 4 |
| CAT_QA_SPEC_03 | 4 |
| CAT_QA_SPEC_04 | 4 |
| CAT_QA_SPEC_05 | 3 |
| CAT_QA_SPEC_06 | 4 |
| CAT_QA_SPEC_07 | 3 |
| CAT_QA_SPEC_08 | 2 |
| CAT_QA_SPEC_09 | 4 |
| CAT_QA_SPEC_10 | 4 |
| CAT_QA_SPEC_11 | 2 |
| CAT_QA_SPEC_12 | 4 |
| CAT_QA_SPEC_13 | 4 |
| CAT_QA_SPEC_15 | 4 |
| CAT_QA_SPEC_16 | 4 |
| CAT_QA_SPEC_17 | 2 |
| CAT_QA_SPEC_18 | 2 |
| CAT_QA_SPEC_19 | 3 |
| CAT_QA_SPEC_20 | 4 |

## Paper-Eligible Count By Spec

| spec_id | paper_eligible |
| --- | --- |
| CAT_QA_SPEC_06 | 3 |
| CAT_QA_SPEC_07 | 2 |
| CAT_QA_SPEC_08 | 1 |
| CAT_QA_SPEC_10 | 1 |
| CAT_QA_SPEC_11 | 2 |
| CAT_QA_SPEC_12 | 3 |
| CAT_QA_SPEC_13 | 5 |
| CAT_QA_SPEC_15 | 4 |
| CAT_QA_SPEC_16 | 3 |
| CAT_QA_SPEC_18 | 1 |
| CAT_QA_SPEC_19 | 1 |
| CAT_QA_SPEC_20 | 1 |

## Coverage-Recovery-Eligible Count By Spec

| spec_id | coverage_recovery_eligible |
| --- | --- |
| CAT_QA_SPEC_09 | 1 |
| CAT_QA_SPEC_13 | 1 |
| CAT_QA_SPEC_18 | 1 |
| CAT_QA_SPEC_19 | 1 |
| CAT_QA_SPEC_20 | 2 |

## Selected Count By Spec

| spec_id | selected |
| --- | --- |
| CAT_QA_SPEC_01 | 4 |
| CAT_QA_SPEC_02 | 4 |
| CAT_QA_SPEC_03 | 4 |
| CAT_QA_SPEC_04 | 4 |
| CAT_QA_SPEC_05 | 3 |
| CAT_QA_SPEC_06 | 4 |
| CAT_QA_SPEC_07 | 3 |
| CAT_QA_SPEC_08 | 2 |
| CAT_QA_SPEC_09 | 4 |
| CAT_QA_SPEC_10 | 4 |
| CAT_QA_SPEC_11 | 2 |
| CAT_QA_SPEC_12 | 4 |
| CAT_QA_SPEC_13 | 4 |
| CAT_QA_SPEC_15 | 4 |
| CAT_QA_SPEC_16 | 4 |
| CAT_QA_SPEC_17 | 2 |
| CAT_QA_SPEC_18 | 2 |
| CAT_QA_SPEC_19 | 3 |
| CAT_QA_SPEC_20 | 4 |

## Selected Count By Reason

| selection_reason | selected |
| --- | --- |
| coverage_recovery | 4 |
| existing_pool | 39 |
| paper_eligible | 22 |

## Top Coverage Recovery Candidates

| candidate_id | spec_id | subtopic | cat_likeness | final_score | rejection_reason |
| --- | --- | --- | --- | --- | --- |
| CAT_QA_SPEC_20_GPT55Thinking_AVGDIV_05 | CAT_QA_SPEC_20 | Divisibility | 0.81 | 0.798 | cat_likeness_below_0_82;final_score_below_0_80 |
| CAT_QA_SPEC_20_GPT55Thinking_AVGDIV_07 | CAT_QA_SPEC_20 | Divisibility | 0.89 | 0.796 | final_score_below_0_80 |
| CAT_QA_SPEC_19_GPT55Thinking_COORDMENS_08 | CAT_QA_SPEC_19 | Mensuration | 0.87 | 0.793 | final_score_below_0_80 |
| CAT_QA_SPEC_13_CLAUDE_07 | CAT_QA_SPEC_13 | Functions | 0.89 | 0.79 | final_score_below_0_80 |
| CAT_QA_SPEC_18_GPT55Thinking_FINALWEAK_05 | CAT_QA_SPEC_18 | Coordinate Geometry | 0.89 | 0.789 | final_score_below_0_80 |
| CAT_QA_SPEC_09_CORRECTED_01 | CAT_QA_SPEC_09 | Simple Interest Compound Interest | 0.82 | 0.783 | final_score_below_0_80 |

## LaTeX Candidate Rejection Reasons

| reason | count |
| --- | --- |
| final_score_below_0_80 | 67 |
| cat_likeness_below_0_82 | 59 |
| direct_formula_feel | 36 |
| redundancy_penalty_above_0_20 | 2 |
| duplicate_or_near_duplicate | 2 |

## LaTeX Candidate Score Diagnostics

| candidate_id | spec_id | subtopic | cat_likeness | final_score | redundancy | paper_eligible | coverage_recovery | rejection_reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CAT_QA_SPEC_10_CORRECTED_04 | CAT_QA_SPEC_10 | Mixtures and Alligation | 1.0 | 0.905 | 0.0 | YES | NO |  |
| CAT_QA_SPEC_06_CLAUDE_06 | CAT_QA_SPEC_06 | Percentages | 1.0 | 0.872 | 0.0 | YES | NO |  |
| CAT_QA_SPEC_07_CLAUDE_01 | CAT_QA_SPEC_07 | Triangles | 0.92 | 0.865 | 0.0 | YES | NO |  |
| CAT_QA_SPEC_15_GPT55Thinking_AVGDIV_01 | CAT_QA_SPEC_15 | Averages | 0.92 | 0.859 | 0.0 | YES | NO |  |
| CAT_QA_SPEC_08_CLAUDE_07 | CAT_QA_SPEC_08 | Inequalities | 0.84 | 0.855 | 0.0 | YES | NO |  |
| CAT_QA_SPEC_12_GENSPARK_FINAL_01 | CAT_QA_SPEC_12 | Linear Equations | 0.85 | 0.854 | 0.0 | YES | NO |  |
| CAT_QA_SPEC_13_CLAUDE_04 | CAT_QA_SPEC_13 | Functions | 0.94 | 0.852 | 0.0 | YES | NO |  |
| CAT_QA_SPEC_13_GPT55Thinking_FUNCIRC_01 | CAT_QA_SPEC_13 | Functions | 0.94 | 0.852 | 0.0 | YES | NO |  |
| CAT_QA_SPEC_16_GENSPARK_FINAL_01 | CAT_QA_SPEC_16 | Logarithms | 0.89 | 0.842 | 0.0 | YES | NO |  |
| CAT_QA_SPEC_13_GPT55Thinking_FUNCIRC_02 | CAT_QA_SPEC_13 | Functions | 0.89 | 0.84 | 0.0 | YES | NO |  |
| CAT_QA_SPEC_13_GPT55Thinking_FUNCIRC_03 | CAT_QA_SPEC_13 | Functions | 0.89 | 0.84 | 0.0 | YES | NO |  |
| CAT_QA_SPEC_13_GPT55Thinking_FUNCIRC_04 | CAT_QA_SPEC_13 | Functions | 0.89 | 0.84 | 0.0 | YES | NO |  |
| CAT_QA_SPEC_12_GENSPARK_FINAL_02 | CAT_QA_SPEC_12 | Linear Equations | 1.0 | 0.839 | 0.0 | YES | NO |  |
| CAT_QA_SPEC_18_GPT55Thinking_COORDMENS_04 | CAT_QA_SPEC_18 | Coordinate Geometry | 0.89 | 0.839 | 0.0 | YES | NO |  |
| CAT_QA_SPEC_07_CLAUDE_06 | CAT_QA_SPEC_07 | Triangles | 0.79 | 0.835 | 0.0 | NO | NO | cat_likeness_below_0_82 |
| CAT_QA_SPEC_07_CLAUDE_08 | CAT_QA_SPEC_07 | Triangles | 0.87 | 0.835 | 0.2 | YES | NO |  |
| CAT_QA_SPEC_06_CLAUDE_01 | CAT_QA_SPEC_06 | Percentages | 0.92 | 0.835 | 0.0 | YES | NO |  |
| CAT_QA_SPEC_16_GENSPARK_FINAL_02 | CAT_QA_SPEC_16 | Logarithms | 0.94 | 0.832 | 0.0 | YES | NO |  |
| CAT_QA_SPEC_12_GENSPARK_FINAL_03 | CAT_QA_SPEC_12 | Linear Equations | 0.84 | 0.829 | 0.0 | YES | NO |  |
| CAT_QA_SPEC_15_GPT55Thinking_AVGDIV_02 | CAT_QA_SPEC_15 | Averages | 0.89 | 0.829 | 0.0 | YES | NO |  |
| CAT_QA_SPEC_15_GPT55Thinking_AVGDIV_03 | CAT_QA_SPEC_15 | Averages | 0.89 | 0.829 | 0.0 | YES | NO |  |
| CAT_QA_SPEC_15_GPT55Thinking_AVGDIV_04 | CAT_QA_SPEC_15 | Averages | 0.89 | 0.829 | 0.0 | YES | NO |  |
| CAT_QA_SPEC_06_CLAUDE_08 | CAT_QA_SPEC_06 | Percentages | 0.71 | 0.825 | 0.0 | NO | NO | cat_likeness_below_0_82 |
| CAT_QA_SPEC_11_CORRECTED_01 | CAT_QA_SPEC_11 | Progressions | 0.87 | 0.824 | 0.0 | YES | NO |  |
| CAT_QA_SPEC_11_GPT55Thinking_FINALWEAK_06 | CAT_QA_SPEC_11 | Progressions | 0.94 | 0.824 | 0.2 | YES | NO |  |
| CAT_QA_SPEC_16_GENSPARK_FINAL_03 | CAT_QA_SPEC_16 | Logarithms | 0.89 | 0.82 | 0.0 | YES | NO |  |
| CAT_QA_SPEC_19_GPT55Thinking_COORDMENS_05 | CAT_QA_SPEC_19 | Mensuration | 0.85 | 0.811 | 0.0 | YES | NO |  |
| CAT_QA_SPEC_20_GPT55Thinking_AVGDIV_08 | CAT_QA_SPEC_20 | Divisibility | 0.94 | 0.808 | 0.0 | YES | NO |  |
| CAT_QA_SPEC_06_CLAUDE_03 | CAT_QA_SPEC_06 | Percentages | 0.9 | 0.807 | 0.0 | YES | NO |  |
| CAT_QA_SPEC_10_CORRECTED_01 | CAT_QA_SPEC_10 | Mixtures and Alligation | 0.79 | 0.802 | 0.2 | NO | NO | cat_likeness_below_0_82 |
| CAT_QA_SPEC_10_CORRECTED_02 | CAT_QA_SPEC_10 | Mixtures and Alligation | 0.79 | 0.802 | 0.2 | NO | NO | cat_likeness_below_0_82 |
| CAT_QA_SPEC_10_CORRECTED_03 | CAT_QA_SPEC_10 | Mixtures and Alligation | 0.79 | 0.802 | 0.2 | NO | NO | cat_likeness_below_0_82 |
| CAT_QA_SPEC_20_GPT55Thinking_AVGDIV_05 | CAT_QA_SPEC_20 | Divisibility | 0.81 | 0.798 | 0.0 | NO | YES | cat_likeness_below_0_82;final_score_below_0_80 |
| CAT_QA_SPEC_20_GPT55Thinking_AVGDIV_07 | CAT_QA_SPEC_20 | Divisibility | 0.89 | 0.796 | 0.0 | NO | YES | final_score_below_0_80 |
| CAT_QA_SPEC_14_CORRECTED_01 | CAT_QA_SPEC_14 | Circles | 0.76 | 0.793 | 0.0 | NO | NO | cat_likeness_below_0_82;final_score_below_0_80 |
| CAT_QA_SPEC_19_GPT55Thinking_COORDMENS_08 | CAT_QA_SPEC_19 | Mensuration | 0.87 | 0.793 | 0.0 | NO | YES | final_score_below_0_80 |
| CAT_QA_SPEC_13_CLAUDE_07 | CAT_QA_SPEC_13 | Functions | 0.89 | 0.79 | 0.2 | NO | YES | final_score_below_0_80 |
| CAT_QA_SPEC_18_GPT55Thinking_FINALWEAK_05 | CAT_QA_SPEC_18 | Coordinate Geometry | 0.89 | 0.789 | 0.2 | NO | YES | final_score_below_0_80 |
| CAT_QA_SPEC_09_CORRECTED_01 | CAT_QA_SPEC_09 | Simple Interest Compound Interest | 0.82 | 0.783 | 0.2 | NO | YES | final_score_below_0_80 |
| CAT_QA_SPEC_10_CLAUDE_01 | CAT_QA_SPEC_10 | Mixtures and Alligation | 0.79 | 0.78 | 0.0 | NO | NO | cat_likeness_below_0_82;final_score_below_0_80 |
| CAT_QA_SPEC_13_CLAUDE_01 | CAT_QA_SPEC_13 | Functions | 0.89 | 0.767 | 0.0 | NO | NO | final_score_below_0_80 |
| CAT_QA_SPEC_06_CLAUDE_05 | CAT_QA_SPEC_06 | Percentages | 0.35 | 0.765 | 0.0 | NO | NO | direct_formula_feel;cat_likeness_below_0_82;final_score_below_0_80 |
| CAT_QA_SPEC_14_GPT55Thinking_FINALWEAK_03 | CAT_QA_SPEC_14 | Circles | 0.69 | 0.753 | 0.0 | NO | NO | cat_likeness_below_0_82;final_score_below_0_80 |
| CAT_QA_SPEC_11_GPT55Thinking_FINALWEAK_07 | CAT_QA_SPEC_11 | Progressions | 0.76 | 0.749 | 0.2 | NO | NO | cat_likeness_below_0_82;final_score_below_0_80 |
| CAT_QA_SPEC_20_GPT55Thinking_AVGDIV_06 | CAT_QA_SPEC_20 | Divisibility | 0.89 | 0.746 | 0.2 | NO | NO | final_score_below_0_80 |
| CAT_QA_SPEC_13_CLAUDE_02 | CAT_QA_SPEC_13 | Functions | 0.89 | 0.745 | 0.0 | NO | NO | final_score_below_0_80 |
| CAT_QA_SPEC_10_CLAUDE_04 | CAT_QA_SPEC_10 | Mixtures and Alligation | 0.74 | 0.745 | 0.0 | NO | NO | cat_likeness_below_0_82;final_score_below_0_80 |
| CAT_QA_SPEC_07_CLAUDE_03 | CAT_QA_SPEC_07 | Triangles | 0.87 | 0.74 | 0.2 | NO | NO | final_score_below_0_80 |
| CAT_QA_SPEC_19_GPT55Thinking_COORDMENS_06 | CAT_QA_SPEC_19 | Mensuration | 0.64 | 0.736 | 0.0 | NO | NO | cat_likeness_below_0_82;final_score_below_0_80 |
| CAT_QA_SPEC_10_CLAUDE_08 | CAT_QA_SPEC_10 | Mixtures and Alligation | 0.74 | 0.73 | 0.0 | NO | NO | cat_likeness_below_0_82;final_score_below_0_80 |
| CAT_QA_SPEC_14_CORRECTED_03 | CAT_QA_SPEC_14 | Circles | 0.89 | 0.728 | 0.2 | NO | NO | final_score_below_0_80 |
| CAT_QA_SPEC_07_CLAUDE_05 | CAT_QA_SPEC_07 | Triangles | 0.82 | 0.727 | 0.2 | NO | NO | final_score_below_0_80 |
| CAT_QA_SPEC_18_GPT55Thinking_COORDMENS_01 | CAT_QA_SPEC_18 | Coordinate Geometry | 0.35 | 0.726 | 0.0 | NO | NO | direct_formula_feel;cat_likeness_below_0_82;final_score_below_0_80 |
| CAT_QA_SPEC_09_CLAUDE_05 | CAT_QA_SPEC_09 | Simple Interest Compound Interest | 0.35 | 0.716 | 0.0 | NO | NO | direct_formula_feel;cat_likeness_below_0_82;final_score_below_0_80 |
| CAT_QA_SPEC_09_CLAUDE_03 | CAT_QA_SPEC_09 | Simple Interest Compound Interest | 0.94 | 0.713 | 0.0 | NO | NO | final_score_below_0_80 |
| CAT_QA_SPEC_19_GPT55Thinking_COORDMENS_07 | CAT_QA_SPEC_19 | Mensuration | 0.66 | 0.711 | 0.0 | NO | NO | cat_likeness_below_0_82;final_score_below_0_80 |
| CAT_QA_SPEC_10_CLAUDE_06 | CAT_QA_SPEC_10 | Mixtures and Alligation | 0.72 | 0.71 | 0.0 | NO | NO | cat_likeness_below_0_82;final_score_below_0_80 |
| CAT_QA_SPEC_06_CLAUDE_07 | CAT_QA_SPEC_06 | Percentages | 0.71 | 0.705 | 0.0 | NO | NO | cat_likeness_below_0_82;final_score_below_0_80 |
| CAT_QA_SPEC_18_GPT55Thinking_COORDMENS_02 | CAT_QA_SPEC_18 | Coordinate Geometry | 0.35 | 0.704 | 0.0 | NO | NO | direct_formula_feel;cat_likeness_below_0_82;final_score_below_0_80 |
| CAT_QA_SPEC_18_GPT55Thinking_COORDMENS_03 | CAT_QA_SPEC_18 | Coordinate Geometry | 0.35 | 0.704 | 0.0 | NO | NO | direct_formula_feel;cat_likeness_below_0_82;final_score_below_0_80 |
| CAT_QA_SPEC_14_CORRECTED_02 | CAT_QA_SPEC_14 | Circles | 0.79 | 0.703 | 0.2 | NO | NO | cat_likeness_below_0_82;final_score_below_0_80 |
| CAT_QA_SPEC_11_CORRECTED_03 | CAT_QA_SPEC_11 | Progressions | 0.35 | 0.697 | 0.0 | NO | NO | direct_formula_feel;cat_likeness_below_0_82;final_score_below_0_80 |
| CAT_QA_SPEC_13_CLAUDE_06 | CAT_QA_SPEC_13 | Functions | 0.89 | 0.695 | 0.2 | NO | NO | final_score_below_0_80 |
| CAT_QA_SPEC_07_CLAUDE_02 | CAT_QA_SPEC_07 | Triangles | 0.79 | 0.69 | 0.2 | NO | NO | cat_likeness_below_0_82;final_score_below_0_80 |
| CAT_QA_SPEC_10_CLAUDE_05 | CAT_QA_SPEC_10 | Mixtures and Alligation | 0.35 | 0.687 | 0.0 | NO | NO | direct_formula_feel;cat_likeness_below_0_82;final_score_below_0_80 |
| CAT_QA_SPEC_10_CLAUDE_07 | CAT_QA_SPEC_10 | Mixtures and Alligation | 0.35 | 0.687 | 0.0 | NO | NO | direct_formula_feel;cat_likeness_below_0_82;final_score_below_0_80 |
| CAT_QA_SPEC_09_CLAUDE_07 | CAT_QA_SPEC_09 | Simple Interest Compound Interest | 0.35 | 0.686 | 0.0 | NO | NO | direct_formula_feel;cat_likeness_below_0_82;final_score_below_0_80 |
| CAT_QA_SPEC_09_CORRECTED_02 | CAT_QA_SPEC_09 | Simple Interest Compound Interest | 0.35 | 0.686 | 0.0 | NO | NO | direct_formula_feel;cat_likeness_below_0_82;final_score_below_0_80 |
| CAT_QA_SPEC_13_CLAUDE_03 | CAT_QA_SPEC_13 | Functions | 0.35 | 0.675 | 0.0 | NO | NO | direct_formula_feel;cat_likeness_below_0_82;final_score_below_0_80 |
| CAT_QA_SPEC_11_CORRECTED_02 | CAT_QA_SPEC_11 | Progressions | 0.35 | 0.672 | 0.0 | NO | NO | direct_formula_feel;cat_likeness_below_0_82;final_score_below_0_80 |
| CAT_QA_SPEC_06_CLAUDE_02 | CAT_QA_SPEC_06 | Percentages | 0.35 | 0.67 | 0.0 | NO | NO | direct_formula_feel;cat_likeness_below_0_82;final_score_below_0_80 |
| CAT_QA_SPEC_10_CLAUDE_02 | CAT_QA_SPEC_10 | Mixtures and Alligation | 0.66 | 0.67 | 0.0 | NO | NO | cat_likeness_below_0_82;final_score_below_0_80 |
| CAT_QA_SPEC_14_GPT55Thinking_FUNCIRC_05 | CAT_QA_SPEC_14 | Circles | 0.66 | 0.67 | 0.2 | NO | NO | cat_likeness_below_0_82;final_score_below_0_80 |
| CAT_QA_SPEC_14_GPT55Thinking_FUNCIRC_06 | CAT_QA_SPEC_14 | Circles | 0.35 | 0.668 | 0.0 | NO | NO | direct_formula_feel;cat_likeness_below_0_82;final_score_below_0_80 |
| CAT_QA_SPEC_14_GPT55Thinking_FUNCIRC_07 | CAT_QA_SPEC_14 | Circles | 0.35 | 0.668 | 0.0 | NO | NO | direct_formula_feel;cat_likeness_below_0_82;final_score_below_0_80 |
| CAT_QA_SPEC_08_CLAUDE_01 | CAT_QA_SPEC_08 | Inequalities | 0.35 | 0.66 | 0.0 | NO | NO | direct_formula_feel;cat_likeness_below_0_82;final_score_below_0_80 |
| CAT_QA_SPEC_07_CLAUDE_04 | CAT_QA_SPEC_07 | Triangles | 0.66 | 0.657 | 0.2 | NO | NO | cat_likeness_below_0_82;final_score_below_0_80 |
| CAT_QA_SPEC_09_CLAUDE_06 | CAT_QA_SPEC_09 | Simple Interest Compound Interest | 0.71 | 0.656 | 0.0 | NO | NO | cat_likeness_below_0_82;final_score_below_0_80 |
| CAT_QA_SPEC_13_CLAUDE_08 | CAT_QA_SPEC_13 | Functions | 0.35 | 0.655 | 0.2 | NO | NO | direct_formula_feel;cat_likeness_below_0_82;final_score_below_0_80 |
| CAT_QA_SPEC_18_GPT55Thinking_FINALWEAK_04 | CAT_QA_SPEC_18 | Coordinate Geometry | 0.35 | 0.654 | 0.2 | NO | NO | direct_formula_feel;cat_likeness_below_0_82;final_score_below_0_80 |
| CAT_QA_SPEC_08_CLAUDE_04 | CAT_QA_SPEC_08 | Inequalities | 0.35 | 0.653 | 0.2 | NO | NO | direct_formula_feel;cat_likeness_below_0_82;final_score_below_0_80 |
| CAT_QA_SPEC_08_CLAUDE_08 | CAT_QA_SPEC_08 | Inequalities | 0.35 | 0.653 | 0.2 | NO | NO | direct_formula_feel;cat_likeness_below_0_82;final_score_below_0_80 |
| CAT_QA_SPEC_10_CLAUDE_03 | CAT_QA_SPEC_10 | Mixtures and Alligation | 0.35 | 0.647 | 0.0 | NO | NO | direct_formula_feel;cat_likeness_below_0_82;final_score_below_0_80 |
| CAT_QA_SPEC_09_CLAUDE_01 | CAT_QA_SPEC_09 | Simple Interest Compound Interest | 0.35 | 0.643 | 0.0 | NO | NO | direct_formula_feel;cat_likeness_below_0_82;final_score_below_0_80 |
| CAT_QA_SPEC_09_CLAUDE_02 | CAT_QA_SPEC_09 | Simple Interest Compound Interest | 0.66 | 0.643 | 0.0 | NO | NO | cat_likeness_below_0_82;final_score_below_0_80 |
| CAT_QA_SPEC_09_CORRECTED_03 | CAT_QA_SPEC_09 | Simple Interest Compound Interest | 0.35 | 0.641 | 0.2 | NO | NO | direct_formula_feel;cat_likeness_below_0_82;final_score_below_0_80 |
| CAT_QA_SPEC_06_CLAUDE_04 | CAT_QA_SPEC_06 | Percentages | 0.35 | 0.64 | 0.0 | NO | NO | direct_formula_feel;cat_likeness_below_0_82;final_score_below_0_80 |
| CAT_QA_SPEC_08_CLAUDE_02 | CAT_QA_SPEC_08 | Inequalities | 0.35 | 0.638 | 0.0 | NO | NO | direct_formula_feel;cat_likeness_below_0_82;final_score_below_0_80 |
| CAT_QA_SPEC_08_CLAUDE_03 | CAT_QA_SPEC_08 | Inequalities | 0.35 | 0.638 | 0.0 | NO | NO | direct_formula_feel;cat_likeness_below_0_82;final_score_below_0_80 |
| CAT_QA_SPEC_09_CORRECTED_04 | CAT_QA_SPEC_09 | Simple Interest Compound Interest | 0.35 | 0.636 | 0.2 | NO | NO | direct_formula_feel;cat_likeness_below_0_82;final_score_below_0_80 |
| CAT_QA_SPEC_14_GPT55Thinking_FUNCIRC_08 | CAT_QA_SPEC_14 | Circles | 0.35 | 0.618 | 0.2 | NO | NO | direct_formula_feel;cat_likeness_below_0_82;final_score_below_0_80 |
| CAT_QA_SPEC_09_CLAUDE_04 | CAT_QA_SPEC_09 | Simple Interest Compound Interest | 0.35 | 0.591 | 0.0 | NO | NO | direct_formula_feel;cat_likeness_below_0_82;final_score_below_0_80 |
| CAT_QA_SPEC_08_CLAUDE_05 | CAT_QA_SPEC_08 | Inequalities | 0.35 | 0.588 | 0.2 | NO | NO | direct_formula_feel;cat_likeness_below_0_82;final_score_below_0_80 |
| CAT_QA_SPEC_08_CLAUDE_06 | CAT_QA_SPEC_08 | Inequalities | 0.35 | 0.588 | 0.2 | NO | NO | direct_formula_feel;cat_likeness_below_0_82;final_score_below_0_80 |
| CAT_QA_SPEC_07_CLAUDE_07 | CAT_QA_SPEC_07 | Triangles | 0.35 | 0.58 | 0.2 | NO | NO | direct_formula_feel;cat_likeness_below_0_82;final_score_below_0_80 |
| CAT_QA_SPEC_14_GPT55Thinking_FINALWEAK_01 | CAT_QA_SPEC_14 | Circles | 0.35 | 0.58 | 0.35 | NO | NO | direct_formula_feel;cat_likeness_below_0_82;final_score_below_0_80;redundancy_penalty_above_0_20;duplicate_or_near_duplicate |
| CAT_QA_SPEC_14_GPT55Thinking_FINALWEAK_02 | CAT_QA_SPEC_14 | Circles | 0.35 | 0.58 | 0.35 | NO | NO | direct_formula_feel;cat_likeness_below_0_82;final_score_below_0_80;redundancy_penalty_above_0_20;duplicate_or_near_duplicate |
| CAT_QA_SPEC_13_CLAUDE_05 | CAT_QA_SPEC_13 | Functions | 0.35 | 0.56 | 0.2 | NO | NO | direct_formula_feel;cat_likeness_below_0_82;final_score_below_0_80 |
| CAT_QA_SPEC_09_CLAUDE_08 | CAT_QA_SPEC_09 | Simple Interest Compound Interest | 0.35 | 0.516 | 0.2 | NO | NO | direct_formula_feel;cat_likeness_below_0_82;final_score_below_0_80 |

## Top 40 Candidates

| candidate_id | spec_id | source_pool | selection_reason | expected_question_value |
| --- | --- | --- | --- | --- |
| CAT_QA_SPEC_01_ELITE_03 | CAT_QA_SPEC_01 | existing | existing_pool | 0.910 |
| CAT_QA_SPEC_01_CAND_01 | CAT_QA_SPEC_01 | existing | existing_pool | 0.908 |
| CAT_QA_SPEC_06_ELITE2_03 | CAT_QA_SPEC_06 | existing | existing_pool | 0.892 |
| CAT_QA_SPEC_06_ELITE2_01 | CAT_QA_SPEC_06 | existing | existing_pool | 0.887 |
| CAT_QA_SPEC_02_CAND_01 | CAT_QA_SPEC_02 | existing | existing_pool | 0.882 |
| CAT_QA_SPEC_03_ELITE_01 | CAT_QA_SPEC_03 | existing | existing_pool | 0.873 |
| CAT_QA_SPEC_06_ELITE2_02 | CAT_QA_SPEC_06 | existing | existing_pool | 0.872 |
| CAT_QA_SPEC_03_ELITE_03 | CAT_QA_SPEC_03 | existing | existing_pool | 0.870 |
| CAT_QA_SPEC_07_CLAUDE_01 | CAT_QA_SPEC_07 | latex | paper_eligible | 0.865 |
| CAT_QA_SPEC_02_CAND_03 | CAT_QA_SPEC_02 | existing | existing_pool | 0.862 |
| CAT_QA_SPEC_02_CAND_04 | CAT_QA_SPEC_02 | existing | existing_pool | 0.862 |
| CAT_QA_SPEC_01_ELITE_01 | CAT_QA_SPEC_01 | existing | existing_pool | 0.853 |
| CAT_QA_SPEC_06_CLAUDE_06 | CAT_QA_SPEC_06 | latex | paper_eligible | 0.851 |
| CAT_QA_SPEC_03_ELITE_02 | CAT_QA_SPEC_03 | existing | existing_pool | 0.843 |
| CAT_QA_SPEC_01_CAND_02 | CAT_QA_SPEC_01 | existing | existing_pool | 0.835 |
| CAT_QA_SPEC_04_ELITE_01 | CAT_QA_SPEC_04 | existing | existing_pool | 0.830 |
| CAT_QA_SPEC_03_ELITE_04 | CAT_QA_SPEC_03 | existing | existing_pool | 0.820 |
| CAT_QA_SPEC_05_ELITE_02 | CAT_QA_SPEC_05 | existing | existing_pool | 0.801 |
| CAT_QA_SPEC_05_ELITE_03 | CAT_QA_SPEC_05 | existing | existing_pool | 0.801 |
| CAT_QA_SPEC_10_CORRECTED_04 | CAT_QA_SPEC_10 | latex | paper_eligible | 0.801 |
| CAT_QA_SPEC_05_CAND_04 | CAT_QA_SPEC_05 | existing | existing_pool | 0.786 |
| CAT_QA_SPEC_15_ELITE2_03 | CAT_QA_SPEC_15 | existing | existing_pool | 0.786 |
| CAT_QA_SPEC_02_CAND_02 | CAT_QA_SPEC_02 | existing | existing_pool | 0.782 |
| CAT_QA_SPEC_07_CLAUDE_08 | CAT_QA_SPEC_07 | latex | paper_eligible | 0.780 |
| CAT_QA_SPEC_12_ELITE2_04 | CAT_QA_SPEC_12 | existing | existing_pool | 0.774 |
| CAT_QA_SPEC_09_ELITE2_02 | CAT_QA_SPEC_09 | existing | existing_pool | 0.771 |
| CAT_QA_SPEC_04_CAND_02 | CAT_QA_SPEC_04 | existing | existing_pool | 0.765 |
| CAT_QA_SPEC_04_ELITE_04 | CAT_QA_SPEC_04 | existing | existing_pool | 0.765 |
| CAT_QA_SPEC_09_ELITE2_03 | CAT_QA_SPEC_09 | existing | existing_pool | 0.763 |
| CAT_QA_SPEC_08_CLAUDE_07 | CAT_QA_SPEC_08 | latex | paper_eligible | 0.763 |
| CAT_QA_SPEC_12_GENSPARK_FINAL_01 | CAT_QA_SPEC_12 | latex | paper_eligible | 0.762 |
| CAT_QA_SPEC_07_ELITE2_04 | CAT_QA_SPEC_07 | existing | existing_pool | 0.760 |
| CAT_QA_SPEC_10_FULL_01 | CAT_QA_SPEC_10 | existing | existing_pool | 0.755 |
| CAT_QA_SPEC_16_ELITE2_01 | CAT_QA_SPEC_16 | existing | existing_pool | 0.752 |
| CAT_QA_SPEC_15_GPT55Thinking_AVGDIV_01 | CAT_QA_SPEC_15 | latex | paper_eligible | 0.751 |
| CAT_QA_SPEC_08_ELITE2_03 | CAT_QA_SPEC_08 | existing | existing_pool | 0.750 |
| CAT_QA_SPEC_15_ELITE2_02 | CAT_QA_SPEC_15 | existing | existing_pool | 0.749 |
| CAT_QA_SPEC_10_ELITE2_01 | CAT_QA_SPEC_10 | existing | existing_pool | 0.747 |
| CAT_QA_SPEC_11_CORRECTED_01 | CAT_QA_SPEC_11 | latex | paper_eligible | 0.745 |
| CAT_QA_SPEC_04_CAND_04 | CAT_QA_SPEC_04 | existing | existing_pool | 0.740 |

## Remaining Weak Specs

- `CAT_QA_SPEC_08`
- `CAT_QA_SPEC_09`
- `CAT_QA_SPEC_10`
- `CAT_QA_SPEC_14`

## Paper Assembly Readiness

- Selected pool threshold: **PASS**
- Selected paper-eligible threshold: **PASS**
- Selected LaTeX threshold: **PASS**
- Selected spec-coverage threshold: **PASS**

Ready for paper assembly: **YES, WITH RISK FLAGS**

**Risk flag:** CAT_QA_SPEC_14 Circles remains under-covered; final paper variants should not force a weak circle candidate unless required by portfolio diversity.
