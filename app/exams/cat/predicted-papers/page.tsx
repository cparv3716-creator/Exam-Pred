import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { CatPredictedPapersExperience } from "@/components/content/CatPredictedPapersExperience";
import { getCatDownloads, getCatPredictedPapers } from "@/lib/content/cat";
import { legalDisclaimer } from "@/lib/utils";

export const metadata: Metadata = {
  title: "CAT Predicted Papers",
  description: "Role-gated CAT predicted practice papers loaded from local ExamIQ content files.",
};

export default function CatPredictedPapersPage() {
  const papers = getCatPredictedPapers();
  const downloads = getCatDownloads();

  return (
    <PageShell withGrid>
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="CAT predicted papers"
          title="Pattern-based CAT practice portfolio"
          description="Real local CAT pipeline data is loaded from content/cat/predicted-papers and public/downloads/cat. Guest users see locked previews, free users see basic summaries, and premium/admin users unlock all papers, PDFs, detailed solutions and evidence lineage."
        />
        <p className="mt-6 rounded-xl border border-amber-400/20 bg-amber-400/[0.06] p-4 text-sm leading-relaxed text-amber-100/90">
          {legalDisclaimer}
        </p>
        <div className="mt-10">
          <CatPredictedPapersExperience papers={papers} downloads={downloads} />
        </div>
      </section>
    </PageShell>
  );
}
