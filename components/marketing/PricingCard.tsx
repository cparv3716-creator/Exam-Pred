import Link from "next/link";
import { Check, Crown } from "lucide-react";
import type { PricingPlan } from "@/types/examiq";
import { cn } from "@/lib/utils";

export function PricingCard({ plan }: { plan: PricingPlan }) {
  return (
    <div
      className={cn(
        "relative rounded-xl border bg-white/[0.025] p-6",
        plan.highlighted ? "border-cyan-400/30 shadow-cyan" : "border-white/8",
      )}
    >
      {plan.highlighted && (
        <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-[11px] font-semibold text-cyan-200">
          <Crown size={12} /> Most capable
        </span>
      )}
      <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
      <p className="mt-2 min-h-[44px] text-sm leading-relaxed text-slate-500">{plan.description}</p>
      <div className="mt-6 flex items-end gap-2">
        <span className="text-4xl font-semibold tracking-tight text-white">
          {plan.price === "Custom" ? "Custom" : `Rs ${plan.price}`}
        </span>
        <span className="pb-1 text-sm text-slate-500">{plan.cadence}</span>
      </div>
      <Link
        href={plan.name === "Free" ? "/signup" : "/pricing"}
        className={cn(
          "mt-6 flex items-center justify-center rounded-lg px-4 py-3 text-sm font-semibold",
          plan.highlighted
            ? "bg-gradient-to-r from-cyan-400 to-blue-600 text-white"
            : "border border-white/10 bg-white/[0.04] text-slate-200 hover:border-cyan-400/30",
        )}
      >
        {plan.cta}
      </Link>
      <div className="mt-6 space-y-3">
        {plan.features.map((feature) => (
          <p key={feature} className="flex items-start gap-2 text-sm text-slate-400">
            <Check size={15} className="mt-0.5 shrink-0 text-emerald-300" />
            {feature}
          </p>
        ))}
      </div>
    </div>
  );
}
