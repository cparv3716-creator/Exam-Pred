import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BarChart3, Crown, FileText, FlaskConical } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import {
  PremiumContentCard,
  type PremiumContentKind,
} from "@/components/dashboard/PremiumContentCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { CatRecommendationCard, CatStatsGrid } from "@/components/content/CatContentCards";
import { DashboardPracticePanel } from "@/components/practice/DashboardPracticePanel";
import { exams, getExamBySlug } from "@/data/exams";
import {
  getCatBacktestSummary,
  getCatCandidateScores,
  getCatDashboardStats,
  getCatDownloads,
  getCatFinalRecommendation,
  getCatPredictedPapers,
  getCatPredictionSpecs,
} from "@/lib/content/cat";
import { getCatQuantPracticeStats } from "@/lib/content/practice/cat-quant-practice";
import { isAdmin, requireUser } from "@/lib/backend/auth";
import { hasActiveExamSubscription } from "@/lib/backend/payments";
import { getPaymentExamIdForSlug } from "@/lib/payments/plans";

type Params = Promise<{ examSlug: string }>;

type PremiumLibraryItem = {
  kind: PremiumContentKind;
  title: string;
  description: string;
  href: string;
  available: boolean;
  detail?: string;
};

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return exams.map((exam) => ({ examSlug: exam.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { examSlug } = await params;
  const exam = getExamBySlug(examSlug);
  return { title: exam ? `${exam.name} Workspace` : "Exam Workspace" };
}

function getPremiumLibrary(examSlug: string): PremiumLibraryItem[] {
  const basePath = `/dashboard/exams/${examSlug}`;
  const items: PremiumLibraryItem[] = [
    {
      kind: "predicted_questions",
      title: "Predicted Questions",
      description: "Probability-ranked practice candidates with rationale and difficulty context.",
      href: `${basePath}/predicted-questions`,
      available: false,
    },
    {
      kind: "mock_tests",
      title: "Mock Tests",
      description: "Trend-weighted mock papers and expected-pattern practice drills.",
      href: `${basePath}/mocks`,
      available: false,
    },
    {
      kind: "topic_probability",
      title: "Topic Probability",
      description: "Topic likelihood, frequency movement, and preparation risk signals.",
      href: `${basePath}/topic-probability`,
      available: false,
    },
    {
      kind: "analytics_report",
      title: "Analytics Report",
      description: "Exam analytics, heatmaps, recurrence signals, and portfolio summaries.",
      href: `${basePath}/analytics`,
      available: false,
    },
    {
      kind: "practice_planner",
      title: "Practice Planner",
      description: "Adaptive drill planning around weak areas and current priorities.",
      href: "/dashboard/practice-planner",
      available: false,
    },
    {
      kind: "downloadable_reports",
      title: "Downloadable Reports",
      description: "Premium PDF reports, paper files, and preparation intelligence exports.",
      href: `${basePath}/reports`,
      available: false,
    },
  ];

  if (examSlug !== "cat") {
    return items;
  }

  const candidates = getCatCandidateScores();
  const papers = getCatPredictedPapers();
  const specs = getCatPredictionSpecs();
  const backtest = getCatBacktestSummary();
  const practice = getCatQuantPracticeStats();
  const downloads = getCatDownloads().filter((download) => download.tier === "premium");

  return items.map((item) => {
    switch (item.kind) {
      case "predicted_questions":
        return {
          ...item,
          available: candidates.selectedPoolCount > 0 || candidates.scoredCount > 0,
          detail: `${candidates.selectedPoolCount || candidates.scoredCount} candidate questions`,
        };
      case "mock_tests":
        return {
          ...item,
          available: papers.some((paper) => paper.questionCount > 0),
          detail: `${papers.length} predicted paper variants`,
        };
      case "topic_probability":
        return {
          ...item,
          available: specs.count > 0,
          detail: `${specs.count} prediction specifications`,
        };
      case "analytics_report":
        return {
          ...item,
          available: backtest.rowCount > 0,
          detail: `${backtest.rowCount} backtest rows`,
        };
      case "practice_planner":
        return {
          ...item,
          available: practice.total > 0,
          detail: `${practice.total} practice questions`,
        };
      case "downloadable_reports":
        return {
          ...item,
          available: downloads.length > 0,
          detail: `${downloads.length} premium PDF files`,
        };
    }
  });
}

function PremiumLibrary({
  examName,
  items,
  hasAccess,
  examId,
}: {
  examName: string;
  items: PremiumLibraryItem[];
  hasAccess: boolean;
  examId: string | null;
}) {
  if (!hasAccess) {
    return (
      <section className="aurora-surface mt-8 p-6">
        <Crown size={20} style={{ color: "var(--aurora-violet)" }} aria-hidden />
        <h2 className="mt-4 text-xl font-extrabold">{examName} Premium Library</h2>
        <p
          className="mt-2 text-sm leading-6"
          style={{ color: "var(--aurora-text-secondary)" }}
        >
          Upgrade this exam to unlock predicted questions, mocks, analytics,
          planning tools, and premium reports.
        </p>
        <Link
          href={`/pricing${examId ? `?examId=${encodeURIComponent(examId)}` : ""}`}
          className="aurora-button-primary mt-5 text-sm"
        >
          Upgrade to Premium <ArrowRight size={15} aria-hidden />
        </Link>
      </section>
    );
  }

  const hasUploadedContent = items.some((item) => item.available);

  return (
    <section className="mt-8">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p
            className="text-xs font-bold uppercase tracking-[0.18em]"
            style={{ color: "var(--aurora-primary)" }}
          >
            Subscriber library
          </p>
          <h2 className="mt-2 text-2xl font-extrabold">
            {examName} Premium Content
          </h2>
        </div>
        <span className="aurora-badge">Premium active</span>
      </div>

      {!hasUploadedContent && (
        <div
          className="mt-5 rounded-2xl border p-5 text-sm font-semibold"
          style={{
            borderColor: "var(--aurora-border-soft)",
            background: "var(--aurora-background-soft)",
            color: "var(--aurora-text-secondary)",
          }}
        >
          Premium access active. Content is being prepared.
        </div>
      )}

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <PremiumContentCard key={item.kind} {...item} />
        ))}
      </div>
    </section>
  );
}

export default async function DashboardExamWorkspacePage({ params }: { params: Params }) {
  const { examSlug } = await params;
  const exam = getExamBySlug(examSlug);
  if (!exam) notFound();
  const user = await requireUser(`/dashboard/exams/${examSlug}`);
  const paymentExamId = getPaymentExamIdForSlug(exam.slug);
  const hasAccess = paymentExamId
    ? (await isAdmin(user)) ||
      (await hasActiveExamSubscription(user.id, paymentExamId).catch(() => false))
    : false;
  const premiumLibrary = getPremiumLibrary(exam.slug);

  if (exam.slug === "cat") {
    const stats = getCatDashboardStats();
    const recommendation = getCatFinalRecommendation();
    const practiceStats = getCatQuantPracticeStats();
    return (
      <DashboardShell title="CAT intelligence workspace" subtitle="Local CAT content integration: candidates, variants, reports and risk provenance." activeHref="/dashboard/exams">
        <CatStatsGrid stats={stats} />
        <div className="mt-8">
          <CatRecommendationCard stats={stats} papers={recommendation.selectedPapers} />
        </div>
        <div className="mt-8">
          <DashboardPracticePanel stats={practiceStats} />
        </div>
        <PremiumLibrary
          examName={exam.name}
          items={premiumLibrary}
          hasAccess={hasAccess}
          examId={paymentExamId}
        />
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            { label: "Dashboard PYQs", href: "/dashboard/exams/cat/pyqs", icon: FileText },
            { label: "CAT analytics", href: "/dashboard/exams/cat/analytics", icon: BarChart3 },
            { label: "Predicted papers", href: "/exams/cat/predicted-papers", icon: FlaskConical },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="rounded-xl border border-white/8 bg-white/[0.025] p-5 hover:border-cyan-400/30">
              <item.icon size={18} className="text-cyan-300" />
              <h3 className="mt-4 text-base font-semibold text-white">{item.label}</h3>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-cyan-300">
                Open <ArrowRight size={14} />
              </span>
            </Link>
          ))}
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell title={`${exam.name} workspace`} subtitle="Mock workspace for this exam. CAT has local file-backed content in Phase 2A." activeHref="/dashboard/exams">
      <SectionHeader eyebrow={exam.category} title={exam.fullName} description={exam.description} />
      {paymentExamId && (
        <PremiumLibrary
          examName={exam.name}
          items={premiumLibrary}
          hasAccess={hasAccess}
          examId={paymentExamId}
        />
      )}
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {[
          { label: "PYQs", href: `/dashboard/exams/${exam.slug}/pyqs`, icon: FileText },
          { label: "Analytics", href: `/dashboard/exams/${exam.slug}/analytics`, icon: BarChart3 },
          { label: "Mocks", href: `/dashboard/exams/${exam.slug}/mocks`, icon: FlaskConical },
        ].map((item) => (
          <Link key={item.href} href={item.href} className="rounded-xl border border-white/8 bg-white/[0.025] p-5 hover:border-cyan-400/30">
            <item.icon size={18} className="text-cyan-300" />
            <h3 className="mt-4 text-base font-semibold text-white">{item.label}</h3>
          </Link>
        ))}
      </div>
    </DashboardShell>
  );
}
