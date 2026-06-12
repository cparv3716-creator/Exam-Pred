import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, FileCode2, FileDown, LockKeyhole } from "lucide-react";
import { IsiPageShell } from "@/components/isi/IsiPageShell";
import { IsiPageHeader, IsiStat } from "@/components/isi/IsiUi";
import { getIsiMsqePeaPyqYears, getIsiMsqePyqPracticeSet, getIsiMsqePyqQuestions } from "@/lib/content/isi/pyqPractice";

export function generateStaticParams() { return getIsiMsqePeaPyqYears().map((year) => ({ year: String(year) })); }
export async function generateMetadata({ params }: { params: Promise<{ year: string }> }): Promise<Metadata> { const { year } = await params; return { title: `ISI MSQE PEA ${year} PYQ Practice Set` }; }

export default async function IsiMsqePeaYearPage({ params }: { params: Promise<{ year: string }> }) {
  const { year: yearParam } = await params;
  const year = Number(yearParam);
  const set = getIsiMsqePyqPracticeSet("PEA", year);
  const questions = getIsiMsqePyqQuestions("PEA", year);
  if (!set) notFound();
  const first = questions[0];
  return <IsiPageShell><section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20"><div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]"><IsiPageHeader eyebrow="MSQE / PEA Practice Set" title={set.title} description="Solve this previous-year PEA set question by question. Solutions stay inside the practice viewer; downloads are question-only Statstrive practice booklets." chips={["Free login tier", `${set.questionCount} questions`, "Solutions in app"]} /><aside className="aurora-surface rounded-3xl p-5"><div className="grid grid-cols-2 gap-3"><IsiStat label="Year" value={String(set.year)} /><IsiStat label="Paper" value={set.paper} /><IsiStat label="Questions" value={String(set.questionCount)} /><IsiStat label="Review" value={String(set.needsReviewCount)} note="flagged items" /></div></aside></div><div className="mt-8 flex flex-wrap gap-3">{first && <Link href={`/exams/isi/msqe/pyqs/pea/${year}/practice/${first.id}`} className="aurora-button-primary aurora-focus-ring px-5 text-sm">Start Practice <ArrowRight size={15} /></Link>}{set.questionPdfPath && <a href={set.questionPdfPath} target="_blank" rel="noreferrer" className="aurora-button-secondary aurora-focus-ring px-5 text-sm"><FileDown size={15} /> Download Question PDF</a>}{set.questionTexPath && <a href={set.questionTexPath} download className="aurora-button-secondary aurora-focus-ring px-5 text-sm"><FileCode2 size={15} /> Download Question TeX</a>}<span className="aurora-badge px-4 py-2"><LockKeyhole size={13} /> Free login tier</span></div><p className="mt-5 text-sm leading-7" style={{ color: "var(--aurora-text-secondary)" }}>{set.sourceNote}</p><section className="mt-10"><h2 className="text-2xl font-extrabold">Question list</h2><div className="mt-5 grid gap-3">{questions.map((question) => <Link key={question.id} href={`/exams/isi/msqe/pyqs/pea/${year}/practice/${question.id}`} className="aurora-glass aurora-card-hover aurora-focus-ring flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"><span><span className="font-bold">Question {question.questionNumber}</span><span className="mt-1 block text-sm" style={{ color: "var(--aurora-text-secondary)" }}>{question.topic} / {question.concept}</span></span><span className="flex flex-wrap gap-2"><span className="aurora-badge">{question.difficulty}</span>{question.needsReview && <span className="aurora-badge">Under review</span>}</span></Link>)}</div></section></section></IsiPageShell>;
}
