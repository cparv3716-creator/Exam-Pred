import Link from "next/link";
import { ArrowRight, CircleAlert, FileCode2, FileDown, LockKeyhole } from "lucide-react";
import type { IsiMsqePyqPracticeSet } from "@/types/isi";

export function IsiPyqPracticeSetCard({ set }: { set: IsiMsqePyqPracticeSet }) {
  return (
    <article className="aurora-glass aurora-card-hover flex flex-col p-6">
      <div className="flex items-center justify-between gap-3"><span className="text-3xl font-extrabold">{set.year}</span><span className="aurora-badge"><LockKeyhole size={12} /> Free login tier</span></div>
      <h2 className="mt-4 text-xl font-bold tracking-tight">{set.title}</h2>
      <p className="mt-2 text-sm leading-7" style={{ color: "var(--aurora-text-secondary)" }}>{set.sourceNote}</p>
      <div className="mt-5 grid grid-cols-2 gap-3 text-sm"><Metric label="Questions" value={String(set.questionCount)} /><Metric label="Solutions" value="In app" />{set.needsReviewCount > 0 && <Metric label="Review" value={`${set.needsReviewCount} flagged`} />}</div>
      <div className="mt-6 flex flex-wrap gap-3"><Link href={`/exams/isi/msqe/pyqs/pea/${set.year}`} className="aurora-button-primary aurora-focus-ring px-4 text-sm">Start Set <ArrowRight size={15} /></Link>{set.questionPdfPath && <a href={set.questionPdfPath} target="_blank" rel="noreferrer" className="aurora-button-secondary aurora-focus-ring px-4 text-sm"><FileDown size={15} /> Question PDF</a>}{set.questionTexPath && <a href={set.questionTexPath} download className="aurora-button-secondary aurora-focus-ring px-4 text-sm"><FileCode2 size={15} /> TeX</a>}</div>
      {set.importWarnings.length > 0 && <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-amber-800"><CircleAlert size={14} className="mt-0.5 shrink-0" /> {set.importWarnings[0]}</p>}
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl border bg-white/60 p-3" style={{ borderColor: "var(--aurora-border-soft)" }}><p className="text-[0.68rem] font-bold uppercase tracking-[0.13em]" style={{ color: "var(--aurora-text-muted)" }}>{label}</p><p className="mt-1 font-bold">{value}</p></div>; }

