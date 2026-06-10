import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2, Download, FileText, Target } from "lucide-react";
import type { CatDashboardStats, CatSelectedPaper } from "@/types/content";
import { ProbabilityBar } from "@/components/ui/ProbabilityMeter";
import { StatCard } from "@/components/ui/StatCard";

export function CatStatsGrid({ stats }: { stats: CatDashboardStats }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard icon={FileText} label="Selected pool" value={String(stats.selectedCandidatePool)} detail="candidate rows" />
      <StatCard icon={CheckCircle2} label="Paper eligible" value={String(stats.selectedPaperEligible)} detail="selected candidates" tone="emerald" />
      <StatCard icon={Target} label="Specs represented" value={String(stats.specsRepresented)} detail="QA specs" tone="blue" />
      <StatCard icon={AlertTriangle} label="Risk score" value={stats.riskScore !== null ? stats.riskScore.toFixed(2) : "N/A"} detail="portfolio risk" tone="purple" />
    </div>
  );
}

export function CatRecommendationCard({
  stats,
  papers,
}: {
  stats: CatDashboardStats;
  papers: CatSelectedPaper[];
}) {
  return (
    <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/[0.045] p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">CAT final recommendation</p>
      <h3 className="mt-3 text-xl font-semibold tracking-tight text-white">{stats.topPredictedPaper}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-400">
        Expected overlap {stats.expectedOverlap !== null ? stats.expectedOverlap.toFixed(3) : "N/A"} with readiness status: {stats.readiness}.
      </p>
      <div className="mt-5 space-y-4">
        {papers.slice(0, 4).map((paper) => (
          <div key={paper.variant}>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-slate-300">{paper.variant}</span>
              <span className="text-cyan-300">{paper.expectedOverlap?.toFixed(3) ?? "N/A"}</span>
            </div>
            <ProbabilityBar value={Math.round((paper.expectedOverlap ?? 0) * 100)} />
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-lg border border-amber-400/20 bg-amber-400/[0.06] p-4 text-sm leading-relaxed text-amber-100/90">
        {stats.coverageRiskNote}
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/exams/cat/predicted-papers" className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white">
          Predicted papers <ArrowRight size={15} />
        </Link>
        <Link href="/exams/cat/reports" className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-slate-200">
          Downloads <Download size={15} />
        </Link>
      </div>
    </div>
  );
}
