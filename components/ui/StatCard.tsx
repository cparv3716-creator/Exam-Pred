import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  detail,
  icon: Icon,
  tone = "cyan",
}: {
  label: string;
  value: string;
  detail?: string;
  icon: LucideIcon;
  tone?: "cyan" | "blue" | "purple" | "emerald" | "rose";
}) {
  const tones = {
    cyan: "text-cyan-300 bg-cyan-400/10 border-cyan-400/20",
    blue: "text-blue-300 bg-blue-400/10 border-blue-400/20",
    purple: "text-purple-300 bg-purple-400/10 border-purple-400/20",
    emerald: "text-emerald-300 bg-emerald-400/10 border-emerald-400/20",
    rose: "text-rose-300 bg-rose-400/10 border-rose-400/20",
  };

  return (
    <div className="group rounded-xl border border-white/8 bg-white/[0.025] p-5 transition-all hover:border-white/18 hover:bg-white/[0.045]">
      <div className="flex items-start justify-between">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg border", tones[tone])}>
          <Icon size={18} />
        </div>
        <ArrowUpRight
          size={17}
          className="text-slate-600 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white"
        />
      </div>
      <p className="mt-5 text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-white">{value}</p>
      {detail && <p className="mt-1 text-sm text-slate-500">{detail}</p>}
    </div>
  );
}
