"use client";

import Link from "next/link";
import { Download, Filter, Lock, Sparkles } from "lucide-react";
import type { DemoQuestion, Exam } from "@/types/examiq";
import { isPremium, useRoleStore } from "@/stores/use-role-store";
import { BlurredPreviewGate } from "@/components/ui/BlurredPreviewGate";
import { PlanLockCard } from "@/components/ui/PlanLockCard";
import { PremiumGuard } from "@/components/ui/PremiumGuard";
import { QuestionCard } from "@/components/exams/QuestionCard";
import { PYQTable } from "@/components/exams/PYQTable";
import { ReportDownloadCard } from "@/components/dashboard/ReportDownloadCard";
import { AnalyticsChartCard } from "@/components/dashboard/AnalyticsChartCard";
import { reports } from "@/data/analytics";

export function PYQExperience({
  exam,
  questions,
}: {
  exam: Exam;
  questions: DemoQuestion[];
}) {
  const role = useRoleStore((state) => state.role);
  const premium = isPremium(role);
  const previewQuestions = role === "guest" ? questions.slice(0, 3) : questions;
  const lockedQuestions = role === "guest" ? questions.slice(3) : [];

  return (
    <div className="space-y-8">
      <div className="grid gap-3 rounded-xl border border-white/8 bg-white/[0.025] p-4 md:grid-cols-4">
        {["Topic", "Subtopic", "Difficulty", "Year"].map((filter) => (
          <button
            key={filter}
            type="button"
            className="flex items-center justify-between rounded-lg border border-white/8 bg-white/[0.025] px-3 py-2.5 text-sm text-slate-400"
          >
            <span className="inline-flex items-center gap-2">
              <Filter size={14} className="text-cyan-300" />
              {filter}
            </span>
            All
          </button>
        ))}
      </div>

      <div className="grid gap-4">
        {previewQuestions.map((question) => (
          <QuestionCard key={question.id} question={question} showAnalytics={premium} />
        ))}
      </div>

      {role === "guest" && lockedQuestions.length > 0 && (
        <BlurredPreviewGate
          title="Sign up to unlock full PYQ analysis"
          description="Free members can see all demo PYQ analysis, filters and basic report actions."
          className="border border-white/8"
        >
          <div className="grid gap-4 p-1">
            {lockedQuestions.map((question) => (
              <QuestionCard key={question.id} question={question} showSolution={false} />
            ))}
          </div>
        </BlurredPreviewGate>
      )}

      {role !== "guest" && (
        <>
          <div>
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-white">Dense PYQ analysis table</h2>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-200"
              >
                <Download size={14} /> Basic mock report
              </button>
            </div>
            <PYQTable questions={questions} showAnalytics={premium} />
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {reports.map((report) => (
              <ReportDownloadCard
                key={report.id}
                report={report}
                locked={report.tier === "premium" && !premium}
              />
            ))}
          </div>
        </>
      )}

      <PremiumGuard
        title={`${exam.name} premium analytics locked`}
        description="Upgrade to reveal topic probability, prediction signals, trend-weighted mocks and premium report cards."
        features={["Probability dashboards", "Predicted practice archetypes", "Mock paper blueprints"]}
      >
        <div className="grid gap-5 lg:grid-cols-2">
          <AnalyticsChartCard title={`${exam.name} trend movement`} subtitle="Synthetic topic frequency by year" />
          <AnalyticsChartCard title="Probability distribution" subtitle="Premium topic likelihood preview" variant="bar" />
        </div>
      </PremiumGuard>

      {role === "guest" && (
        <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/[0.05] p-6 text-center">
          <Lock size={22} className="mx-auto text-cyan-300" />
          <h3 className="mt-3 text-base font-semibold text-white">No download access for guests</h3>
          <p className="mt-2 text-sm text-slate-400">Create a free account to unlock basic demo downloads.</p>
          <Link
            href="/signup"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white"
          >
            <Sparkles size={15} /> Start Free
          </Link>
        </div>
      )}

      {role === "free" && (
        <PlanLockCard
          title="Analytics, mocks and reports are Premium"
          description="Free unlocks PYQ analysis and basic mock downloads. Premium unlocks the cockpit layers."
          features={["Topic heatmaps", "Predicted questions", "Premium downloads"]}
        />
      )}
    </div>
  );
}
