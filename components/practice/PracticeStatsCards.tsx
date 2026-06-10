import { BrainCircuit, Crown, Layers3, Target, Zap } from "lucide-react";
import type { CatQuantPracticeStats } from "@/lib/content/practice/cat-quant-practice";
import { StatCard } from "@/components/ui/StatCard";

export function PracticeStatsCards({ stats }: { stats: CatQuantPracticeStats }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
      <StatCard icon={BrainCircuit} label="Generated practice" value={String(stats.total)} detail="not PYQs" />
      <StatCard icon={Zap} label="Beginner" value={String(stats.beginner)} detail="foundation first" tone="emerald" />
      <StatCard icon={Target} label="Intermediate" value={String(stats.intermediate)} detail="CAT-level practice" tone="blue" />
      <StatCard icon={Crown} label="Advanced" value={String(stats.advanced)} detail="premium tough set" tone="purple" />
      <StatCard icon={Layers3} label="P&C / Probability" value={String(stats.pncProbability)} detail="topic group coverage" />
    </div>
  );
}
