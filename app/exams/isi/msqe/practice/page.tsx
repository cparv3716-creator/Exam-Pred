import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpenCheck, BrainCircuit, Layers3, PenLine, Tags } from "lucide-react";
import { IsiPageShell } from "@/components/isi/IsiPageShell";
import { IsiPageHeader } from "@/components/isi/IsiUi";
import { MsqeQuestionCard } from "@/components/isi/MsqeQuestionCard";
import { getMsqeAllQuestions, getMsqePracticeSets } from "@/lib/content/isi/msqe";

export const metadata: Metadata = { title: "MSQE Practice Library", description: "Combined PEA and PEB practice library for ISI MSQE." };

const modes = [
  { icon: BookOpenCheck, title: "PEA Objective Practice", description: "Options, answer selection, and compact concept recognition.", href: "/exams/isi/msqe/pea" },
  { icon: PenLine, title: "PEB Descriptive Practice", description: "Long-form derivation, explanation, and answer structure.", href: "/exams/isi/msqe/peb" },
  { icon: Layers3, title: "PYQ-based Practice", description: "Ready to connect after verified structured PYQs are uploaded.", href: "/exams/isi/msqe/pyqs" },
  { icon: BrainCircuit, title: "Inference-led Practice", description: "Practice selection by archetype, trap, concept, and difficulty module.", href: "/exams/isi/msqe/inference" },
  { icon: Tags, title: "Topic-wise Practice", description: "Current development samples span mathematics, statistics, micro, and macro.", href: "#sample-questions" },
];

export default function MsqePracticePage() {
  const questions = getMsqeAllQuestions();
  const sets = getMsqePracticeSets();
  return <IsiPageShell><section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20"><IsiPageHeader eyebrow="MSQE / Practice" title="Objective speed. Descriptive depth." description="A combined practice library designed around the distinct demands of PEA and PEB. Phase 1 uses clearly labeled development samples until verified structured banks are uploaded." chips={sets.map((set) => `${set.title}: ${set.questionIds.length}`)} /><div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{modes.map(({ icon: Icon, title, description, href }) => <Link key={title} href={href} className="aurora-glass aurora-card-hover aurora-focus-ring flex flex-col p-5"><span className="grid h-10 w-10 place-items-center rounded-xl text-white" style={{ background: "linear-gradient(135deg, var(--aurora-primary), var(--aurora-violet))" }}><Icon size={17} /></span><h2 className="mt-4 text-base font-bold">{title}</h2><p className="mt-2 flex-1 text-xs leading-6" style={{ color: "var(--aurora-text-secondary)" }}>{description}</p><span className="mt-4 inline-flex items-center gap-1 text-xs font-bold" style={{ color: "var(--aurora-primary)" }}>Open <ArrowRight size={13} /></span></Link>)}</div><div id="sample-questions" className="mt-12 flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.17em]" style={{ color: "var(--aurora-primary)" }}>Safe sample rendering</p><h2 className="mt-2 text-2xl font-extrabold">Development question bank</h2></div><span className="aurora-badge">{questions.length} sample items</span></div><div className="mt-6 grid gap-5 md:grid-cols-2">{questions.map((question) => <MsqeQuestionCard key={question.id} question={question} />)}</div></section></IsiPageShell>;
}
