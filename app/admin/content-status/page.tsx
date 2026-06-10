import type { Metadata } from "next";
import { CheckCircle2, FileWarning, MonitorCheck } from "lucide-react";
import { AdminShell } from "@/components/layout/AdminShell";
import { StatCard } from "@/components/ui/StatCard";
import { getCatCandidateScores, getCatContentStatus, getCatDashboardStats } from "@/lib/content/cat";
import { getPyqStats } from "@/lib/content/pyqs";

export const metadata: Metadata = { title: "Content Status" };

export default function ContentStatusPage() {
  const status = getCatContentStatus();
  const stats = getCatDashboardStats();
  const candidates = getCatCandidateScores();
  const catPyqStats = getPyqStats("cat");
  const hasCatPyqs = catPyqStats.rowCount > 0;
  const nextAction = hasCatPyqs
    ? "Review validated CAT PYQ rows and publish tiers before database migration."
    : "Upload a CAT PYQ CSV in /admin/upload-pyqs or run npm run import:pyq -- templates/pyq_upload_template.csv.";

  return (
    <AdminShell title="Content status" subtitle="Server-side filesystem diagnostics for local CAT Phase 2A files." activeHref="/admin/content-status">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={MonitorCheck} label="Core files" value={status.allCoreFilesPresent ? "Ready" : "Check"} detail="filesystem status" />
        <StatCard icon={CheckCircle2} label="Predicted MD" value={String(status.predictedPaperCount)} detail="paper markdown files" tone="emerald" />
        <StatCard icon={FileWarning} label="PDFs" value={String(status.pdfCount)} detail="download artifacts" tone="purple" />
        <StatCard icon={CheckCircle2} label="Selected pool" value={String(candidates.selectedPoolCount)} detail={`${stats.specsRepresented} specs represented`} tone="blue" />
      </div>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        <div className="rounded-xl border border-white/8 bg-white/[0.025] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">CAT predicted papers</p>
          <p className="mt-2 text-lg font-semibold text-white">Real local data</p>
          <p className="mt-1 text-sm text-slate-500">{status.predictedPaperCount} markdown files detected.</p>
        </div>
        <div className="rounded-xl border border-white/8 bg-white/[0.025] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">CAT PYQ bank</p>
          <p className="mt-2 text-lg font-semibold text-white">{hasCatPyqs ? "Real local data" : "Not uploaded yet"}</p>
          <p className="mt-1 text-sm text-slate-500">{catPyqStats.rowCount} validated rows / {catPyqStats.topicCount} topics / {catPyqStats.files.length} files.</p>
        </div>
        <div className="rounded-xl border border-white/8 bg-white/[0.025] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Other exams</p>
          <p className="mt-2 text-lg font-semibold text-white">Demo preview</p>
          <p className="mt-1 text-sm text-slate-500">Pipelines are not uploaded yet for JEE, NEET, GATE, UPSC and JAM.</p>
        </div>
      </div>
      <div className="mt-8 rounded-xl border border-amber-400/20 bg-amber-400/[0.06] p-5">
        <h2 className="text-base font-semibold text-white">Next action recommended</h2>
        <p className="mt-2 text-sm leading-relaxed text-amber-100/90">{nextAction}</p>
      </div>
      <div className="mt-8 rounded-xl border border-white/8 bg-white/[0.025] p-5">
        <h2 className="text-base font-semibold text-white">CAT PYQ validated files</h2>
        <div className="mt-5 grid gap-3">
          {catPyqStats.files.length ? (
            catPyqStats.files.map((file) => (
              <div key={file} className="rounded-lg border border-white/8 bg-white/[0.025] p-4">
                <p className="break-all text-sm font-semibold text-white">{file}</p>
                <p className="mt-1 text-xs text-slate-500">Real local PYQ source for /exams/cat/pyqs.</p>
              </div>
            ))
          ) : (
            <div className="rounded-lg border border-amber-400/20 bg-amber-400/[0.06] p-4">
              <p className="text-sm font-semibold text-amber-100">No validated CAT PYQ files uploaded yet.</p>
              <p className="mt-1 text-xs text-amber-100/70">Expected folder: content/cat/pyqs/validated.</p>
            </div>
          )}
        </div>
      </div>
      <div className="mt-8 rounded-xl border border-white/8 bg-white/[0.025] p-5">
        <h2 className="text-base font-semibold text-white">CAT file checks</h2>
        <div className="mt-5 grid gap-3">
          {status.files.map((file) => (
            <div key={file.relativePath} className="flex flex-col gap-3 rounded-lg border border-white/8 bg-white/[0.025] p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-white">{file.label}</p>
                <p className="mt-1 break-all text-xs text-slate-500">{file.relativePath}</p>
              </div>
              <span className={file.exists ? "text-sm font-semibold text-emerald-300" : "text-sm font-semibold text-rose-300"}>
                {file.exists ? `Present${file.sizeBytes ? ` / ${Math.round(file.sizeBytes / 1024)} KB` : ""}` : "Not uploaded yet"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
