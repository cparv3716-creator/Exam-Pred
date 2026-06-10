"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, FileText } from "lucide-react";
import type { PracticeLevel } from "@/types/practice";
import type { LatexSourcePracticeQuestion } from "@/types/latex-practice";
import { OutlinePill } from "@/components/ui/Badge";
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
    const haystack = `${question.plain_preview} ${question.topic} ${question.subtopic} ${question.source_tex_file}`.toLowerCase();
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
      <div className="grid gap-3 rounded-2xl border border-white/8 bg-white/[0.025] p-4 md:grid-cols-5">
        <input
          value={filters.query}
          onChange={(event) => update({ query: event.target.value })}
          placeholder="Search LaTeX bank"
          className="rounded-xl border border-white/10 bg-ink-950/80 px-3 py-2 text-sm text-white outline-none transition-colors placeholder:text-slate-600 focus:border-cyan-400/40 md:col-span-2"
        />
        <Select value={filters.topic} onChange={(value) => update({ topic: value })} options={options.topics} label="Topic" />
        <Select value={filters.difficulty} onChange={(value) => update({ difficulty: value })} options={options.difficulties} label="Difficulty" />
        <Select value={filters.questionType} onChange={(value) => update({ questionType: value })} options={options.questionTypes} label="Type" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">{filtered.length} LaTeX-source question{filtered.length === 1 ? "" : "s"} match.</p>
        <p className="text-xs text-slate-600">Direct LaTeX source bank; old PDF-extracted rows are not mixed here.</p>
      </div>

      <div className="grid gap-4">
        {pageSlice.map((question) => <LatexSourceQuestionCard key={question.question_id} question={question} />)}
      </div>

      {totalPages > 1 && <Pagination page={safePage} totalPages={totalPages} total={filtered.length} pageSize={PAGE_SIZE} onChange={setPage} />}
    </div>
  );
}

function LatexSourceQuestionCard({ question }: { question: LatexSourcePracticeQuestion }) {
  return (
    <article className="rounded-xl border border-white/8 bg-white/[0.025] p-5 transition-all hover:border-cyan-400/25 hover:bg-white/[0.045]">
      <div className="flex flex-wrap items-center gap-2">
        <OutlinePill>{question.practice_level}</OutlinePill>
        <OutlinePill>{question.difficulty}</OutlinePill>
        <OutlinePill>{question.question_type}</OutlinePill>
        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-400/[0.06] px-2.5 py-1 text-[11px] font-semibold text-emerald-200">
          <FileText size={11} /> Source: LaTeX
        </span>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
        <span className="font-medium text-slate-400">{question.topic}</span>
        <span>/</span>
        <span>{question.subtopic}</span>
      </div>
      <RichMathRenderer content={question.plain_preview || "Open the question to view the full LaTeX source."} compact className="mt-3 text-sm leading-relaxed text-slate-300" />
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/8 pt-4">
        <p className="text-[11px] text-slate-600">{question.source_tex_file.split("/").pop()} · Q{question.source_question_number}</p>
        <Link href={`/exams/cat/quant/latex-source/practice/${question.question_id}`} className="inline-flex items-center gap-1 rounded-lg border border-cyan-400/20 bg-cyan-400/[0.06] px-3 py-1.5 text-xs font-semibold text-cyan-300 transition-colors hover:bg-cyan-400/[0.1]">
          Open <ArrowRight size={12} />
        </Link>
      </div>
    </article>
  );
}

function Select({ value, onChange, options, label }: { value: string; onChange: (value: string) => void; options: string[]; label: string }) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      aria-label={label}
      className="rounded-xl border border-white/10 bg-ink-950/80 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-cyan-400/40"
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
      <p className="text-sm text-slate-500">Showing {start}-{end} of {total}</p>
      <div className="flex items-center gap-2">
        <button onClick={() => onChange(page - 1)} disabled={page === 0} className="inline-flex items-center gap-1 rounded-lg border border-white/8 bg-white/[0.025] px-3 py-1.5 text-sm text-slate-300 transition-all hover:border-cyan-400/25 hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-40">
          <ChevronLeft size={14} /> Previous
        </button>
        <span className="text-sm text-slate-500">Page {page + 1} / {totalPages}</span>
        <button onClick={() => onChange(page + 1)} disabled={page >= totalPages - 1} className="inline-flex items-center gap-1 rounded-lg border border-white/8 bg-white/[0.025] px-3 py-1.5 text-sm text-slate-300 transition-all hover:border-cyan-400/25 hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-40">
          Next <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}