import type { LucideIcon } from "lucide-react";
import { CheckCircle2, CircleDashed } from "lucide-react";

export function AdminActionCard({
  icon: Icon,
  title,
  description,
  status = "Ready",
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  status?: string;
}) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.025] p-5 transition-colors hover:border-emerald-400/25">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-400/20 bg-emerald-400/10 text-emerald-200">
          <Icon size={18} />
        </div>
        <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] font-semibold text-slate-400">
          {status}
        </span>
      </div>
      <h3 className="mt-5 text-base font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">{description}</p>
    </div>
  );
}

export function QualityChecklist({ items }: { items: string[] }) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.025] p-5">
      <h3 className="text-base font-semibold text-white">Quality checks</h3>
      <div className="mt-5 space-y-3">
        {items.map((item, index) => (
          <div key={item} className="flex items-start gap-3 rounded-lg border border-white/8 bg-white/[0.025] p-3">
            {index < 3 ? (
              <CheckCircle2 size={17} className="mt-0.5 text-emerald-300" />
            ) : (
              <CircleDashed size={17} className="mt-0.5 text-amber-300" />
            )}
            <span className="text-sm text-slate-400">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
