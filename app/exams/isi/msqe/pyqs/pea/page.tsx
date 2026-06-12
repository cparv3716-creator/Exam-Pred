import type { Metadata } from "next";
import { BookOpenCheck, FileText } from "lucide-react";
import { IsiPageShell } from "@/components/isi/IsiPageShell";
import { IsiPageHeader } from "@/components/isi/IsiUi";
import { IsiPyqPracticeSetCard } from "@/components/isi/IsiPyqPracticeSetCard";
import { getIsiMsqePyqPracticeSets } from "@/lib/content/isi/pyqPractice";

export const metadata: Metadata = { title: "ISI MSQE PEA PYQ Practice", description: "Year-wise ISI MSQE PEA PYQ practice sets with in-app solutions." };

export default function IsiMsqePeaPyqPracticePage() {
  const sets = getIsiMsqePyqPracticeSets().filter((set) => set.paper === "PEA");
  return <IsiPageShell><section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20"><IsiPageHeader eyebrow="MSQE / PEA PYQ Practice" title="Year-wise PEA PYQ practice sets." description="Open a year, solve questions one by one, reveal Statstrive-prepared solutions inside the website, and download a question-only practice booklet." chips={["Free login tier", "Questions only PDFs", "Solutions in app", "No official affiliation claim"]} /><div className="mt-8 grid gap-4 sm:grid-cols-2"><div className="aurora-glass p-5"><BookOpenCheck size={20} style={{ color: "var(--aurora-primary)" }} /><h2 className="mt-4 font-bold">Student-first flow</h2><p className="mt-2 text-sm leading-6" style={{ color: "var(--aurora-text-secondary)" }}>The main CTA is practice, not source PDF downloads.</p></div><div className="aurora-glass p-5"><FileText size={20} style={{ color: "var(--aurora-violet)" }} /><h2 className="mt-4 font-bold">Question-only booklets</h2><p className="mt-2 text-sm leading-6" style={{ color: "var(--aurora-text-secondary)" }}>Generated Statstrive PDFs exclude solutions and final answers.</p></div></div><div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{sets.map((set) => <IsiPyqPracticeSetCard key={`${set.paper}-${set.year}`} set={set} />)}</div></section></IsiPageShell>;
}
