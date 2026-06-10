import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getCatQuantLatexSourceQuestions, getCatQuantLatexSourceStats } from "@/lib/content/practice/cat-quant-latex-source";

export const metadata: Metadata = { title: "CAT Quant LaTeX Source Status" };

export default function LatexSourceStatusPage() {
  const stats = getCatQuantLatexSourceStats();
  const questions = getCatQuantLatexSourceQuestions();
  const warningRows = questions.filter((question) => question.parse_warnings.length).slice(0, 30);
  return (
    <PageShell withGrid>
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Admin diagnostic"
          title="CAT Quant LaTeX source bank status"
          description="Direct-bank counts from local .tex sources. This diagnostic does not read or mutate the old generated-practice JSON bank."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-4">
          <Metric label="TeX files found" value={stats.filesFound} />
          <Metric label="Questions parsed" value={stats.total} />
          <Metric label="Full parse" value={stats.fullParse} />
          <Metric label="Raw fallback" value={stats.rawFallback} />
          <Metric label="Beginner" value={stats.beginner} />
          <Metric label="Intermediate" value={stats.intermediate} />
          <Metric label="Advanced" value={stats.advanced} />
          <Metric label="Missing options" value={stats.missingOptions} />
          <Metric label="Missing solutions" value={stats.missingSolutions} />
        </div>
        <div className="mt-10 rounded-2xl border border-white/8 bg-white/[0.025] p-6">
          <h2 className="text-lg font-semibold text-white">Source files</h2>
          <div className="mt-4 grid gap-2 md:grid-cols-2">
            {stats.sourceFiles.map((file) => <p key={file} className="rounded-lg border border-white/8 bg-white/[0.02] px-3 py-2 text-xs text-slate-400">{file}</p>)}
          </div>
        </div>
        <div className="mt-10 rounded-2xl border border-white/8 bg-white/[0.025] p-6">
          <h2 className="text-lg font-semibold text-white">Rows with parse warnings</h2>
          <div className="mt-4 space-y-3">
            {warningRows.length ? warningRows.map((question) => (
              <div key={question.question_id} className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
                <p className="font-mono text-xs text-cyan-200">{question.question_id}</p>
                <p className="mt-1 text-xs text-slate-500">{question.source_tex_file} · Q{question.source_question_number}</p>
                <p className="mt-2 text-sm text-slate-400">{question.parse_warnings.join("; ")}</p>
              </div>
            )) : <p className="text-sm text-slate-500">No parse warnings.</p>}
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-5">
      <p className="text-3xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{label}</p>
    </div>
  );
}