import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Archive, BookOpenCheck, FileCode2, FileDown, FileText } from "lucide-react";
import { IsiPageShell } from "@/components/isi/IsiPageShell";
import { IsiPageHeader } from "@/components/isi/IsiUi";
import { IsiPyqPracticeSetCard } from "@/components/isi/IsiPyqPracticeSetCard";
import { getIsiMsqePyqResourcesByPaper } from "@/lib/content/isi/pyq-resources";
import { getIsiMsqePyqPracticeSets } from "@/lib/content/isi/pyqPractice";
import type { IsiMsqePyqResource } from "@/types/isi";

export const metadata: Metadata = { title: "MSQE PYQ Practice Vault", description: "Practice-first ISI MSQE PYQ vault with year-wise sets and question-only booklets." };

export default function MsqePyqPage() {
  const peaSets = getIsiMsqePyqPracticeSets().filter((set) => set.paper === "PEA");
  const peaResources = getIsiMsqePyqResourcesByPaper("PEA");
  const pebResources = getIsiMsqePyqResourcesByPaper("PEB");

  return <IsiPageShell><section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20"><IsiPageHeader eyebrow="MSQE / PYQ Practice" title="PYQs as practice sets, not file dumps." description="The main student experience is year-wise PEA practice with in-app solution reveal and Statstrive-branded question-only booklets. Original resource references remain available below for transparency." chips={["PEA practice live", "Free login tier", "Solutions in viewer", "Question-only PDFs"]} />
  <Link href="/exams/isi/msqe/pyqs/pea" className="aurora-glass aurora-card-hover aurora-focus-ring mt-8 flex flex-col gap-5 p-6 sm:flex-row sm:items-center"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl text-white" style={{ background: "linear-gradient(135deg, var(--aurora-primary), var(--aurora-violet))" }}><BookOpenCheck size={20} /></span><span className="min-w-0 flex-1"><span className="block text-lg font-bold">PEA PYQ Practice Sets</span><span className="mt-1 block text-sm leading-6" style={{ color: "var(--aurora-text-secondary)" }}>Open 2022-2026 year-wise sets, solve question by question, and reveal solutions inside Statstrive.</span></span><span className="inline-flex items-center gap-2 text-sm font-bold" style={{ color: "var(--aurora-primary)" }}>{peaSets.length} years <ArrowRight size={15} /></span></Link>
  <section className="mt-12"><div className="flex items-end justify-between gap-4"><h2 className="text-2xl font-extrabold tracking-tight">Latest PEA practice sets</h2><span className="aurora-badge">{peaSets.reduce((sum, set) => sum + set.questionCount, 0)} questions</span></div><div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{peaSets.slice(0, 5).map((set) => <IsiPyqPracticeSetCard key={`${set.paper}-${set.year}`} set={set} />)}</div></section>
  <section className="mt-12 rounded-3xl border bg-white/65 p-6" style={{ borderColor: "var(--aurora-border-soft)" }}><h2 className="text-xl font-extrabold">Original resource references</h2><p className="mt-2 text-sm leading-7" style={{ color: "var(--aurora-text-secondary)" }}>These remain secondary references. They are not the main student product experience.</p><div className="mt-5 grid gap-5 md:grid-cols-2">{[...peaResources, ...pebResources].map((resource) => <ResourceCard key={`${resource.paper}-${resource.year ?? "archive"}-${resource.resourceType}`} resource={resource} />)}</div></section>
  </section></IsiPageShell>;
}

function ResourceCard({ resource }: { resource: IsiMsqePyqResource }) { const isArchive = resource.resourceType === "question_paper_archive"; return <article className="aurora-glass p-5"><div className="flex items-center justify-between gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: "var(--aurora-background-soft)", color: "var(--aurora-primary)" }}>{isArchive ? <Archive size={18} /> : <FileText size={18} />}</span><span className="aurora-badge">{resource.status}</span></div><p className="mt-4 text-xs font-bold uppercase tracking-[0.15em]" style={{ color: "var(--aurora-primary)" }}>{resource.year ?? "Historical archive"} / {resource.paper}</p><h3 className="mt-2 font-bold leading-6">{resource.title}</h3><div className="mt-5 flex flex-wrap gap-3">{resource.pdfPath && <a href={resource.pdfPath} target="_blank" rel="noreferrer" className="aurora-button-secondary aurora-focus-ring px-4 text-sm"><FileDown size={15} /> Source PDF</a>}{resource.texPath && <a href={resource.texPath} download className="aurora-button-secondary aurora-focus-ring px-4 text-sm"><FileCode2 size={15} /> TeX</a>}</div></article>; }

