import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BarChart3, BookOpenCheck, BrainCircuit, FileCheck2, Layers3, Library, PenLine } from "lucide-react";
import { IsiPageShell } from "@/components/isi/IsiPageShell";
import { IsiLinkCard, IsiPageHeader, IsiStat } from "@/components/isi/IsiUi";
import { getMsqeManifest, getMsqeOverview } from "@/lib/content/isi/msqe";
import { getIsiMsqePyqResources } from "@/lib/content/isi/pyq-resources";
import { getIsiMsqeSolutions } from "@/lib/content/isi/solutions";

export const metadata: Metadata = { title: "ISI MSQE Intelligence Cockpit", description: "PEA, PEB, practice, real PYQ resources, solutions, and inference modules for ISI MSQE." };

export default function MsqeCockpitPage() {
  const overview = getMsqeOverview();
  const manifest = getMsqeManifest();
  const solutions = getIsiMsqeSolutions();
  const pyqResources = getIsiMsqePyqResources();

  return (
    <IsiPageShell>
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <IsiPageHeader eyebrow="ISI / MSQE" title="MSQE intelligence cockpit" description="A two-paper preparation system for objective recognition in PEA and descriptive construction in PEB, now connected to real local question-paper and solution resources." chips={["PEA objective", "PEB descriptive", "Real resource vault", "Inference-ready"]} />
          <aside className="aurora-surface rounded-3xl p-5 shadow-[0_22px_75px_rgba(15,23,42,0.07)]">
            <p className="text-xs font-bold uppercase tracking-[0.17em]" style={{ color: "var(--aurora-cyan)" }}>Content layers</p>
            <div className="mt-4 grid grid-cols-2 gap-3"><IsiStat label="Dev preview" value={String(overview.sampleQuestionCount)} note="review-marked questions" /><IsiStat label="Solutions" value={String(solutions.length)} note="real booklets" /><IsiStat label="PYQ resources" value={String(pyqResources.length)} note="source files" /><IsiStat label="Topics" value={String(overview.topicCount)} note="sample taxonomy" /></div>
            <p className="mt-4 text-xs leading-5" style={{ color: "var(--aurora-text-muted)" }}>{manifest.sourceInventory.note}</p>
          </aside>
        </div>

        <Link href="/exams/isi/msqe/solutions" className="aurora-glass aurora-card-hover aurora-focus-ring mt-10 flex flex-col gap-5 p-6 shadow-[0_24px_85px_rgba(14,165,233,0.1)] sm:flex-row sm:items-center">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-white" style={{ background: "linear-gradient(135deg, var(--aurora-primary), var(--aurora-violet))", boxShadow: "var(--aurora-glow-md)" }}><Library size={23} /></span>
          <span className="min-w-0 flex-1"><span className="block text-xs font-bold uppercase tracking-[0.16em]" style={{ color: "var(--aurora-primary)" }}>Real resource layer</span><span className="mt-2 block text-2xl font-extrabold">PYQ Solutions Vault</span><span className="mt-2 block text-sm leading-6" style={{ color: "var(--aurora-text-secondary)" }}>Year-wise ISI MSQE PEA/PEB solution booklets in PDF and LaTeX format.</span></span>
          <span className="inline-flex items-center gap-2 text-sm font-bold" style={{ color: "var(--aurora-primary)" }}>Open {solutions.length} booklets <ArrowRight size={15} /></span>
        </Link>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <IsiLinkCard icon={BookOpenCheck} title="PEA objective paper" description="Development preview for MCQ rendering, options, answers, and concept metadata." href="/exams/isi/msqe/pea" badge="Sample preview" />
          <IsiLinkCard icon={PenLine} title="PEB descriptive paper" description="Development preview for multipart responses, long solutions, and answer structure." href="/exams/isi/msqe/peb" badge="Sample preview" />
          <IsiLinkCard icon={Layers3} title="Practice library" description="Combined PEA and PEB development samples, clearly separated from real PYQ resources." href="/exams/isi/msqe/practice" badge={`${overview.sampleQuestionCount} dev items`} />
          <IsiLinkCard icon={FileCheck2} title="PYQ source vault" description="Real local question-paper sources and historical PEA/PEB archives." href="/exams/isi/msqe/pyqs" badge={`${pyqResources.length} resources`} />
          <IsiLinkCard icon={BrainCircuit} title="Inference intelligence" description="Topic frequency, archetypes, traps, difficulty shifts, and PEA/PEB comparison modules." href="/exams/isi/msqe/inference" badge="Modules ready" />
          <IsiLinkCard icon={BarChart3} title="Reports and taxonomy" description="Deep-tagged CSV banks and inference reports were detected for a later validated import pass." badge="827 structured rows detected" />
        </div>
      </section>
    </IsiPageShell>
  );
}

