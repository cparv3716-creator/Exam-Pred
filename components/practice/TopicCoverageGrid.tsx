import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { topicToSlug } from "@/lib/content/practice/topic-slugs";

export function TopicCoverageGrid({
  coverage,
}: {
  coverage: Array<{
    topic: string;
    count: number;
    beginner: number;
    intermediate: number;
    advanced: number;
    premiumOnly: number;
    subtopicCount: number;
  }>;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {coverage.map((topic) => (
        <Link
          key={topic.topic}
          href={`/exams/cat/quant/topic/${topicToSlug(topic.topic)}`}
          className="rounded-xl border border-white/8 bg-white/[0.025] p-5 transition-all hover:border-cyan-400/25 hover:bg-white/[0.045]"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold text-white">{topic.topic}</h3>
              <p className="mt-1 text-sm text-slate-500">{topic.count} questions / {topic.subtopicCount} subtopics</p>
            </div>
            <ArrowRight size={17} className="text-slate-500" />
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2">
            <MiniStat label="Beg" value={topic.beginner} />
            <MiniStat label="Int" value={topic.intermediate} />
            <MiniStat label="Adv" value={topic.advanced} />
          </div>
          <p className="mt-4 text-xs text-purple-200">{topic.premiumOnly} premium-only items</p>
        </Link>
      ))}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-white/8 bg-white/[0.025] px-3 py-2">
      <p className="text-[10px] uppercase tracking-[0.14em] text-slate-600">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}
