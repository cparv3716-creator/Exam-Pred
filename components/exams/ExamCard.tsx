import Link from "next/link";
import { ArrowUpRight, Calendar, FileText, Layers } from "lucide-react";
import type { Exam } from "@/types/examiq";
import { OutlinePill } from "@/components/ui/Badge";

export function ExamCard({ exam, href }: { exam: Exam; href?: string }) {
  return (
    <Link
      href={href ?? `/exams/${exam.slug}`}
      className="group relative flex min-h-[270px] flex-col overflow-hidden rounded-xl border border-white/8 bg-white/[0.025] p-6 transition-all duration-200 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.045]"
    >
      <div
        className="absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-20 blur-2xl transition-opacity duration-300 group-hover:opacity-45"
        style={{ background: exam.accent }}
      />
      <div className="relative flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold text-white"
            style={{
              background: `linear-gradient(135deg, ${exam.accent}, ${exam.accent}66)`,
              boxShadow: `0 0 34px -16px ${exam.accent}`,
            }}
          >
            {exam.name.charAt(0)}
          </div>
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-white">{exam.name}</h3>
            <p className="text-xs font-medium text-slate-500">{exam.category}</p>
          </div>
        </div>
        <ArrowUpRight
          size={20}
          className="text-slate-600 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white"
        />
      </div>
      <p className="relative mt-4 line-clamp-3 text-sm leading-relaxed text-slate-400">
        {exam.description}
      </p>
      <div className="relative mt-4 flex flex-wrap gap-2">
        {exam.sections.slice(0, 3).map((section) => (
          <OutlinePill key={section.code}>{section.code}</OutlinePill>
        ))}
        <OutlinePill className="border-purple-400/20 bg-purple-400/10 text-purple-200">
          Premium analytics
        </OutlinePill>
      </div>
      <div className="relative mt-auto grid grid-cols-3 gap-2 border-t border-white/5 pt-4">
        <ExamStat icon={FileText} label="PYQs" value={exam.pyqCount.toLocaleString()} />
        <ExamStat icon={Layers} label="Topics" value={String(exam.topicCount)} />
        <ExamStat icon={Calendar} label="Years" value={exam.yearsCovered.split("-").pop() ?? exam.yearsCovered} />
      </div>
    </Link>
  );
}

function ExamStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof FileText;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-1 text-slate-500">
        <Icon size={12} />
        <span className="text-[10px] uppercase tracking-wide">{label}</span>
      </div>
      <span className="mt-0.5 text-sm font-semibold text-white">{value}</span>
    </div>
  );
}
