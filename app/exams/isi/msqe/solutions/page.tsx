import type { Metadata } from "next";
import { BookOpenCheck, FileCode2, FileDown, Library, ShieldCheck } from "lucide-react";
import { IsiPageShell } from "@/components/isi/IsiPageShell";
import { IsiPageHeader } from "@/components/isi/IsiUi";
import { getIsiMsqeSolutionsByPaper } from "@/lib/content/isi/solutions";
import type { IsiMsqeSolutionResource } from "@/types/isi";

export const metadata: Metadata = {
  title: "ISI MSQE PYQ Solutions Vault",
  description: "Year-wise Statstrive-created ISI MSQE solution booklets in PDF and LaTeX format.",
};

export default function IsiMsqeSolutionsPage() {
  const peaSolutions = getIsiMsqeSolutionsByPaper("PEA");
  const pebSolutions = getIsiMsqeSolutionsByPaper("PEB");

  return (
    <IsiPageShell>
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <IsiPageHeader
            eyebrow="MSQE / Real resource layer"
            title="ISI MSQE PYQ Solutions Vault"
            description="Year-wise Statstrive-created solution booklets preserved in polished PDF and LaTeX source formats. Statstrive does not host third-party archive bundles and is not affiliated with ISI or any official examination body."
            chips={["PDF booklets", "LaTeX source", "Manifest-driven", "No OCR"]}
          />
          <aside className="aurora-surface rounded-3xl p-5 shadow-[0_22px_75px_rgba(15,23,42,0.07)]">
            <div className="flex items-start gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white" style={{ background: "linear-gradient(135deg, var(--aurora-primary), var(--aurora-violet))" }}><Library size={19} /></span>
              <div><p className="text-xs font-bold uppercase tracking-[0.15em]" style={{ color: "var(--aurora-cyan)" }}>Available booklets</p><p className="mt-2 text-4xl font-extrabold">{peaSolutions.length + pebSolutions.length}</p></div>
            </div>
            <p className="mt-4 text-sm leading-7" style={{ color: "var(--aurora-text-secondary)" }}>Buttons appear only for Statstrive-created public files present at build time.</p>
          </aside>
        </div>

        <SolutionSection title="PEA solution booklets" description="Objective-paper Statstrive solution content available as PDF and source LaTeX." resources={peaSolutions} />
        <SolutionSection title="PEB solution booklets" description="Descriptive-paper solution resources will appear here as they are added to the manifest." resources={pebSolutions} emptyMessage="No PEB solution booklets are available in the local source folder yet." />
      </section>
    </IsiPageShell>
  );
}

function SolutionSection({ title, description, resources, emptyMessage }: { title: string; description: string; resources: IsiMsqeSolutionResource[]; emptyMessage?: string }) {
  return (
    <section className="mt-12">
      <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-2xl font-extrabold tracking-tight">{title}</h2><p className="mt-2 text-sm leading-6" style={{ color: "var(--aurora-text-secondary)" }}>{description}</p></div><span className="aurora-badge">{resources.length} available</span></div>
      {resources.length ? <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{resources.map((resource) => <SolutionCard key={`${resource.paper}-${resource.year}`} resource={resource} />)}</div> : <div className="mt-6 rounded-3xl border border-dashed bg-white/55 p-8 text-center" style={{ borderColor: "var(--aurora-border-strong)" }}><BookOpenCheck className="mx-auto" size={25} style={{ color: "var(--aurora-text-muted)" }} /><p className="mt-4 text-sm font-semibold" style={{ color: "var(--aurora-text-secondary)" }}>{emptyMessage}</p></div>}
    </section>
  );
}

function SolutionCard({ resource }: { resource: IsiMsqeSolutionResource }) {
  return (
    <article className="aurora-glass aurora-card-hover flex flex-col p-6">
      <div className="flex items-center justify-between gap-3"><span className="text-3xl font-extrabold">{resource.year}</span><span className="aurora-badge"><ShieldCheck size={12} /> {resource.status}</span></div>
      <p className="mt-4 text-xs font-bold uppercase tracking-[0.15em]" style={{ color: "var(--aurora-primary)" }}>{resource.paper}</p>
      <h3 className="mt-2 text-lg font-bold leading-7">{resource.title}</h3>
      {resource.questionCount !== null && <p className="mt-2 text-sm" style={{ color: "var(--aurora-text-muted)" }}>{resource.questionCount} questions</p>}
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {resource.pdfPath && <a href={resource.pdfPath} target="_blank" rel="noreferrer" className="aurora-button-primary aurora-focus-ring text-sm"><FileDown size={15} /> PDF</a>}
        {resource.texPath && <a href={resource.texPath} download className="aurora-button-secondary aurora-focus-ring text-sm"><FileCode2 size={15} /> TeX source</a>}
      </div>
    </article>
  );
}
