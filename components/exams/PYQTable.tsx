import type { DemoQuestion } from "@/types/examiq";
import { DifficultyBadge } from "@/components/ui/Badge";
import { ProbabilityBar } from "@/components/ui/ProbabilityMeter";

export function PYQTable({
  questions,
  showAnalytics = false,
}: {
  questions: DemoQuestion[];
  showAnalytics?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/8">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left">
          <thead>
            <tr className="border-b border-white/8 bg-white/[0.03]">
              <Th>#</Th>
              <Th>Question</Th>
              <Th>Topic</Th>
              <Th>Year</Th>
              <Th>Difficulty</Th>
              {showAnalytics ? <Th>Probability</Th> : <Th>Type</Th>}
            </tr>
          </thead>
          <tbody>
            {questions.map((question, index) => (
              <tr key={question.id} className="border-b border-white/5 transition-colors hover:bg-white/[0.025]">
                <td className="px-4 py-4 text-sm text-slate-600">{index + 1}</td>
                <td className="max-w-md px-4 py-4">
                  <p className="line-clamp-2 text-sm text-slate-200">{question.questionText}</p>
                  <p className="mt-1 text-xs text-slate-500">{question.archetype}</p>
                </td>
                <td className="px-4 py-4">
                  <span className="text-sm text-slate-300">{question.topic}</span>
                  <p className="text-xs text-slate-500">{question.subtopic}</p>
                </td>
                <td className="px-4 py-4 text-sm text-slate-400">{question.year}</td>
                <td className="px-4 py-4">
                  <DifficultyBadge level={question.difficulty} />
                </td>
                <td className="px-4 py-4">
                  {showAnalytics ? (
                    <div className="w-32">
                      <ProbabilityBar value={question.probability} />
                    </div>
                  ) : (
                    <span className="text-sm text-slate-400">{question.questionType}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-500">
      {children}
    </th>
  );
}
