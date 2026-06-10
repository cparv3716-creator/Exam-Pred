import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PYQExperience } from "@/components/exams/PYQExperience";
import { exams, getExamBySlug } from "@/data/exams";
import { getQuestionsByExam } from "@/data/questions";

type Params = Promise<{ examSlug: string }>;

export function generateStaticParams() {
  return exams.map((exam) => ({ examSlug: exam.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { examSlug } = await params;
  const exam = getExamBySlug(examSlug);
  return { title: exam ? `${exam.name} Dashboard PYQs` : "Dashboard PYQs" };
}

export default async function DashboardExamPYQsPage({ params }: { params: Params }) {
  const { examSlug } = await params;
  const exam = getExamBySlug(examSlug);
  if (!exam) notFound();

  return (
    <DashboardShell title={`${exam.name} PYQ workspace`} subtitle="Basic analysis for free users, premium analytics for premium/admin." activeHref="/dashboard/exams">
      <PYQExperience exam={exam} questions={getQuestionsByExam(exam.slug)} />
    </DashboardShell>
  );
}
