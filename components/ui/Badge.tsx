import type { Difficulty, Risk } from "@/types/examiq";
import { cn } from "@/lib/utils";

export function SoftPill({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-200 shadow-cyan",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function OutlinePill({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium text-slate-300",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function DifficultyBadge({ level }: { level: Difficulty }) {
  const styles: Record<Difficulty, string> = {
    easy: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
    medium: "border-cyan-400/20 bg-cyan-400/10 text-cyan-200",
    hard: "border-purple-400/25 bg-purple-400/10 text-purple-200",
  };

  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize",
        styles[level],
      )}
    >
      {level}
    </span>
  );
}

export function RiskBadge({ risk }: { risk: Risk }) {
  const styles: Record<Risk, string> = {
    low: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
    medium: "border-amber-400/20 bg-amber-400/10 text-amber-200",
    high: "border-rose-400/20 bg-rose-400/10 text-rose-200",
  };

  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize",
        styles[risk],
      )}
    >
      {risk} risk
    </span>
  );
}
