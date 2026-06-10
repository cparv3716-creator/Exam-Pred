# Content Upload Format

ExamIQ local content uploads are local-first and file-backed in Phase 2B-Lite. Do not scrape content and do not upload copyrighted material unless it is owned, generated, licensed, or otherwise legally permitted.

CAT is connected to local pipeline outputs. Other exams currently use demo previews until their pipelines are uploaded.

## PYQ CSV / JSON Fields

Required fields:

| Field | Notes |
| --- | --- |
| `exam_slug` | Must match a supported exam slug, for example `cat`. |
| `section` | Exam section such as `QA`, `VARC`, `DILR`. |
| `year` | Year as a number-like value. |
| `paper_code` | Stable paper/session identifier. |
| `question_id` | Unique local question identifier. |
| `question_text` | Must not be empty. |
| `question_type` | One of `MCQ`, `TITA`, `MSQ`, `descriptive`. |
| `correct_answer` | Required for published/scored content. MCQ can use option letter or exact option text. |
| `detailed_solution` | Required before publishing. |
| `topic` | Existing topic or new topic candidate. |
| `subtopic` | Existing subtopic or new subtopic candidate. |
| `difficulty` | One of `Easy`, `Medium`, `Medium-Hard`, `Hard`. |

Optional fields:

| Field | Notes |
| --- | --- |
| `slot` | Slot/session label. |
| `option_a` to `option_d` | Required for MCQ/MSQ. Optional for TITA/descriptive. |
| `archetype` | Pattern/archetype label. |
| `source_reference` | Rights/provenance note, never a scraping instruction. |
| `frequency_weight` | Numeric if present. |
| `probability_score` | Numeric if present. |
| `trend_score` | Numeric if present. |
| `is_free` | Boolean-like: `true`, `false`, `yes`, `no`, `1`, `0`. |
| `is_premium` | Boolean-like: `true`, `false`, `yes`, `no`, `1`, `0`. |
| `tags` | Semicolon or comma separated labels. |

## Validation Rules

- `exam_slug` must be supported.
- `question_type` must be `MCQ`, `TITA`, `MSQ`, or `descriptive`.
- MCQ/MSQ rows must include answer options.
- MCQ `correct_answer` must be a valid option letter or exact option text.
- TITA rows do not require options.
- Empty question text is an error.
- Empty solution is an error for published content and a warning otherwise.
- Unknown topics/subtopics are allowed but flagged as new.
- Numeric scores are validated when present.
- Free/premium flags are normalized to booleans.

## Import Flow

1. Fill `templates/pyq_upload_template.csv` or `templates/pyq_upload_template.json`.
2. Preview and validate in `/admin/upload-pyqs`.
3. Run the local import script:

```bash
npm run import:pyq -- templates/pyq_upload_template.csv
```

4. Validated JSON is written to `content/<exam_slug>/pyqs/validated/`.
5. Manifest metadata is written to `content/<exam_slug>/manifests/pyq_manifest.json`.
6. Validation reports are written to `reports/local_imports/`.

## Legal Boundary

Every upload must be owned, generated, licensed, or legally permitted. ExamIQ does not claim to provide leaked, official, exact, guaranteed, or sure-shot questions.
