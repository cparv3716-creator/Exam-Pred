import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FileCode2, FileDown, FileText, Library, ShieldCheck } from "lucide-react";
import { IsiPageShell } from "@/components/isi/IsiPageShell";
import { IsiPageHeader } from "@/components/isi/IsiUi";
import { IsiPyqPracticeSetCard } from "@/components/isi/IsiPyqPracticeSetCard";
import { getIsiMsqePyqPracticeSets } from "@/lib/content/isi/pyqPractice";
import { getIsiMsqePyqResourcesByPaper } from "@/lib/content/isi/pyq-resources";
import { getIsiMsqeSolutions } from "@/lib/content/isi/solutions";
import type { IsiMsqePyqResource } from "@/types/isi";

export const metadata: Metadata = {
  title: "MSQE PYQ Practice",
  description: "ISI MSQE PEA previous-year practice organized by Statstrive.",
};

export default function MsqePyqPage() {
  const practiceSets = getIsiMsqePyqPracticeSets().filter((set) => set.paper === "PEA");
  const peaResources = getIsiMsqePyqResourcesByPaper("PEA");
  const solutionCount = getIsiMsqeSolutions().length;

  return (
    <IsiPageShell>
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <IsiPageHeader
          eyebrow="MSQE / PEA PYQ Practice"
          title="Previous-year practice, organized by Statstrive."
          description="Previous-year questions are organized for practice and revision. Statstrive does not host third-party archive bundles. Statstrive is not affiliated with ISI or any official examination body."
          chips={["PEA practice live", "2022-2026", "Generated booklets", "No archive bundles"]}
        />

        <Link href="/exams/isi/msqe/solutions" className="aurora-glass aurora-card-hover aurora-focus-ring mt-8 flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl text-white" style={{ background: "linear-gradient(135deg, var(--aurora-primary), var(--aurora-violet))" }}>
            <Library size={20} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-lg font-bold">Solutions Vault</span>
            <span className="mt-1 block text-sm leading-6" style={{ color: "var(--aurora-text-secondary)" }}>
              Statstrive-created solution booklets and LaTeX sources, separate from third-party archive bundles.
            </span>
          </span>
          <span className="inline-flex items-center gap-2 text-sm font-bold" style={{ color: "var(--aurora-primary)" }}>
            {solutionCount} booklets <ArrowRight size={15} />
          </span>
        </Link>

        <section className="mt-12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight">PEA year-wise practice</h2>
              <p className="mt-2 text-sm leading-6" style={{ color: "var(--aurora-text-secondary)" }}>
                Start a year set, solve question by question, and use the Statstrive-generated question-only booklet if you prefer a PDF pass.
              </p>
            </div>
            <span className="aurora-badge">{practiceSets.length} years</span>
          </div>
          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {practiceSets.map((set) => <IsiPyqPracticeSetCard key={`${set.paper}-${set.year}`} set={set} />)}
          </div>
        </section>

        <ResourceSection title="Generated PEA booklet downloads" resources={peaResources} emptyMessage="No Statstrive-generated PEA booklets are available." />

        <div className="mt-10 rounded-3xl border bg-white/65 p-6" style={{ borderColor: "var(--aurora-border-soft)" }}>
          <div className="flex items-start gap-4">
            <ShieldCheck size={20} style={{ color: "var(--aurora-success)" }} />
            <div>
              <h2 className="font-bold">PEA practice bank is active</h2>
              <p className="mt-2 text-sm leading-7" style={{ color: "var(--aurora-text-secondary)" }}>
                The active PEA bank is generated from Statstrive-processed solution TeX. Items with missing option blocks, unclear answer keys, or non-verified source status remain marked needsReview rather than being silently compressed.
              </p>
            </div>
          </div>
        </div>
      </section>
    </IsiPageShell>
  );
}

function ResourceSection({ title, resources, emptyMessage }: { title: string; resources: IsiMsqePyqResource[]; emptyMessage: string }) {
  return (
    <section className="mt-12">
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-2xl font-extrabold tracking-tight">{title}</h2>
        <span className="aurora-badge">{resources.length} resources</span>
      </div>
      {resources.length ? (
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {resources.map((resource) => <ResourceCard key={`${resource.paper}-${resource.year}-${resource.resourceType}`} resource={resource} />)}
        </div>
      ) : (
        <div className="mt-6 rounded-3xl border border-dashed bg-white/55 p-8 text-center text-sm font-semibold" style={{ borderColor: "var(--aurora-border-strong)", color: "var(--aurora-text-muted)" }}>
          {emptyMessage}
        </div>
      )}
    </section>
  );
}

function ResourceCard({ resource }: { resource: IsiMsqePyqResource }) {
  return (
    <article className="aurora-glass aurora-card-hover flex flex-col p-6">
      <div className="flex items-center justify-between gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-xl" style={{ background: "var(--aurora-background-soft)", color: "var(--aurora-primary)" }}>
          <FileText size={19} />
        </span>
        <span className="aurora-badge">{resource.status}</span>
      </div>
      <p className="mt-5 text-xs font-bold uppercase tracking-[0.15em]" style={{ color: "var(--aurora-primary)" }}>
        {resource.year} / {resource.paper}
      </p>
      <h3 className="mt-2 text-lg font-bold leading-7">{resource.title}</h3>
      {resource.note && <p className="mt-3 flex-1 text-sm leading-6" style={{ color: "var(--aurora-text-secondary)" }}>{resource.note}</p>}
      <div className="mt-6 flex flex-wrap gap-3">
        {resource.pdfPath && <a href={resource.pdfPath} target="_blank" rel="noreferrer" className="aurora-button-primary aurora-focus-ring px-4 text-sm"><FileDown size={15} /> PDF</a>}
        {resource.texPath && <a href={resource.texPath} download className="aurora-button-secondary aurora-focus-ring px-4 text-sm"><FileCode2 size={15} /> TeX</a>}
      </div>
    </article>
  );
}
