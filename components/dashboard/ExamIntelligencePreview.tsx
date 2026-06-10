import { BarChart3, Target, TrendingUp } from "lucide-react";
import { topicProbability } from "@/data/analytics";
import { ProbabilityBar, ProbabilityRing } from "@/components/ui/ProbabilityMeter";

export function ExamIntelligencePreview() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] p-2 shadow-cyan">
      <div className="rounded-xl bg-[#070b16] p-5 sm:p-7">
        <div className="mb-6 flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-rose-400/70" />
          <span className="h-3 w-3 rounded-full bg-amber-400/70" />
          <span className="h-3 w-3 rounded-full bg-emerald-400/70" />
          <span className="ml-3 text-xs text-slate-600">examiq - intelligence cockpit</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: TrendingUp, label: "Trend shift", value: "+18%", sub: "Arithmetic rising" },
            { icon: Target, label: "Top signal", value: "86%", sub: "Time and Work" },
            { icon: BarChart3, label: "Topics tracked", value: "96", sub: "CAT QA/VARC/DILR" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-white/8 bg-white/[0.025] p-4">
              <div className="flex items-center gap-2 text-slate-500">
                <stat.icon size={15} className="text-cyan-300" />
                <span className="text-xs uppercase tracking-wide">{stat.label}</span>
              </div>
              <p className="mt-2 text-2xl font-semibold text-white">{stat.value}</p>
              <p className="text-xs text-slate-500">{stat.sub}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_auto]">
          <div className="space-y-3">
            {topicProbability.slice(0, 5).map((topic) => (
              <div key={topic.topic} className="grid grid-cols-[7rem_1fr] items-center gap-3">
                <span className="truncate text-sm text-slate-400">{topic.topic}</span>
                <ProbabilityBar value={topic.probability} />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-4">
            {topicProbability.slice(0, 3).map((topic) => (
              <ProbabilityRing key={topic.topic} value={topic.probability} size={78} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
