import Link from "next/link";
import { ArrowLeft, BookOpenCheck, CircleAlert, FileQuestion, Lightbulb, Tags } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { IsiSolutionSteps } from "@/components/isi/IsiSolutionSteps";
import { MsqeAnswerChecker } from "@/components/isi/MsqeAnswerChecker";
import type { IsiQuestion } from "@/types/isi";
import { IsiMathRenderer, RawLatexBlock } from "@/components/isi/IsiMathRenderer";

export function MsqeQuestionViewer({ question }: { question: IsiQuestion }) {
  const hasRenderableText = Boolean(question.questionText.trim());
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <Link href="/exams/isi/msqe/practice" className="aurora-focus-ring inline-flex items-center gap-2 rounded-full border bg-white/75 px-4 py-2 text-sm font-semibold" style={{ borderColor: "var(--aurora-border-soft)", color: "var(--aurora-text-secondary)" }}><ArrowLeft size={14} /> Back to MSQE practice</Link>
      <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <main className="min-w-0 space-y-5">
          <section className="rounded-3xl border bg-white p-6 shadow-[0_22px_75px_rgba(15,23,42,0.07)] sm:p-8" style={{ borderColor: "var(--aurora-border-soft)" }}>
            <div className="flex flex-wrap items-center gap-2 border-b pb-5" style={{ borderColor: "var(--aurora-border-soft)" }}>
              <span className="aurora-badge">{question.paper}</span><span className="aurora-badge">{question.questionType}</span><span className="aurora-badge">{question.difficulty}</span>
              {question.needsReview && <span className="aurora-badge"><CircleAlert size={12} /> Needs review</span>}
            </div>
            <p className="mt-6 text-xs font-bold uppercase tracking-[0.17em]" style={{ color: "var(--aurora-primary)" }}>{question.questionNumber}</p>
            <div className="mt-4">{hasRenderableText ? <IsiMathRenderer content={question.questionText} /> : question.questionLatex ? <RawLatexBlock content={question.questionLatex} /> : <p style={{ color: "var(--aurora-text-muted)" }}>Question text not uploaded yet.</p>}</div>
            <MsqeAnswerChecker options={question.options} answer={question.answer} needsReview={question.needsReview} />
          </section>
          <details className="rounded-3xl border bg-emerald-50/70 p-5 shadow-[0_18px_60px_rgba(16,185,129,0.08)] sm:p-6" style={{ borderColor: "color-mix(in srgb, var(--aurora-success) 30%, transparent)" }}>
            <summary className="cursor-pointer list-none text-sm font-bold uppercase tracking-[0.15em] text-emerald-800">Reveal answer and solution</summary>
            <div className="mt-5 space-y-5">{question.answer && <AnswerSection icon={BookOpenCheck} title="Answer" content={question.answer} />}{question.solution && <SolutionSection content={question.solution} />}{question.markingNotes && <AnswerSection icon={FileQuestion} title="Answer structure / marking notes" content={question.markingNotes} />}{question.explanation && <AnswerSection icon={Tags} title="Content note" content={question.explanation} />}</div>
          </details>
        </main>
        <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
          <div className="aurora-surface rounded-3xl p-5 shadow-[0_20px_70px_rgba(15,23,42,0.06)]"><p className="text-xs font-bold uppercase tracking-[0.17em]" style={{ color: "var(--aurora-cyan)" }}>Question intelligence</p><dl className="mt-5 space-y-4"><SideMeta label="Topic" value={question.topic} /><SideMeta label="Subtopic" value={question.subtopic} /><SideMeta label="Concept" value={question.concept} /><SideMeta label="Source mode" value={question.source} /></dl><div className="mt-5 flex flex-wrap gap-2">{question.tags.map((tag) => <span key={tag} className="aurora-badge">{tag}</span>)}</div></div>
          {question.needsReview && <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">This item is kept visible for continuity, but the available source is incomplete or not fully verified. Review the source before treating it as a final PYQ item.</div>}
        </aside>
      </div>
    </div>
  );
}

function AnswerSection({ icon: Icon, title, content }: { icon: LucideIcon; title: string; content: string }) {
  return <section className="rounded-2xl border bg-white/80 p-4" style={{ borderColor: "var(--aurora-border-soft)" }}><h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.13em] text-emerald-800"><Icon size={15} /> {title}</h2><IsiMathRenderer content={content} className="mt-3" /></section>;
}
function SolutionSection({ content }: { content: string }) {
  return <section className="rounded-2xl border bg-white/80 p-4" style={{ borderColor: "var(--aurora-border-soft)" }}><h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.13em] text-emerald-800"><Lightbulb size={15} /> Solution</h2><IsiSolutionSteps content={content} /></section>;
}
function SideMeta({ label, value }: { label: string; value: string }) { return <div><dt className="text-[0.68rem] font-bold uppercase tracking-[0.13em]" style={{ color: "var(--aurora-text-muted)" }}>{label}</dt><dd className="mt-1 text-sm font-semibold leading-6">{value}</dd></div>; }
