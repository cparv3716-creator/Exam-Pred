"use client";

import { AlertTriangle, Download, FileJson, FileSpreadsheet, UploadCloud } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { validatePyqRows } from "@/lib/content/validators/pyq-validator";
import type { LocalPyqInputRow, PyqValidationResult } from "@/lib/content/validators/types";

export function LocalPyqUploadStudio() {
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState<LocalPyqInputRow[]>([]);
  const [parseError, setParseError] = useState("");

  const validation = useMemo<PyqValidationResult | null>(() => (rows.length ? validatePyqRows(rows) : null), [rows]);
  const validCleanRows = validation?.rows.filter((row) => row.errors.length === 0).map((row) => row.clean) ?? [];
  const missingFields = useMemo(() => {
    const fields = new Set<string>();
    validation?.rows.forEach((row) => row.errors.forEach((issue) => issue.field && fields.add(issue.field)));
    return Array.from(fields);
  }, [validation]);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setFileName(file.name);
    setParseError("");

    try {
      const text = await file.text();
      if (file.name.toLowerCase().endsWith(".json")) {
        const parsed = JSON.parse(text) as unknown;
        if (!Array.isArray(parsed)) throw new Error("JSON upload must be an array of rows.");
        setRows(parsed as LocalPyqInputRow[]);
      } else {
        setRows(parseCsvClient(text));
      }
    } catch (error) {
      setRows([]);
      setParseError(error instanceof Error ? error.message : "Unable to parse file.");
    }
  }

  function exportCleanJson() {
    const blob = new Blob([JSON.stringify(validCleanRows, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${fileName.replace(/\.[^.]+$/, "") || "cleaned_pyqs"}_cleaned.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.045] p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Local Content Studio</p>
            <h2 className="mt-3 text-xl font-semibold text-white">Upload CSV or JSON for local validation</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
              This preview validates locally in the browser. To persist, export cleaned JSON or run the local import script.
            </p>
          </div>
          <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-600 px-5 py-3 text-sm font-semibold text-white">
            <UploadCloud size={16} /> Select file
            <input type="file" accept=".csv,.json,text/csv,application/json" className="hidden" onChange={(event) => void handleFile(event.target.files?.[0])} />
          </label>
        </div>
        {fileName && <p className="mt-4 text-sm text-slate-300">Loaded: {fileName}</p>}
        {parseError && <p className="mt-4 rounded-lg border border-rose-400/20 bg-rose-400/[0.08] p-3 text-sm text-rose-100">{parseError}</p>}
      </div>

      {validation && (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Metric label="Rows parsed" value={String(validation.summary.totalRows)} />
            <Metric label="Valid rows" value={String(validation.summary.validRows)} tone="emerald" />
            <Metric label="Rows with errors" value={String(validation.summary.errorRows)} tone="rose" />
            <Metric label="Rows with warnings" value={String(validation.summary.warningRows)} tone="amber" />
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            <Panel title="Missing / invalid fields" icon={AlertTriangle}>
              {missingFields.length ? missingFields.map((field) => <Pill key={field}>{field}</Pill>) : <EmptyLine>No required field errors.</EmptyLine>}
            </Panel>
            <Panel title="Detected topics" icon={FileSpreadsheet}>
              {validation.summary.topics.length ? validation.summary.topics.map((topic) => <Pill key={topic}>{topic}</Pill>) : <EmptyLine>No topics detected.</EmptyLine>}
            </Panel>
            <Panel title="Detected subtopics" icon={FileJson}>
              {validation.summary.subtopics.length ? validation.summary.subtopics.map((subtopic) => <Pill key={subtopic}>{subtopic}</Pill>) : <EmptyLine>No subtopics detected.</EmptyLine>}
            </Panel>
          </div>

          <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-xl border border-white/8 bg-white/[0.025] p-5">
              <h3 className="text-base font-semibold text-white">Free / Premium distribution</h3>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <Metric label="Free" value={String(validation.summary.freeCount)} tone="emerald" />
                <Metric label="Premium" value={String(validation.summary.premiumCount)} tone="purple" />
              </div>
              <button
                type="button"
                onClick={exportCleanJson}
                disabled={!validCleanRows.length}
                className="mt-5 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Download size={15} /> Export cleaned JSON
              </button>
              <p className="mt-3 text-xs leading-relaxed text-slate-500">
                Persistent import: `npm run import:pyq -- path/to/file.csv`
              </p>
            </div>
            <div className="rounded-xl border border-white/8 bg-white/[0.025] p-5">
              <h3 className="text-base font-semibold text-white">Import summary</h3>
              <div className="mt-5 space-y-3">
                {validation.rows.slice(0, 8).map((row) => (
                  <div key={row.rowIndex} className="rounded-lg border border-white/8 bg-white/[0.025] p-3">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm font-semibold text-white">Row {row.rowIndex + 1}: {row.clean.question_id || "missing id"}</span>
                      <span className={row.errors.length ? "text-xs font-semibold text-rose-300" : "text-xs font-semibold text-emerald-300"}>
                        {row.errors.length ? `${row.errors.length} errors` : "valid"}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-1 text-xs text-slate-500">{row.clean.topic} / {row.clean.subtopic}</p>
                    {[...row.errors, ...row.warnings].slice(0, 3).map((issue) => (
                      <p key={`${issue.field}-${issue.message}`} className={issue.severity === "error" ? "mt-2 text-xs text-rose-200" : "mt-2 text-xs text-amber-200"}>
                        {issue.field ? `${issue.field}: ` : ""}{issue.message}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Metric({ label, value, tone = "cyan" }: { label: string; value: string; tone?: "cyan" | "emerald" | "rose" | "amber" | "purple" }) {
  const colors = {
    cyan: "text-cyan-300",
    emerald: "text-emerald-300",
    rose: "text-rose-300",
    amber: "text-amber-300",
    purple: "text-purple-300",
  };
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.025] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${colors[tone]}`}>{value}</p>
    </div>
  );
}

function Panel({ title, icon: Icon, children }: { title: string; icon: LucideIcon; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.025] p-5">
      <h3 className="flex items-center gap-2 text-base font-semibold text-white">
        <Icon size={17} className="text-cyan-300" /> {title}
      </h3>
      <div className="mt-4 flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs text-slate-300">{children}</span>;
}

function EmptyLine({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-slate-500">{children}</p>;
}

function parseCsvClient(text: string): LocalPyqInputRow[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (char === '"') {
      if (inQuotes && next === '"') {
        cell += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (char === "," && !inQuotes) {
      row.push(cell);
      cell = "";
      continue;
    }
    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }
    cell += char;
  }
  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  const [headers = [], ...body] = rows;
  return body.filter((line) => line.some(Boolean)).map((line) =>
    headers.reduce<LocalPyqInputRow>((record, header, index) => {
      record[header.trim()] = line[index]?.trim() ?? "";
      return record;
    }, {}),
  );
}
