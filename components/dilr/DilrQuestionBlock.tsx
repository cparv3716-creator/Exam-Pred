import type { DilrAnswerKey, DilrQuestion } from "@/types/dilr";
import { DilrMarkdown } from "@/components/dilr/DilrMarkdown";

/**
 * Focus Mode question card — opaque, airy, no glow under text (DESIGN.md §Focus).
 */
export function DilrQuestionBlock({ question, answerKey }: { question: DilrQuestion; answerKey: DilrAnswerKey }) {
  const answer = answerKey.answers.find((item) => item.question_id === question.id);
  return (
    <article className="aurora-reading-surface p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold" style={{ color: "var(--aurora-text-primary)" }}>
            {question.id}
          </h2>
          <span className="aurora-badge">{question.type}</span>
        </div>
        {answer && (
          <span className="text-xs" style={{ color: "var(--aurora-text-muted)" }}>
            Answer key connected
          </span>
        )}
      </div>
      <div className="mt-4 overflow-x-auto">
        <DilrMarkdown content={question.markdown || "Question text pending final review upload."} />
      </div>
    </article>
  );
}
