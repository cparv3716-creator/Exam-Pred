import Link from "next/link";
import { ArrowLeft, ArrowRight, CircleAlert } from "lucide-react";
import type { IsiMsqePyqQuestion } from "@/types/isi";
import { IsiMathRenderer } from "@/components/isi/IsiMathRenderer";
import { IsiPyqAnswerChecker } from "@/components/isi/IsiPyqAnswerChecker";

type NavItem = { id: string; label: string; href: string } | null;

export function IsiPyqQuestionViewer({ question, previous, next }: { question: IsiMsqePyqQuestion; previous: NavItem; next: NavItem }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <Link href={`/exams/isi/msqe/pyqs/pea/${question.year}`} className="aurora-focus-ring inline-flex items-center gap-2 rounded-full border bg-white/75 px-4 py-2 text-sm font-semibold" style={{ borderColor: "var(--aurora-border-soft)", color: "var(--aurora-text-secondary)" }}><ArrowLeft size={14} /> Back to {question.year} set</Link>
      <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <main className="min-w-0 space-y-5">
          <section className="rounded-3xl border bg-white p-6 shadow-[0_22px_75px_rgba(15,23,42,0.07)] sm:p-8" style={{ borderColor: "var(--aurora-border-soft)" }}>
            <div className="flex flex-wrap items-center gap-2 border-b pb-5" style={{ borderColor: "var(--aurora-border-soft)" }}><span className="aurora-badge">PEA {question.year}</span><span className="aurora-badge">Question {question.questionNumber}</span><span className="aurora-badge">{question.questionType}</span><span className="aurora-badge">{question.difficulty}</span>{question.needsReview && <span className="aurora-badge"><CircleAlert size={12} /> Under review</span>}</div>
            {question.needsReview && <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900">This item is under review.</div>}
            <div className="mt-6"><IsiMathRenderer content={question.questionText} /></div>
            <IsiPyqAnswerChecker options={question.options} answer={question.answer} solution={question.solution} needsReview={question.needsReview} />
          </section>
          <nav className="grid gap-3 sm:grid-cols-2">{previous ? <Link href={previous.href} className="aurora-button-secondary aurora-focus-ring justify-start text-sm"><ArrowLeft size={15} /> {previous.label}</Link> : <span />}{next ? <Link href={next.href} className="aurora-button-primary aurora-focus-ring justify-end text-sm">{next.label} <ArrowRight size={15} /></Link> : <span />}</nav>
        </main>
        <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start"><div className="aurora-surface rounded-3xl p-5 shadow-[0_20px_70px_rgba(15,23,42,0.06)]"><p className="text-xs font-bold uppercase tracking-[0.17em]" style={{ color: "var(--aurora-cyan)" }}>Question intelligence</p><dl className="mt-5 space-y-4"><Meta label="Topic" value={question.topic} /><Meta label="Subtopic" value={question.subtopic} /><Meta label="Concept" value={question.concept} /><Meta label="Access" value="Free login tier" /><Meta label="Solution" value={question.solutionStatus} /></dl></div><div className="rounded-3xl border bg-white/70 p-5 text-sm leading-6" style={{ borderColor: "var(--aurora-border-soft)", color: "var(--aurora-text-secondary)" }}>Previous-year questions are organized for practice and revision. Solutions and formatting are prepared by Statstrive. Statstrive is not affiliated with ISI or any official examination body.</div></aside>
      </div>
    </div>
  );
}
function Meta({ label, value }: { label: string; value: string }) { return <div><dt className="text-[0.68rem] font-bold uppercase tracking-[0.13em]" style={{ color: "var(--aurora-text-muted)" }}>{label}</dt><dd className="mt-1 text-sm font-semibold leading-6">{value}</dd></div>; }
