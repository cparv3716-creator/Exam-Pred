"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, ChevronLeft, ChevronRight, Search } from "lucide-react";
import type { PracticeLevel } from "@/types/practice";
import type { VarcSourceQuestion, VarcType } from "@/types/varc-practice";
import { OutlinePill } from "@/components/ui/Badge";
import { DifficultyBadge, EmptyState } from "@/components/ui/premium";

const PAGE_SIZE = 16;

const VARC_TYPE_COLORS: Record<VarcType, string> = {
  RC: "border-cyan-400/20 bg-cyan-400/[0.06] text-cyan-200",
  "Para Summary": "border-purple-400/20 bg-purple-400/[0.06] text-purple-200",
  "Para Jumble": "border-amber-400/20 bg-amber-400/[0.06] text-amber-200",
  "Odd Sentence Out": "border-rose-400/20 bg-rose-400/[0.06] text-rose-200",
  "Sentence Placement": "border-emerald-400/20 bg-emerald-400/[0.06] text-emerald-200",
  "Para Completion": "border-sky-400/20 bg-sky-400/[0.06] text-sky-200",
  "Critical Reasoning": "border-orange-400/20 bg-orange-400/[0.06] text-orange-200",
  Other: "border-white/10 bg-white/[0.03] text-slate-300",
};

type FilterState = { query: string; varcType: string; level: string };

export function VarcSourcePracticeBrowser({
  questions,
  level,
}: {
  questions: VarcSourceQuestion[];
  level: PracticeLevel | "Mixed";
}) {
  const [filters, setFilters] = useState<FilterState>({ query: "", varcType: "All", level: "All" });
  const [page, setPage] = useState(0);

  const options = useMemo(
    () => ({
      varcTypes: unique(questions.map((q) => q.varc_type)),
      levels: unique(questions.map((q) => q.practice_level)),
    }),
    [questions],
  );

  const filtered = useMemo(
    () =>
      questions.filter((q) => {
        const haystack = `${q.question_text_markdown} ${q.varc_type} ${q.subtopic}`.toLowerCase();
        return (
          (!filters.query || haystack.includes(filters.query.toLowerCase())) &&
          (filters.varcType === "All" || q.varc_type === filters.varcType) &&
          (filters.level === "All" || q.practice_level === filters.level)
        );
      }),
    [questions, filters],
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const safePage = Math.min(page, Math.max(0, totalPages - 1));
  const pageSlice = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  function update(next: Partial<FilterState>) {
    setFilters((c) => ({ ...c, ...next }));
    setPage(0);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 rounded-2xl border border-white/8 bg-white/[0.025] p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative sm:col-span-2">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
          <input
            value={filters.query}
            onChange={(e) => update({ query: e.target.value })}
            placeholder="Search questions"
            className="w-full rounded-xl border border-white/10 bg-ink-950/80 py-2 pl-9 pr-3 text-sm text-white outline-none transition-colors placeholder:text-slate-600 focus:border-cyan-400/40"
          />
        </div>
        <Select value={filters.varcType} onChange={(v) => update({ varcType: v })} options={options.varcTypes} label="Type" />
        {level === "Mixed" && (
          <Select value={filters.level} onChange={(v) => update({ level: v })} options={options.levels} label="Level" />
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-slate-400">
          <span className="font-semibold text-white">{filtered.length}</span> question{filtered.length === 1 ? "" : "s"}
          {level !== "Mixed" ? ` in ${level}` : ""}
        </p>
        <p className="text-xs text-slate-600">Preserved exactly from source</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {pageSlice.map((q) => (
          <VarcQuestionCard key={q.question_id} question={q} />
        ))}
      </div>

      {!pageSlice.length && (
        <EmptyState
          icon={Search}
          title="No questions match"
          description="Try clearing a filter or searching for a different question type."
        />
      )}

      {totalPages > 1 && (
        <Pagination page={safePage} totalPages={totalPages} total={filtered.length} pageSize={PAGE_SIZE} onChange={setPage} />
      )}
    </div>
  );
}

function VarcQuestionCard({ question }: { question: VarcSourceQuestion }) {
  const typeColor = VARC_TYPE_COLORS[question.varc_type] ?? VARC_TYPE_COLORS.Other;
  const passagePreview = question.passage_text_markdown.trim().slice(0, 180).replace(/\n+/g, " ").trim();
  const questionPreview = question.question_text_markdown.trim().slice(0, 160).replace(/\n+/g, " ").trim();

  return (
    <Link
      href={`/exams/cat/varc/source/practice/${question.question_id}`}
      className="group flex flex-col rounded-2xl border border-white/8 bg-white/[0.025] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-400/25 hover:bg-white/[0.045]"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${typeColor}`}>
          {question.varc_type === "RC" && <BookOpen size={10} />}
          {question.varc_type}
        </span>
        <OutlinePill>{question.practice_level}</OutlinePill>
        {question.difficulty && <DifficultyBadge level={question.difficulty} />}
      </div>

      {question.varc_type === "RC" && passagePreview && (
        <p className="mt-3 text-xs italic leading-relaxed text-slate-500 line-clamp-2">
          {passagePreview}
          {passagePreview.length === 180 ? "…" : ""}
        </p>
      )}

      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-300">
        {questionPreview || "Open the question to view the full text."}
        {questionPreview.length === 160 ? "…" : ""}
      </p>

      <span className="mt-4 inline-flex items-center gap-1 border-t border-white/8 pt-4 text-xs font-semibold text-cyan-300">
        Open question <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

function Select({ value, onChange, options, label }: { value: string; onChange: (v: string) => void; options: string[]; label: string }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={label}
      className="w-full rounded-xl border border-white/10 bg-ink-950/80 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-cyan-400/40"
    >
      <option value="All">All {label}</option>
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  );
}

function Pagination({ page, totalPages, total, pageSize, onChange }: { page: number; totalPages: number; total: number; pageSize: number; onChange: (p: number) => void }) {
  const start = page * pageSize + 1;
  const end = Math.min((page + 1) * pageSize, total);
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/8 bg-white/[0.025] px-5 py-3">
      <p className="text-sm text-slate-500">Showing {start}–{end} of {total}</p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page === 0}
          className="inline-flex items-center gap-1 rounded-lg border border-white/8 bg-white/[0.025] px-3 py-1.5 text-sm text-slate-300 transition-all hover:border-cyan-400/25 hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={14} /> <span className="hidden sm:inline">Previous</span>
        </button>
        <span className="text-sm text-slate-500">Page {page + 1} / {totalPages}</span>
        <button
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages - 1}
          className="inline-flex items-center gap-1 rounded-lg border border-white/8 bg-white/[0.025] px-3 py-1.5 text-sm text-slate-300 transition-all hover:border-cyan-400/25 hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span className="hidden sm:inline">Next</span> <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr.filter(Boolean))).sort((a, b) => String(a).localeCompare(String(b))) as T[];
}
