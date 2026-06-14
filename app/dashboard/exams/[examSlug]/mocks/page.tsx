import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { MockPaperCard } from "@/components/dashboard/MockPaperCard";
import { exams, getExamBySlug } from "@/data/exams";
import { mockPapers } from "@/data/analytics";
import { getCatPredictedPapers } from "@/lib/content/cat";
import { requireActiveExamSubscription } from "@/lib/backend/access";
import { getPaymentExamIdForSlug } from "@/lib/payments/plans";

type Params = Promise<{ examSlug: string }>;

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return exams.map((exam) => ({ examSlug: exam.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { examSlug } = await params;
  const exam = getExamBySlug(examSlug);
  return { title: exam ? `${exam.name} Mocks` : "Mocks" };
}

export default async function MocksPage({ params }: { params: Params }) {
  const { examSlug } = await params;
  const exam = getExamBySlug(examSlug);
  if (!exam) notFound();
  const paymentExamId = getPaymentExamIdForSlug(exam.slug);
  if (paymentExamId) {
    await requireActiveExamSubscription(
      paymentExamId,
      `/dashboard/exams/${exam.slug}/mocks`,
    );
  }
  const catPapers = exam.slug === "cat" ? getCatPredictedPapers() : [];

  return (
    <DashboardShell title={`${exam.name} mocks`} subtitle="Trend-weighted mock paper demo cards." activeHref="/dashboard/exams">
      {catPapers.length > 0 && (
          <div className="mb-8 grid gap-5 md:grid-cols-2">
            {catPapers.map((paper) => (
              <div key={paper.id} className="rounded-xl border border-white/8 bg-white/[0.025] p-5">
                <h3 className="text-base font-semibold text-white">{paper.title}</h3>
                <p className="mt-2 text-sm text-slate-500">{paper.strategy}</p>
                <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-slate-400">
                  <span>{paper.questionCount} questions</span>
                  <span>{paper.expectedOverlap?.toFixed(3) ?? "N/A"} overlap</span>
                  <span>{paper.riskScore?.toFixed(2) ?? "N/A"} risk</span>
                </div>
              </div>
            ))}
          </div>
      )}
      <div className="grid gap-5 md:grid-cols-3">
          {mockPapers.map((mock) => (
            <MockPaperCard key={mock.id} mock={mock} />
          ))}
      </div>
    </DashboardShell>
  );
}
