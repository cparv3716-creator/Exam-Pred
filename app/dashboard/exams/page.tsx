import type { Metadata } from "next";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { ExamCard } from "@/components/exams/ExamCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { exams } from "@/data/exams";

export const metadata: Metadata = {
  title: "Dashboard Exams",
  description: "Followed exam cockpit cards.",
};

export default function DashboardExamsPage() {
  return (
    <DashboardShell title="My exams" subtitle="Open a role-aware workspace for each supported exam." activeHref="/dashboard/exams">
      <SectionHeader eyebrow="Followed catalog" title="Exam workspaces" />
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {exams.map((exam) => (
          <ExamCard key={exam.slug} exam={exam} href={`/dashboard/exams/${exam.slug}`} />
        ))}
      </div>
    </DashboardShell>
  );
}
