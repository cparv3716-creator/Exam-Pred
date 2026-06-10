import { Clock, FileText, FlaskConical } from "lucide-react";
import type { MockPaper } from "@/types/examiq";
import { OutlinePill } from "@/components/ui/Badge";

export function MockPaperCard({ mock }: { mock: MockPaper }) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.025] p-5 transition-colors hover:border-purple-400/25">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-purple-400/25 bg-purple-400/10 text-purple-200">
          <FlaskConical size={18} />
        </div>
        <OutlinePill>{mock.difficulty}</OutlinePill>
      </div>
      <h3 className="mt-5 text-base font-semibold text-white">{mock.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">{mock.spec}</p>
      <div className="mt-5 flex flex-wrap gap-2 text-xs text-slate-400">
        <span className="inline-flex items-center gap-1 rounded-lg border border-white/8 bg-white/[0.03] px-2.5 py-1.5">
          <FileText size={13} /> {mock.questions} questions
        </span>
        <span className="inline-flex items-center gap-1 rounded-lg border border-white/8 bg-white/[0.03] px-2.5 py-1.5">
          <Clock size={13} /> {mock.duration}
        </span>
      </div>
    </div>
  );
}
