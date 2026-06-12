import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Archive, FileCode2, FileDown, FileText, Library, ShieldCheck } from "lucide-react";
import { IsiPageShell } from "@/components/isi/IsiPageShell";
import { IsiPageHeader } from "@/components/isi/IsiUi";
import { getIsiMsqePyqResourcesByPaper } from "@/lib/content/isi/pyq-resources";
import { getIsiMsqeSolutions } from "@/lib/content/isi/solutions";
import type { IsiMsqePyqResource } from "@/types/isi";

export const metadata: Metadata = { title: "MSQE PYQ Vault", description: "Real local ISI MSQE question-paper resources and solution booklets." };

export default function MsqePyqPage() {
  const peaResources = getIsiMsqePyqResourcesByPaper("PEA");
  const pebResources = getIsiMsqePyqResourcesByPaper("PEB");
  const solutionCount = getIsiMsqeSolutions().length;

  return (
    <IsiPageShell>
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <IsiPageHeader eyebrow="MSQE / Real PYQ resources" title="Question papers and source archives." description="Downloadable MSQE source papers are indexed separately from the development practice preview. Historical compilations remain labeled as archives, and the 2026 source remains labeled as a combined PEA/PEB paper." chips={["Real local files", "No OCR", "No question rewriting", "Manifest checked"]} />

        <Link href="/exams/isi/msqe/solutions" className="aurora-glass aurora-card-hover aurora-focus-ring mt-8 flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl text-white" style={{ background: "linear-gradient(135deg, var(--aurora-primary), var(--aurora-violet))" }}><Library size={20} /></span>
          <span className="min-w-0 flex-1"><span className="block text-lg font-bold">PYQ Solutions Vault</span><span className="mt-1 block text-sm leading-6" style={{ color: "var(--aurora-text-secondary)" }}>Year-wise ISI MSQE PEA/PEB solution booklets in PDF and LaTeX format.</span></span>
          <span className="inline-flex items-center gap-2 text-sm font-bold" style={{ color: "var(--aurora-primary)" }}>{solutionCount} booklets <ArrowRight size={15} /></span>
        </Link>

        <ResourceSection title="PEA question-paper resources" resources={peaResources} emptyMessage="No PEA source files are available." />
        <ResourceSection title="PEB question-paper resources" resources={pebResources} emptyMessage="No PEB source files are available." />

        <div className="mt-10 rounded-3xl border bg-white/65 p-6" style={{ borderColor: "var(--aurora-border-soft)" }}>
          <div className="flex items-start gap-4"><ShieldCheck size={20} style={{ color: "var(--aurora-success)" }} /><div><h2 className="font-bold">Structured question banks detected, not imported yet</h2><p className="mt-2 text-sm leading-7" style={{ color: "var(--aurora-text-secondary)" }}>The local source root contains PEA, PEB, and combined extracted CSV banks plus year-partitioned text. They remain outside the active practice bank until a later schema-validation and question-integrity pass.</p></div></div>
        </div>
      </section>
    </IsiPageShell>
  );
}

function ResourceSection({ title, resources, emptyMessage }: { title: string; resources: IsiMsqePyqResource[]; emptyMessage: string }) {
  return <section className="mt-12"><div className="flex items-end justify-between gap-4"><h2 className="text-2xl font-extrabold tracking-tight">{title}</h2><span className="aurora-badge">{resources.length} resources</span></div>{resources.length ? <div className="mt-6 grid gap-5 md:grid-cols-2">{resources.map((resource) => <ResourceCard key={`${resource.paper}-${resource.year ?? "archive"}-${resource.resourceType}`} resource={resource} />)}</div> : <div className="mt-6 rounded-3xl border border-dashed bg-white/55 p-8 text-center text-sm font-semibold" style={{ borderColor: "var(--aurora-border-strong)", color: "var(--aurora-text-muted)" }}>{emptyMessage}</div>}</section>;
}

function ResourceCard({ resource }: { resource: IsiMsqePyqResource }) {
  const isArchive = resource.resourceType === "question_paper_archive";
  return <article className="aurora-glass aurora-card-hover flex flex-col p-6"><div className="flex items-center justify-between gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl" style={{ background: "var(--aurora-background-soft)", color: "var(--aurora-primary)" }}>{isArchive ? <Archive size={19} /> : <FileText size={19} />}</span><span className="aurora-badge">{resource.status}</span></div><p className="mt-5 text-xs font-bold uppercase tracking-[0.15em]" style={{ color: "var(--aurora-primary)" }}>{resource.year ?? "Historical archive"} / {resource.paper}</p><h3 className="mt-2 text-lg font-bold leading-7">{resource.title}</h3>{resource.note && <p className="mt-3 flex-1 text-sm leading-6" style={{ color: "var(--aurora-text-secondary)" }}>{resource.note}</p>}<div className="mt-6 flex flex-wrap gap-3">{resource.pdfPath && <a href={resource.pdfPath} target="_blank" rel="noreferrer" className="aurora-button-primary aurora-focus-ring px-4 text-sm"><FileDown size={15} /> PDF</a>}{resource.textPath && <a href={resource.textPath} target="_blank" rel="noreferrer" className="aurora-button-secondary aurora-focus-ring px-4 text-sm"><FileText size={15} /> Text</a>}{resource.texPath && <a href={resource.texPath} download className="aurora-button-secondary aurora-focus-ring px-4 text-sm"><FileCode2 size={15} /> TeX</a>}</div></article>;
}
