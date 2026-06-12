import Link from "next/link";
import { ArrowRight, BookOpenText, CircleAlert } from "lucide-react";
import type { IsiQuestion } from "@/types/isi";
import { IsiMathRenderer } from "@/components/isi/IsiMathRenderer";

export function MsqeQuestionCard({ question }: { question: IsiQuestion }) {
  return (
    <article className="aurora-surface aurora-card-hover flex flex-col rounded-3xl p-5 shadow-[0_20px_70px_rgba(15,23,42,0.06)] sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="aurora-badge" style={{ color: question.paper === "PEA" ? "var(--aurora-primary)" : "var(--aurora-violet)" }}>{question.paper}</span>
        <span className="aurora-badge">{question.questionType}</span>
        <span className="aurora-badge">{question.difficulty}</span>
        {question.needsReview && <span className="aurora-badge"><CircleAlert size={12} /> Needs review</span>}
      </div>
      <div className="mt-5"><IsiMathRenderer content={question.questionText} /></div>
      <dl className="mt-5 grid grid-cols-2 gap-3 text-sm"><Meta label="Topic" value={question.topic} /><Meta label="Concept" value={question.concept} /></dl>
      <Link href={`/exams/isi/msqe/practice/${question.id}`} className="aurora-focus-ring mt-6 inline-flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-bold" style={{ borderColor: "var(--aurora-border-soft)", color: "var(--aurora-primary)", background: "rgba(255,255,255,0.65)" }}>
        <span className="inline-flex items-center gap-2"><BookOpenText size={15} /> Open question</span><ArrowRight size={15} />
      </Link>
    </article>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border p-3" style={{ borderColor: "var(--aurora-border-soft)", background: "rgba(255,255,255,0.58)" }}><dt className="text-[0.68rem] font-bold uppercase tracking-[0.13em]" style={{ color: "var(--aurora-text-muted)" }}>{label}</dt><dd className="mt-1 font-semibold">{value}</dd></div>;
}
