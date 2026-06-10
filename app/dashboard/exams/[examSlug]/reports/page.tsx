import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PremiumGuard } from "@/components/ui/PremiumGuard";
import { ReportDownloadCard } from "@/components/dashboard/ReportDownloadCard";
import { exams, getExamBySlug } from "@/data/exams";
import { reports } from "@/data/analytics";
import { CatDownloadsExperience } from "@/components/content/CatDownloadsExperience";
import { MarkdownCard } from "@/components/content/MarkdownRenderer";
import { getCatDownloads, getCatFinalRecommendation, getCatPipelineSummary } from "@/lib/content/cat";

type Params = Promise<{ examSlug: string }>;

export function generateStaticParams() {
  return exams.map((exam) => ({ examSlug: exam.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { examSlug } = await params;
  const exam = getExamBySlug(examSlug);
  return { title: exam ? `${exam.name} Reports` : "Reports" };
}

export default async function ReportsPage({ params }: { params: Params }) {
  const { examSlug } = await params;
  const exam = getExamBySlug(examSlug);
  if (!exam) notFound();
  const isCat = exam.slug === "cat";
  const catDownloads = isCat ? getCatDownloads() : [];
  const catRecommendation = isCat ? getCatFinalRecommendation() : null;
  const catPipeline = isCat ? getCatPipelineSummary() : null;

  return (
    <DashboardShell title={`${exam.name} reports`} subtitle={isCat ? "Real local CAT pipeline reports with role-gated PDFs and markdown lineage." : "Free basic reports and premium analytics exports."} activeHref="/dashboard/exams">
      {isCat && catRecommendation && catPipeline && (
        <div className="mb-8 space-y-6">
          <CatDownloadsExperience downloads={catDownloads} />
          <div className="grid gap-6 lg:grid-cols-2">
            <MarkdownCard title="CAT final recommendation" markdown={catRecommendation.report.body} />
            <MarkdownCard title="CAT full pipeline summary" markdown={catPipeline.body} />
          </div>
        </div>
      )}
      <div className="grid gap-5 md:grid-cols-3">
        {reports.map((report) => (
          <ReportDownloadCard key={report.id} report={report} locked={report.tier === "premium"} />
        ))}
      </div>
      <div className="mt-8">
        <PremiumGuard title="Premium report generator locked" description="Unlock downloadable decks, CSV exports and probability briefs.">
          <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/[0.05] p-6 text-sm text-slate-300">
            Premium report generator placeholder ready for Phase 2 storage and rendering.
          </div>
        </PremiumGuard>
      </div>
    </DashboardShell>
  );
}
