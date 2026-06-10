import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { PracticeQuestionBrowser } from "@/components/practice/PracticeQuestionBrowser";
import { PracticeStatsCards } from "@/components/practice/PracticeStatsCards";
import { SectionHeader } from "@/components/ui/SectionHeader";
import {
  getCatQuantPracticeByTopic,
  getCatQuantPracticeCoverage,
  getCatQuantPracticeQuestions,
  getCatQuantPracticeStats,
} from "@/lib/content/practice/cat-quant-practice";
import { topicToSlug } from "@/lib/content/practice/topic-slugs";

type Params = Promise<{ topic: string }>;

export function generateStaticParams() {
  return getCatQuantPracticeCoverage().map((item) => ({ topic: topicToSlug(item.topic) }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { topic } = await params;
  const questions = getCatQuantPracticeByTopic(topic);
  return { title: questions[0] ? `CAT Quant ${questions[0].topic}` : "CAT Quant Topic Practice" };
}

export default async function CatQuantTopicPage({ params }: { params: Params }) {
  const { topic } = await params;
  const questions = getCatQuantPracticeByTopic(topic);
  if (!questions.length) notFound();
  const topicName = questions[0].topic;
  const stats = getTopicStats(topicName);

  return (
    <PageShell withGrid>
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Topic-wise CAT Quant practice"
          title={topicName}
          description="Generated practice split by Beginner, Intermediate and Advanced. Topic likelihood remains separate from difficulty."
        />
        <div className="mt-10"><PracticeStatsCards stats={stats} /></div>
        <div className="mt-8"><PracticeQuestionBrowser questions={questions} level="Mixed" /></div>
      </section>
    </PageShell>
  );
}

function getTopicStats(topic: string) {
  const topicQuestions = getCatQuantPracticeQuestions().filter((question) => question.topic === topic);
  const base = getCatQuantPracticeStats();
  return {
    ...base,
    total: topicQuestions.length,
    beginner: topicQuestions.filter((question) => question.practice_level === "Beginner").length,
    intermediate: topicQuestions.filter((question) => question.practice_level === "Intermediate").length,
    advanced: topicQuestions.filter((question) => question.practice_level === "Advanced").length,
    freeAccess: topicQuestions.filter((question) => question.access_tier === "free").length,
    premiumOnly: topicQuestions.filter((question) => question.access_tier === "premium").length,
    pncProbability: topicQuestions.filter((question) => question.topic_group === "P&C / Probability").length,
  };
}
