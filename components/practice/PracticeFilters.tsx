"use client";

import { Search } from "lucide-react";

export type PracticeFilterState = {
  query: string;
  topic: string;
  subtopic: string;
  questionType: string;
  difficulty: string;
};

export function PracticeFilters({
  value,
  onChange,
  filters,
}: {
  value: PracticeFilterState;
  onChange: (value: PracticeFilterState) => void;
  filters: {
    topics: string[];
    subtopics: string[];
    questionTypes: string[];
    difficulties: string[];
  };
}) {
  const update = (patch: Partial<PracticeFilterState>) => onChange({ ...value, ...patch });

  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.025] p-5">
      <div className="flex flex-col gap-3 lg:flex-row">
        <label className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-white/8 bg-white/[0.025] px-3 py-2 text-sm text-slate-300">
          <Search size={15} className="text-cyan-300" />
          <input
            value={value.query}
            onChange={(event) => update({ query: event.target.value })}
            placeholder="Search generated practice"
            className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-slate-600 outline-none"
          />
        </label>
        <Select label="Topic" value={value.topic} options={filters.topics} onChange={(topic) => update({ topic })} />
        <Select label="Subtopic" value={value.subtopic} options={filters.subtopics} onChange={(subtopic) => update({ subtopic })} />
        <Select label="Type" value={value.questionType} options={filters.questionTypes} onChange={(questionType) => update({ questionType })} />
        <Select label="Difficulty" value={value.difficulty} options={filters.difficulties} onChange={(difficulty) => update({ difficulty })} />
      </div>
    </div>
  );
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className="min-w-[8rem] rounded-lg border border-white/8 bg-white/[0.025] px-3 py-2">
      <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full bg-transparent text-sm text-slate-200 outline-none">
        <option value="All">All</option>
        {options.map((option) => (
          <option key={option} value={option} className="bg-ink-900 text-white">{option}</option>
        ))}
      </select>
    </label>
  );
}
