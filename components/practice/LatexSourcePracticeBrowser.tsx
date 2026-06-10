"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Search } from "lucide-react";
import type { PracticeLevel } from "@/types/practice";
import type { LatexSourcePracticeQuestion } from "@/types/latex-practice";
import { OutlinePill } from "@/components/ui/Badge";
import { DifficultyBadge, EmptyState } from "@/components/ui/premium";
import { RichMathRenderer } from "@/components/practice/RichMathRenderer";

const PAGE_SIZE = 18;

type FilterState = {
  query: string;
  topic: string;
  difficulty: string;
  questionType: string;
  sourceFile: string;
};

export function LatexSourcePracticeBrowser({
  questions,
  level,
}: {
  questions: LatexSourcePracticeQuestion[];
  level: PracticeLevel | "Mixed";
}) {
  const [filters, setFilters] = useState<FilterState>({ query: "", topic: "All", difficulty: "All", questionType: "All", sourceFile: "All" });
  const [page, setPage] = useState(0);
  const options = useMemo(() => ({
    topics: unique(questions.map((question) => question.topic)),
    difficulties: unique(questions.map((question) => question.difficulty)),
    questionTypes: unique(questions.map((question) => question.question_type)),
    sourceFiles: unique(questions.map((question) => question.source_tex_file)),
  }), [questions]);
  const filtered = useMemo(() => questions.filter((question) => {
    const haystack = `${question.plain_preview} ${question.topic} ${question.subtopic}`.toLowerCase();
    return (
      (!filters.query || haystack.includes(filters.query.toLowerCase())) &&
      (filters.topic === "All" || question.topic === filters.topic) &&
      (filters.difficulty === "All" || question.difficulty === filters.difficulty) &&
      (filters.questionType === "All" || question.question_type === filters.questionType) &&
      (filters.sourceFile === "All" || question.source_tex_file === filters.sourceFile)
    );
  }), [questions, filters]);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const safePage = Math.min(page, Math.max(0, totalPages - 1));
  const pageSlice = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  function update(next: Partial<FilterState>) {
    setFilters((current) => ({ ...current, ...next }));
    setPage(0);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 rounded-2xl border border-white/8 bg-white/[0.025] p-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="relative sm:col-span-2">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
          <input
            value={filters.query}
            onChange={(event) => update({ query: event.target.value })}
            placeholder="Search questions"
            className="w-full rounded-xl border border-white/10 bg-ink-950/80 py-2 pl-9 pr-3 text-sm text-white outline-none transition-colors placeholder:text-slate-600 focus:border-cyan-400/40"
          />
        </div>
        <Select value={filters.topic} onChange={(value) => update({ topic: value })} options={options.topics} label="Topic" />
        <Select value={filters.difficulty} onChange={(value) => update({ difficulty: value })} options={options.difficulties} label="Difficulty" />
        <Select value={filters.questionType} onChange={(value) => update({ questionType: value })} options={options.questionTypes} label="Type" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-slate-400">
          <span className="font-semibold text-white">{filtered.length}</span> question{filtered.length === 1 ? "" : "s"}
          {level !== "Mixed" ? ` in ${level}` : ""}
        </p>
        <p className="text-xs text-slate-600">Source-grounded · solutions included</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {pageSlice.map((question) => <LatexSourceQuestionCard key={question.question_id} question={question} />)}
      </div>

      {!pageSlice.length && (
        <EmptyState
          icon={Search}
          title="No questions match"
          description="Try clearing a filter or searching for a different topic."
        />
      )}

      {totalPages > 1 && <Pagination page={safePage} totalPages={totalPages} total={filtered.length} pageSize={PAGE_SIZE} onChange={setPage} />}
    </div>
  );
}

function LatexSourceQuestionCard({ question }: { question: LatexSourcePracticeQuestion }) {
  return (
    <Link
      href={`/exams/cat/quant/latex-source/practice/${question.question_id}`}
      className="group flex flex-col rounded-2xl border border-white/8 bg-white/[0.025] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-400/25 hover:bg-white/[0.045]"
    >
      <div className="flex flex-wrap items-center gap-2">
        <OutlinePill>{question.practice_level}</OutlinePill>
        <DifficultyBadge level={question.difficulty} />
        <OutlinePill>{question.question_type}</OutlinePill>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
        <span className="font-medium text-slate-400">{question.topic}</span>
        <span className="text-slate-700">/</span>
        <span>{question.subtopic}</span>
      </div>
      <RichMathRenderer
        content={question.plain_preview || "Open the question to view the full problem."}
        compact
        className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-300"
      />
      <span className="mt-4 inline-flex items-center gap-1 border-t border-white/8 pt-4 text-xs font-semibold text-cyan-300">
        Open question <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

function Select({ value, onChange, options, label }: { value: string; onChange: (value: string) => void; options: string[]; label: string }) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      aria-label={label}
      className="w-full rounded-xl border border-white/10 bg-ink-950/80 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-cyan-400/40"
    >
      <option value="All">All {label}</option>
      {options.map((option) => <option key={option} value={option}>{option}</option>)}
    </select>
  );
}

function Pagination({ page, totalPages, total, pageSize, onChange }: { page: number; totalPages: number; total: number; pageSize: number; onChange: (page: number) => void }) {
  const start = page * pageSize + 1;
  const end = Math.min((page + 1) * pageSize, total);
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/8 bg-white/[0.025] px-5 py-3">
      <p className="text-sm text-slate-500">Showing {start}–{end} of {total}</p>
      <div className="flex items-center gap-2">
        <button onClick={() => onChange(page - 1)} disabled={page === 0} className="inline-flex items-center gap-1 rounded-lg border border-white/8 bg-white/[0.025] px-3 py-1.5 text-sm text-slate-300 transition-all hover:border-cyan-400/25 hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-40">
          <ChevronLeft size={14} /> <span className="hidden sm:inline">Previous</span>
        </button>
        <span className="text-sm text-slate-500">Page {page + 1} / {totalPages}</span>
        <button onClick={() => onChange(page + 1)} disabled={page >= totalPages - 1} className="inline-flex items-center gap-1 rounded-lg border border-white/8 bg-white/[0.025] px-3 py-1.5 text-sm text-slate-300 transition-all hover:border-cyan-400/25 hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-40">
          <span className="hidden sm:inline">Next</span> <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}
