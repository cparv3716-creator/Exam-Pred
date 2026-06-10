# Local Content Studio

Phase 2B-Lite adds a local-first workflow for preparing PYQs, reports, PDFs, and analysis files before a real database is introduced.

## Folder Layout

CAT local content lives in:

- `content/cat/pyqs/imports`
- `content/cat/pyqs/validated`
- `content/cat/manifests`
- `content/cat/reports`
- `content/cat/predicted-papers`
- `content/cat/data`
- `public/downloads/cat`

Future exam placeholders exist under:

- `content/jee`
- `content/neet`
- `content/gate`
- `content/upsc`
- `content/jam`

## Preparing A PYQ CSV

Start from:

- `templates/pyq_upload_template.csv`
- `templates/pyq_upload_template.json`

Use only content that is owned, generated, licensed, or legally permitted. Do not scrape.

## Validating In Admin

Open:

```text
/admin/upload-pyqs
```

Use the local preview panel to:

- Upload CSV or JSON in the browser.
- Preview parsed rows.
- See missing fields, errors, and warnings.
- Review detected topics and subtopics.
- Check free/premium distribution.
- Export cleaned JSON for manual placement if desired.

## Importing Locally

Run:

```bash
npm run import:pyq -- templates/pyq_upload_template.csv
```

The script validates the CSV and writes:

- Cleaned JSON: `content/<exam_slug>/pyqs/validated/`
- Manifest: `content/<exam_slug>/manifests/pyq_manifest.json`
- Report: `reports/local_imports/`

## How The CAT PYQ Page Reads Content

`lib/content/pyqs.ts` reads validated local JSON files from:

```text
content/cat/pyqs/validated
```

If validated CAT PYQs exist, `/exams/cat/pyqs` shows local PYQ filters, cards, topic summary, and access locks.

If no validated CAT PYQs exist, `/exams/cat/pyqs` shows:

```text
CAT PYQ upload not completed yet. Predicted papers and reports are connected, but question-level PYQ bank is not uploaded.
```

## Later Database Migration

When the database is added, the local validated JSON files become seed/import sources. The same validation rules can run before inserting rows into persistent storage.

Phase 2B still does not add real auth, payments, object storage, or production deployment.
