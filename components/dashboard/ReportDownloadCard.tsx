import { Download, FileBarChart, Lock } from "lucide-react";
import type { Report } from "@/types/examiq";

export function ReportDownloadCard({
  report,
  locked = false,
}: {
  report: Report;
  locked?: boolean;
}) {
  return (
    <div className="relative rounded-xl border border-white/8 bg-white/[0.025] p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
          <FileBarChart size={18} />
        </div>
        <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] font-semibold text-slate-400">
          {report.format}
        </span>
      </div>
      <h3 className="mt-5 text-base font-semibold text-white">{report.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">{report.description}</p>
      <button
        type="button"
        className="mt-5 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-200 hover:border-cyan-400/30"
      >
        {locked ? <Lock size={15} /> : <Download size={15} />}
        {locked ? "Locked" : "Download demo"}
      </button>
    </div>
  );
}
