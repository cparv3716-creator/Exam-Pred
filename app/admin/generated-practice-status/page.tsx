import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Crown, FileJson, Layers3, Sparkles, WandSparkles } from "lucide-react";
import { AdminShell } from "@/components/layout/AdminShell";
import { StatCard } from "@/components/ui/StatCard";
import {
  getCatQuantPracticeCoverage,
  getCatQuantPracticeManifest,
  getCatQuantPracticeQuestions,
  getCatQuantPracticeStats,
} from "@/lib/content/practice/cat-quant-practice";

export const metadata: Metadata = { title: "Generated Practice Status" };

export default function GeneratedPracticeStatusPage() {
  const stats = getCatQuantPracticeStats();
  const manifest = getCatQuantPracticeManifest();
  const questions = getCatQuantPracticeQuestions({ includeReview: true });
  const coverage = getCatQuantPracticeCoverage({ includeReview: true });
  const cleanupRows = questions.filter((question) => question.cleanup_notes.length > 0).slice(0, 12);
  const cleanQuestions = questions.filter((question) => (question.content_status ?? "clean") === "clean" && question.math_review_status === "clean").length;
  const safeDisplayQuestions = questions.filter((question) => question.content_status === "safe_display" || (question.math_review_status === "safe_display" && question.content_status !== "hide_from_student")).length;
  const needsMathReview = questions.filter((question) => question.content_status === "needs_math_review" || (question.math_review_status === "needs_review" && question.content_status !== "needs_solution_review" && question.content_status !== "hide_from_student")).length;
  const needsSolutionReview = questions.filter((question) => question.content_status === "needs_solution_review").length;
  const incompleteQuestions = questions.filter((question) => question.content_issue_types?.some((issue) => issue.includes("incomplete_question"))).length;
  const brokenOptions = questions.filter((question) => question.content_issue_types?.some((issue) => issue.includes("broken_options"))).length;
  const hiddenFromStudent = questions.filter((question) => question.content_status === "hide_from_student").length;
  const issueRows = questions
    .filter((question) => (question.content_issue_types?.length ?? 0) > 0 || question.content_status === "hide_from_student" || question.math_review_status === "needs_review")
    .sort((a, b) => issuePriority(b) - issuePriority(a))
    .slice(0, 30);

  return (
    <AdminShell
      title="Generated practice status"
      subtitle="Local CAT Quant generated-practice diagnostics. These questions are not PYQs."
      activeHref="/admin/generated-practice-status"
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Sparkles} label="Total questions" value={String(stats.total)} detail="generated CAT Quant" />
        <StatCard icon={CheckCircle2} label="Beginner" value={String(stats.beginner)} detail="free-friendly" tone="emerald" />
        <StatCard icon={Layers3} label="Intermediate" value={String(stats.intermediate)} detail="limited free previews" tone="blue" />
        <StatCard icon={Crown} label="Advanced" value={String(stats.advanced)} detail="premium only" tone="purple" />
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        <StatusPanel title="Import status" rows={[
          ["Source CSV", stats.sourceFileExists ? "Present" : "Missing"],
          ["Generated JSON", stats.generatedFileExists ? "Present" : "Missing"],
          ["Manifest", stats.manifestExists ? "Present" : "Missing"],
          ["Import report", stats.reportExists ? "Present" : "Missing"],
          ["Last import", stats.lastImportTime || "Not imported yet"],
        ]} />
        <StatusPanel title="Access distribution" rows={[
          ["Free access", String(stats.freeAccess)],
          ["Free limited", String(stats.freeLimited)],
          ["Premium only", String(stats.premiumOnly)],
          ["Advanced premium", String(stats.advancedPremiumOnly)],
          ["P&C / Probability", String(stats.pncProbability)],
        ]} />
        <StatusPanel title="Manifest output" rows={[
          ["Source", manifest?.source_file ?? "Not available"],
          ["Output", manifest?.output_file ?? "Not available"],
          ["Rows needing cleanup", String(stats.rowsNeedingCleanup)],
          ["Cleanup warnings", String(stats.cleanupWarningCount)],
        ]} />
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={CheckCircle2} label="Clean" value={String(cleanQuestions)} detail="raw/display safe" tone="emerald" />
        <StatCard icon={Sparkles} label="Safe display" value={String(safeDisplayQuestions)} detail="display repaired" tone="blue" />
        <StatCard icon={AlertTriangle} label="Math review" value={String(needsMathReview)} detail="held for QA" tone="purple" />
        <StatCard icon={AlertTriangle} label="Solution review" value={String(needsSolutionReview)} detail="visible with QA note" tone="cyan" />
        <StatCard icon={AlertTriangle} label="Incomplete" value={String(incompleteQuestions)} detail="prompt issues" tone="rose" />
        <StatCard icon={AlertTriangle} label="Broken options" value={String(brokenOptions)} detail="option issues" tone="rose" />
        <StatCard icon={AlertTriangle} label="Hidden" value={String(hiddenFromStudent)} detail="not student-facing" tone="rose" />
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <div className="rounded-xl border border-white/8 bg-white/[0.025] p-5">
          <h2 className="flex items-center gap-2 text-base font-semibold text-white">
            <AlertTriangle size={17} className={stats.hardVeryHardInBeginner ? "text-rose-300" : "text-emerald-300"} />
            Level safety checks
          </h2>
          <div className="mt-4 grid gap-3">
            <SafetyRow label="Hard/Very Hard in Beginner" value={stats.hardVeryHardInBeginner} okValue={0} />
            <SafetyRow label="Easy/Medium in Advanced" value={stats.easyMediumInAdvanced} okValue={0} />
            <SafetyRow label="Cleanup warning rows" value={stats.rowsNeedingCleanup} />
          </div>
        </div>
        <div className="rounded-xl border border-white/8 bg-white/[0.025] p-5">
          <h2 className="text-base font-semibold text-white">Difficulty counts by level</h2>
          <div className="mt-5 grid gap-2">
            {stats.difficultyCountsByLevel.map((item) => (
              <div key={`${item.level}-${item.difficulty}`} className="flex items-center justify-between rounded-lg border border-white/8 bg-white/[0.025] px-3 py-2 text-sm">
                <span className="text-slate-400">{item.level} / {item.difficulty}</span>
                <span className="font-semibold text-white">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-white/8 bg-white/[0.025] p-5">
          <h2 className="flex items-center gap-2 text-base font-semibold text-white"><FileJson size={17} className="text-cyan-300" /> Counts by quality tier</h2>
          <div className="mt-5 grid gap-3">
            {stats.qualityTierCounts.map((item) => (
              <RowMeter key={item.label} label={item.label} value={item.count} total={stats.total} />
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-white/8 bg-white/[0.025] p-5">
          <h2 className="flex items-center gap-2 text-base font-semibold text-white"><WandSparkles size={17} className="text-purple-300" /> Rows needing cleanup</h2>
          <div className="mt-5 space-y-3">
            {cleanupRows.length ? cleanupRows.map((question) => (
              <div key={question.question_id} className="rounded-lg border border-white/8 bg-white/[0.025] p-3">
                <p className="text-sm font-semibold text-white">{question.question_id}</p>
                <p className="mt-1 text-xs text-slate-500">{question.cleanup_notes.join(", ")}</p>
              </div>
            )) : <p className="text-sm text-slate-500">No cleanup notes detected.</p>}
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-white/8 bg-white/[0.025] p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">Top integrity issue rows</h2>
            <p className="mt-1 text-sm text-slate-500">Student pages hide rows marked hidden; admin keeps links for review.</p>
          </div>
          <div className="text-xs leading-relaxed text-slate-500">
            <p>Rendering report: reports/local_imports/CAT_QUANT_FULL_RENDERING_QUALITY_AUDIT.md</p>
            <p>Rendering CSV: content/cat/practice/reports/cat_quant_rendering_quality_issues.csv</p>
            <p>Integrity report: reports/local_imports/CAT_QUANT_QUESTION_INTEGRITY_AUDIT.md</p>
          </div>
        </div>
        <div className="mt-5 space-y-3">
          {issueRows.length ? issueRows.map((question) => (
            <div key={question.question_id} className="rounded-lg border border-white/8 bg-white/[0.025] p-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <Link href={`/exams/cat/quant/practice/${question.question_id}`} className="text-sm font-semibold text-cyan-300 hover:text-cyan-200">
                    {question.question_id}
                  </Link>
                  <p className="mt-1 text-xs text-slate-500">
                    {question.practice_level} / {question.topic} / {question.difficulty}
                  </p>
                </div>
                <span className={question.content_status === "hide_from_student" ? "text-xs font-semibold text-rose-300" : "text-xs font-semibold text-amber-300"}>
                  {question.content_status ?? question.math_review_status ?? "clean"}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-400">{question.content_issue_types?.join(", ") || "math_review_status: needs_review"}</p>
            </div>
          )) : <p className="text-sm text-slate-500">No integrity issue rows detected.</p>}
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-white/8 bg-white/[0.025] p-5">
        <h2 className="text-base font-semibold text-white">Counts by topic</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {coverage.map((topic) => (
            <div key={topic.topic} className="rounded-lg border border-white/8 bg-white/[0.025] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-white">{topic.topic}</p>
                <span className="text-sm font-semibold text-cyan-300">{topic.count}</span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Beginner {topic.beginner} / Intermediate {topic.intermediate} / Advanced {topic.advanced}
              </p>
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}

function StatusPanel({ title, rows }: { title: string; rows: Array<[string, string]> }) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.025] p-5">
      <h2 className="text-base font-semibold text-white">{title}</h2>
      <div className="mt-4 space-y-3">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-start justify-between gap-4 text-sm">
            <span className="text-slate-500">{label}</span>
            <span className="break-all text-right font-semibold text-slate-200">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RowMeter({ label, value, total }: { label: string; value: number; total: number }) {
  const width = total ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between gap-4 text-sm">
        <span className="font-medium text-slate-300">{label}</span>
        <span className="text-slate-500">{value}</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/8">
        <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-purple-500" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

function SafetyRow({ label, value, okValue }: { label: string; value: number; okValue?: number }) {
  const ok = okValue === undefined ? true : value === okValue;
  return (
    <div className="flex items-center justify-between rounded-lg border border-white/8 bg-white/[0.025] px-3 py-2 text-sm">
      <span className="text-slate-400">{label}</span>
      <span className={ok ? "font-semibold text-emerald-300" : "font-semibold text-rose-300"}>{value}</span>
    </div>
  );
}

function issuePriority(question: { content_status?: string; content_issue_types?: string[]; math_review_status?: string }) {
  if (question.content_status === "hide_from_student") return 4;
  if (question.content_issue_types?.some((issue) => issue.includes("incomplete_question"))) return 3;
  if (question.content_issue_types?.some((issue) => issue.includes("broken_options"))) return 2;
  if (question.math_review_status === "needs_review") return 1;
  return 0;
}
