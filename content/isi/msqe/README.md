# ISI MSQE Local Content

Phase 1 provides the manifest, taxonomy, loader boundary, staging folders, and a small development-only sample bank.

- `question_bank/sample_msqe_questions.json`: safe development entries; not claimed as PYQs.
- `question_bank/pea/`: staging for verified structured PEA files.
- `question_bank/peb/`: staging for verified structured PEB files.
- `pyqs/`: verified PYQ manifests and structured records.
- `inference/`: structured inference summaries and report manifests.
- `practice_sets/`: curated set definitions referencing stable question IDs.

Do not place a PDF extraction directly into the active bank. Convert verified source material into the typed JSON contract and retain the original source reference.
