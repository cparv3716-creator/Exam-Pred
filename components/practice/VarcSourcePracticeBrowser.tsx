"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import type { PracticeLevel } from "@/types/practice";
import type { VarcSourceQuestion, VarcType } from "@/types/varc-practice";
import { OutlinePill } from "@/components/ui/Badge";

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
        const haystack = `${q.question_text_markdown} ${q.varc_type} ${q.subtopic} ${q.source_file}`.toLowerCase();
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
      <div className="grid gap-3 rounded-2xl border border-white/8 bg-white/[0.025] p-4 md:grid-cols-4">
        <input
          value={filters.query}
          onChange={(e) => update({ query: e.target.value })}
          placeholder="Search VARC bank…"
          className="rounded-xl border border-white/10 bg-ink-950/80 px-3 py-2 text-sm text-white outline-none transition-colors placeholder:text-slate-600 focus:border-cyan-400/40 md:col-span-2"
        />
        <Select value={filters.varcType} onChange={(v) => update({ varcType: v })} options={options.varcTypes} label="Type" />
        {level === "Mixed" && (
          <Select value={filters.level} onChange={(v) => update({ level: v })} options={options.levels} label="Level" />
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          {filtered.length} question{filtered.length === 1 ? "" : "s"} match.
        </p>
        <p className="text-xs text-slate-600">Source-direct from PDF — text preserved as written.</p>
      </div>

      <div className="grid gap-4">
        {pageSlice.map((q) => (
          <VarcQuestionCard key={q.question_id} question={q} />
        ))}
        {!pageSlice.length && (
          <div className="rounded-xl border border-white/8 bg-white/[0.025] p-8 text-center text-sm text-slate-500">
            No questions match the current filters.
          </div>
        )}
      </div>

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
    <article className="rounded-xl border border-white/8 bg-white/[0.025] p-5 transition-all hover:border-cyan-400/25 hover:bg-white/[0.045]">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${typeColor}`}>
          {question.varc_type === "RC" && <BookOpen size={10} />}
          {question.varc_type}
        </span>
        <OutlinePill>{question.practice_level}</OutlinePill>
        {question.difficulty && <OutlinePill>{question.difficulty}</OutlinePill>}
      </div>

      {question.varc_type === "RC" && passagePreview && (
        <p className="mt-3 text-xs italic leading-relaxed text-slate-500 line-clamp-2">
          {passagePreview}{passagePreview.length === 180 ? "…" : ""}
        </p>
      )}

      <p className="mt-2 text-sm leading-relaxed text-slate-300 line-clamp-2">
        {questionPreview || "Open the question to view the full text."}
        {questionPreview.length === 160 ? "…" : ""}
      </p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/8 pt-4">
        <p className="text-[11px] text-slate-600">{question.source_file} · Q{question.source_question_number}</p>
        <Link
          href={`/exams/cat/varc/source/practice/${question.question_id}`}
          className="inline-flex items-center gap-1 rounded-lg border border-cyan-400/20 bg-cyan-400/[0.06] px-3 py-1.5 text-xs font-semibold text-cyan-300 transition-colors hover:bg-cyan-400/[0.1]"
        >
          Practice <ArrowRight size={12} />
        </Link>
      </div>
    </article>
  );
}

function Select({ value, onChange, options, label }: { value: string; onChange: (v: string) => void; options: string[]; label: string }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={label}
      className="rounded-xl border border-white/10 bg-ink-950/80 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-cyan-400/40"
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
          <ChevronLeft size={14} /> Previous
        </button>
        <span className="text-sm text-slate-500">Page {page + 1} / {totalPages}</span>
        <button
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages - 1}
          className="inline-flex items-center gap-1 rounded-lg border border-white/8 bg-white/[0.025] px-3 py-1.5 text-sm text-slate-300 transition-all hover:border-cyan-400/25 hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr.filter(Boolean))).sort((a, b) => String(a).localeCompare(String(b))) as T[];
}
