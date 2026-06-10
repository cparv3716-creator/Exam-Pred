"use client";

import Link from "next/link";
import { Download, FileText, Lock, Search, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import type { LocalPyqCleanRow } from "@/lib/content/validators/types";
import type { PyqStats } from "@/lib/content/pyqs";
import { isPremium, useRoleStore } from "@/stores/use-role-store";
import { DifficultyBadge, OutlinePill } from "@/components/ui/Badge";
import { ProbabilityBar } from "@/components/ui/ProbabilityMeter";
import { PlanLockCard } from "@/components/ui/PlanLockCard";

export function LocalPyqExperience({
  examSlug,
  rows,
  stats,
  coverage,
}: {
  examSlug: string;
  rows: LocalPyqCleanRow[];
  stats: PyqStats;
  coverage: Array<{ topic: string; count: number; freeCount: number; premiumCount: number; subtopicCount: number }>;
}) {
  const role = useRoleStore((state) => state.role);
  const premium = isPremium(role);
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState("All");
  const [subtopic, setSubtopic] = useState("All");
  const [year, setYear] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [questionType, setQuestionType] = useState("All");

  const options = useMemo(() => ({
    topics: unique(rows.map((row) => row.topic)),
    subtopics: unique(rows.map((row) => row.subtopic)),
    years: unique(rows.map((row) => String(row.year ?? ""))),
    difficulties: unique(rows.map((row) => row.difficulty)),
    questionTypes: unique(rows.map((row) => row.question_type)),
  }), [rows]);

  const filteredRows = rows.filter((row) => {
    const haystack = `${row.question_text} ${row.topic} ${row.subtopic} ${row.archetype}`.toLowerCase();
    return (
      (!query || haystack.includes(query.toLowerCase())) &&
      (topic === "All" || row.topic === topic) &&
      (subtopic === "All" || row.subtopic === subtopic) &&
      (year === "All" || String(row.year ?? "") === year) &&
      (difficulty === "All" || row.difficulty === difficulty) &&
      (questionType === "All" || row.question_type === questionType)
    );
  });

  return (
    <div className="space-y-8">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard label="Validated PYQs" value={String(stats.rowCount)} detail={`${stats.files.length} local files`} />
        <SummaryCard label="Topics" value={String(stats.topicCount)} detail={`${stats.subtopicCount} subtopics`} />
        <SummaryCard label="Free rows" value={String(stats.freeCount)} detail="visible to free users" />
        <SummaryCard label="Premium rows" value={String(stats.premiumCount)} detail="premium locked" />
      </div>

      <div className="rounded-xl border border-white/8 bg-white/[0.025] p-5">
        <div className="flex flex-col gap-3 lg:flex-row">
          <label className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-white/8 bg-white/[0.025] px-3 py-2 text-sm text-slate-300">
            <Search size={15} className="text-cyan-300" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search local PYQs"
              className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-slate-600 outline-none"
            />
          </label>
          <FilterSelect label="Topic" value={topic} options={options.topics} onChange={setTopic} />
          <FilterSelect label="Subtopic" value={subtopic} options={options.subtopics} onChange={setSubtopic} />
          <FilterSelect label="Year" value={year} options={options.years} onChange={setYear} />
          <FilterSelect label="Difficulty" value={difficulty} options={options.difficulties} onChange={setDifficulty} />
          <FilterSelect label="Type" value={questionType} options={options.questionTypes} onChange={setQuestionType} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {coverage.slice(0, 6).map((item) => (
          <div key={item.topic} className="rounded-xl border border-white/8 bg-white/[0.025] p-5">
            <h3 className="text-base font-semibold text-white">{item.topic}</h3>
            <p className="mt-1 text-sm text-slate-500">{item.count} rows / {item.subtopicCount} subtopics</p>
            <div className="mt-4">
              <ProbabilityBar value={stats.rowCount ? Math.round((item.count / stats.rowCount) * 100) : 0} />
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Local validated PYQ bank</h2>
          <p className="mt-1 text-sm text-slate-500">{filteredRows.length} rows match the current filters.</p>
        </div>
        <Link href="/admin/upload-pyqs" className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-200">
          <Download size={15} /> Import workflow
        </Link>
      </div>

      <div className="grid gap-4">
        {filteredRows.map((row, index) => {
          const locked = role === "guest" ? index > 2 : (!premium && row.is_premium && !row.is_free);
          return <LocalPyqCard key={`${row.question_id}-${index}`} row={row} locked={locked} />;
        })}
      </div>

      {!premium && stats.premiumCount > 0 && (
        <PlanLockCard
          title={`${examSlug.toUpperCase()} premium PYQs locked`}
          description="Free access shows free rows and limited previews. Premium/Admin unlock premium rows, solutions and lineage."
          features={["Premium local PYQ rows", "Detailed solutions", "Evidence and source references"]}
        />
      )}
    </div>
  );
}

export function LocalPyqEmptyState() {
  return (
    <div className="rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] p-8 text-center">
      <FileText size={30} className="mx-auto text-amber-200" />
      <h2 className="mt-4 text-xl font-semibold text-white">CAT PYQ upload not completed yet.</h2>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-amber-100/90">
        Predicted papers and reports are connected, but question-level PYQ bank is not uploaded.
      </p>
      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <Link href="/admin/upload-pyqs" className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-600 px-5 py-3 text-sm font-semibold text-white">
          <Sparkles size={15} /> Open Local Content Studio
        </Link>
        <Link href="/docs/LOCAL_CONTENT_STUDIO.md" className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-slate-200">
          Read workflow
        </Link>
      </div>
    </div>
  );
}

function LocalPyqCard({ row, locked }: { row: LocalPyqCleanRow; locked: boolean }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-white/8 bg-white/[0.025] p-5">
      {locked && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-ink-950/60 p-5 backdrop-blur-[5px]">
          <div className="text-center">
            <Lock size={22} className="mx-auto text-purple-300" />
            <p className="mt-2 text-sm font-semibold text-white">Premium locked</p>
          </div>
        </div>
      )}
      <div className={locked ? "blur-[2px]" : undefined}>
        <div className="flex flex-wrap items-center gap-2">
          <OutlinePill>{row.section}</OutlinePill>
          <OutlinePill>{row.year ?? "Year N/A"}</OutlinePill>
          <OutlinePill>{row.question_type}</OutlinePill>
          <DifficultyBadge level={normalizeDifficulty(row.difficulty)} />
        </div>
        <p className="mt-4 text-sm leading-relaxed text-slate-200">{row.question_text}</p>
        {row.question_type === "MCQ" && (
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {(["option_a", "option_b", "option_c", "option_d"] as const).map((field, index) => (
              row[field] ? (
                <div key={field} className="rounded-lg border border-white/8 bg-white/[0.025] px-3 py-2 text-sm text-slate-300">
                  <span className="mr-2 font-semibold text-slate-500">{String.fromCharCode(65 + index)}.</span>
                  {row[field]}
                </div>
              ) : null
            ))}
          </div>
        )}
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
          <span>{row.topic}</span>
          <span>/</span>
          <span>{row.subtopic}</span>
          {row.source_reference && (
            <>
              <span>/</span>
              <span>{row.source_reference}</span>
            </>
          )}
        </div>
        {row.detailed_solution && (
          <div className="mt-4 rounded-lg border border-cyan-400/15 bg-cyan-400/[0.04] p-4 text-sm leading-relaxed text-slate-300">
            {row.detailed_solution}
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.025] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{detail}</p>
    </div>
  );
}

function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className="min-w-[8rem] rounded-lg border border-white/8 bg-white/[0.025] px-3 py-2">
      <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full bg-transparent text-sm text-slate-200 outline-none">
        <option value="All">All</option>
        {options.filter(Boolean).map((option) => (
          <option key={option} value={option} className="bg-ink-900 text-white">{option}</option>
        ))}
      </select>
    </label>
  );
}

function normalizeDifficulty(difficulty: LocalPyqCleanRow["difficulty"]): "easy" | "medium" | "hard" {
  if (difficulty === "Easy") return "easy";
  if (difficulty === "Hard" || difficulty === "Medium-Hard") return "hard";
  return "medium";
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}
