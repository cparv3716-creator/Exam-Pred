import Link from "next/link";
import { Crown, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export function PlanLockCard({
  title = "Premium feature",
  description = "Upgrade to Premium to unlock this module.",
  features = [],
  compact = false,
}: {
  title?: string;
  description?: string;
  features?: string[];
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-purple-400/20 bg-gradient-to-br from-purple-500/[0.08] via-blue-500/[0.04] to-emerald-500/[0.03]",
        compact ? "p-5" : "p-8",
      )}
    >
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-purple-500/10 blur-2xl" />
      <div className="relative">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-purple-400/30 bg-purple-500/15">
            <Lock size={18} className="text-purple-200" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">{title}</h3>
            <p className="text-xs font-medium uppercase tracking-wide text-purple-300/70">
              Premium only
            </p>
          </div>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-slate-400">{description}</p>

        {features.length > 0 && (
          <ul className="mt-4 space-y-1.5">
            {features.map((feature) => (
              <li key={feature} className="text-sm text-slate-400">
                <span className="mr-2 text-purple-300/70">-</span>
                {feature}
              </li>
            ))}
          </ul>
        )}

        <Link
          href="/pricing"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          <Crown size={16} /> Upgrade to Premium
        </Link>
      </div>
    </div>
  );
}
