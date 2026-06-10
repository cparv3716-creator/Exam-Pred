import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function FeatureCard({
  icon: Icon,
  title,
  description,
  tone = "cyan",
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  tone?: "cyan" | "blue" | "purple" | "emerald";
}) {
  const tones = {
    cyan: "text-cyan-300 border-cyan-400/20 bg-cyan-400/10",
    blue: "text-blue-300 border-blue-400/20 bg-blue-400/10",
    purple: "text-purple-300 border-purple-400/20 bg-purple-400/10",
    emerald: "text-emerald-300 border-emerald-400/20 bg-emerald-400/10",
  };

  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.025] p-7 transition-colors hover:border-white/20">
      <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl border", tones[tone])}>
        <Icon size={22} />
      </div>
      <h3 className="mt-5 text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-400">{description}</p>
    </div>
  );
}
