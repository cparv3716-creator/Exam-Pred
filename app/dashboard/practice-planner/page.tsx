import type { Metadata } from "next";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { ProbabilityBar } from "@/components/ui/ProbabilityMeter";
import { practicePlan } from "@/data/analytics";
import { requireAnyActiveExamSubscription } from "@/lib/backend/access";

export const metadata: Metadata = {
  title: "Practice Planner",
  description: "Premium weak-area practice planner demo.",
};

export const dynamic = "force-dynamic";

export default async function PracticePlannerPage() {
  await requireAnyActiveExamSubscription("/dashboard/practice-planner");

  return (
    <DashboardShell title="Practice planner" subtitle="Premium weak-area planning and recommended drills." activeHref="/dashboard/practice-planner">
      <div className="grid gap-5">
          {practicePlan.map((item) => (
            <div key={item.topic} className="rounded-xl border border-white/8 bg-white/[0.025] p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold text-white">{item.topic}</h3>
                  <p className="mt-1 text-sm text-slate-500">Priority: {item.priority}. Recommended drills: {item.recommended}</p>
                </div>
                <span className="text-sm font-semibold text-cyan-300">{item.strength}% strength</span>
              </div>
              <div className="mt-4">
                <ProbabilityBar value={item.strength} accent={item.priority === "high" ? "#f43f5e" : "#22d3ee"} />
              </div>
            </div>
          ))}
      </div>
    </DashboardShell>
  );
}
