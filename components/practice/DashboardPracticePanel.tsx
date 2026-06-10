"use client";

import Link from "next/link";
import { ArrowRight, Crown, Lock, Sparkles } from "lucide-react";
import type { CatQuantPracticeStats } from "@/lib/content/practice/cat-quant-practice";
import { isPremium, useRoleStore } from "@/stores/use-role-store";

export function DashboardPracticePanel({ stats }: { stats: CatQuantPracticeStats }) {
  const role = useRoleStore((state) => state.role);
  const premium = isPremium(role);

  return (
    <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.045] p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
            <Sparkles size={14} /> CAT Quant Practice
          </p>
          <h2 className="mt-3 text-xl font-semibold text-white">Generated Quant practice is ready</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
            Beginner, Intermediate and Advanced generated practice are separate from PYQs. Topic probability is tracked separately from difficulty.
          </p>
        </div>
        <Link href="/exams/cat/quant" className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-600 px-5 py-3 text-sm font-semibold text-white">
          Open practice <ArrowRight size={15} />
        </Link>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <MiniStat label="Beginner" value={stats.beginner} detail="free-friendly" />
        <MiniStat label="Intermediate" value={stats.intermediate} detail="limited free previews" />
        <MiniStat label="Advanced" value={stats.advanced} detail={premium ? "unlocked" : "premium locked"} locked={!premium} />
      </div>

      <div className="mt-5 flex flex-wrap gap-3 text-xs text-slate-500">
        <span>{stats.topicCount} topics</span>
        <span>/</span>
        <span>{stats.subtopicCount} subtopics</span>
        <span>/</span>
        <span>{stats.pncProbability} P&C / Probability questions</span>
      </div>
    </div>
  );
}

function MiniStat({ label, value, detail, locked = false }: { label: string; value: number; detail: string; locked?: boolean }) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.025] p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
        {locked ? <Lock size={14} className="text-purple-300" /> : label === "Advanced" ? <Crown size={14} className="text-purple-300" /> : null}
      </div>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{detail}</p>
    </div>
  );
}
