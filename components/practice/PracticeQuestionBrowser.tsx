"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { GeneratedPracticeQuestion, PracticeLevel } from "@/types/practice";
import { isPremium, useRoleStore } from "@/stores/use-role-store";
import { PracticeFilters, type PracticeFilterState } from "@/components/practice/PracticeFilters";
import { PracticeQuestionCard } from "@/components/practice/PracticeQuestionCard";

const PAGE_SIZE = 15;

export function PracticeQuestionBrowser({
  questions,
  level,
}: {
  questions: GeneratedPracticeQuestion[];
  level: PracticeLevel | "Mixed";
}) {
  const role = useRoleStore((state) => state.role);
  const premium = isPremium(role);
  const [filters, setFilters] = useState<PracticeFilterState>({
    query: "",
    topic: "All",
    subtopic: "All",
    questionType: "All",
    difficulty: "All",
  });
  const [page, setPage] = useState(0);

  const options = useMemo(() => ({
    topics: unique(questions.map((q) => q.topic)),
    subtopics: unique(questions.map((q) => q.subtopic)),
    questionTypes: unique(questions.map((q) => q.question_type)),
    difficulties: unique(questions.map((q) => q.difficulty)),
  }), [questions]);

  const filtered = useMemo(() => questions.filter((q) => {
    const haystack = `${q.question_text} ${q.topic} ${q.subtopic}`.toLowerCase();
    return (
      (!filters.query || haystack.includes(filters.query.toLowerCase())) &&
      (filters.topic === "All" || q.topic === filters.topic) &&
      (filters.subtopic === "All" || q.subtopic === filters.subtopic) &&
      (filters.questionType === "All" || q.question_type === filters.questionType) &&
      (filters.difficulty === "All" || q.difficulty === filters.difficulty)
    );
  }), [questions, filters]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const safePage = Math.min(page, Math.max(0, totalPages - 1));
  const pageSlice = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  function handleFilterChange(next: PracticeFilterState) {
    setFilters(next);
    setPage(0);
  }

  return (
    <div className="space-y-6">
      <PracticeFilters value={filters} onChange={handleFilterChange} filters={options} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          {filtered.length} question{filtered.length !== 1 ? "s" : ""} match the current filters.
        </p>
        <p className="text-xs text-slate-600">Generated practice — separate from PYQs.</p>
      </div>

      <div className="grid gap-4">
        {pageSlice.map((question, indexOnPage) => {
          const absoluteIndex = safePage * PAGE_SIZE + indexOnPage;
          const effectiveLevel = level === "Mixed" ? question.practice_level : level;
          const guestLocked = role === "guest";
          const advancedLocked = effectiveLevel === "Advanced" && !premium;
          const intermediateLocked = effectiveLevel === "Intermediate" && !premium && absoluteIndex > 2;
          const locked = guestLocked || advancedLocked || intermediateLocked;
          return (
            <PracticeQuestionCard
              key={question.question_id}
              question={question}
              locked={locked}
            />
          );
        })}
      </div>

      {totalPages > 1 && (
        <Pagination
          page={safePage}
          totalPages={totalPages}
          total={filtered.length}
          pageSize={PAGE_SIZE}
          onChange={setPage}
        />
      )}
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  onChange,
}: {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onChange: (page: number) => void;
}) {
  const start = page * pageSize + 1;
  const end = Math.min((page + 1) * pageSize, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/8 bg-white/[0.025] px-5 py-3">
      <p className="text-sm text-slate-500">
        Showing {start}–{end} of {total}
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page === 0}
          className="inline-flex items-center gap-1 rounded-lg border border-white/8 bg-white/[0.025] px-3 py-1.5 text-sm text-slate-300 transition-all hover:border-cyan-400/25 hover:bg-white/[0.05] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={14} /> Previous
        </button>
        <span className="text-sm text-slate-500">
          Page {page + 1} / {totalPages}
        </span>
        <button
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages - 1}
          className="inline-flex items-center gap-1 rounded-lg border border-white/8 bg-white/[0.025] px-3 py-1.5 text-sm text-slate-300 transition-all hover:border-cyan-400/25 hover:bg-white/[0.05] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}
