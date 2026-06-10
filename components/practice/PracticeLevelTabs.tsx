import Link from "next/link";
import type { PracticeLevel } from "@/types/practice";
import { cn } from "@/lib/utils";

const levels: Array<{ label: PracticeLevel; href: string; detail: string }> = [
  { label: "Beginner", href: "/exams/cat/quant/beginner", detail: "Foundation and concept-first practice" },
  { label: "Intermediate", href: "/exams/cat/quant/intermediate", detail: "CAT-level generated practice" },
  { label: "Advanced", href: "/exams/cat/quant/advanced", detail: "Tough and simulation-grade items" },
];

export function PracticeLevelTabs({ active }: { active?: PracticeLevel }) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {levels.map((level) => (
        <Link
          key={level.label}
          href={level.href}
          className={cn(
            "rounded-xl border p-4 transition-all",
            active === level.label
              ? "border-cyan-400/35 bg-cyan-400/[0.08] shadow-cyan"
              : "border-white/8 bg-white/[0.025] hover:border-cyan-400/25 hover:bg-white/[0.045]",
          )}
        >
          <p className="text-sm font-semibold text-white">{level.label}</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">{level.detail}</p>
        </Link>
      ))}
    </div>
  );
}
