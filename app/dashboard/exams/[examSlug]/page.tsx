import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BarChart3, FileText, FlaskConical } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { CatRecommendationCard, CatStatsGrid } from "@/components/content/CatContentCards";
import { DashboardPracticePanel } from "@/components/practice/DashboardPracticePanel";
import { exams, getExamBySlug } from "@/data/exams";
import { getCatDashboardStats, getCatFinalRecommendation } from "@/lib/content/cat";
import { getCatQuantPracticeStats } from "@/lib/content/practice/cat-quant-practice";

type Params = Promise<{ examSlug: string }>;

export function generateStaticParams() {
  return exams.map((exam) => ({ examSlug: exam.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { examSlug } = await params;
  const exam = getExamBySlug(examSlug);
  return { title: exam ? `${exam.name} Workspace` : "Exam Workspace" };
}

export default async function DashboardExamWorkspacePage({ params }: { params: Params }) {
  const { examSlug } = await params;
  const exam = getExamBySlug(examSlug);
  if (!exam) notFound();

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
