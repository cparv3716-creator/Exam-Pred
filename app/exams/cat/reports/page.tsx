import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { MarkdownCard } from "@/components/content/MarkdownRenderer";
import { CatDownloadsExperience } from "@/components/content/CatDownloadsExperience";
import { getCatDownloads, getCatFinalRecommendation, getCatPipelineSummary } from "@/lib/content/cat";

export const metadata: Metadata = {
  title: "CAT Reports and Downloads",
  description: "CAT report PDFs and pipeline markdown summaries loaded from local content.",
};

export default function CatReportsPage() {
  const downloads = getCatDownloads();
  const recommendation = getCatFinalRecommendation();
  const pipeline = getCatPipelineSummary();

  return (
    <PageShell withGrid>
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="CAT reports"
          title="Downloads and pipeline summaries"
          description="Real local CAT pipeline data: PDFs are served from public/downloads/cat and markdown summaries are rendered from content/cat/reports."
        />
        <div className="mt-10">
          <CatDownloadsExperience downloads={downloads} />
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <MarkdownCard title="Final recommendation summary" markdown={recommendation.report.body} />
          <MarkdownCard title="Full pipeline summary" markdown={pipeline.body} />
        </div>
      </section>
    </PageShell>
  );
}
