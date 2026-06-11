import { Check, ChevronRight } from "lucide-react";
import type { DilrAnswerKey } from "@/types/dilr";
import { DilrMarkdown } from "@/components/dilr/DilrMarkdown";

/**
 * Focus Mode solution disclosure — calm, opaque, mint answer accent, no glow
 * burst. Uses native <details> so it snaps open under reduced motion.
 */
export function DilrSolutionPanel({ answerKey, solutionMarkdown }: { answerKey: DilrAnswerKey; solutionMarkdown: string }) {
  return (
    <details
      className="group aurora-surface p-5 sm:p-6"
      style={{ borderColor: "color-mix(in srgb, var(--aurora-success) 30%, var(--aurora-border-soft))" }}
    >
      <summary
        className="flex cursor-pointer list-none items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] marker:hidden"
        style={{ color: "var(--aurora-success)" }}
      >
        <ChevronRight size={15} className="transition-transform group-open:rotate-90" />
        Answer key and solution
        <span className="ml-1 text-xs font-normal normal-case tracking-normal" style={{ color: "var(--aurora-text-muted)" }}>
          Open after attempting the set
        </span>
      </summary>

      <div className="mt-5 grid gap-3 sm:grid-cols-4">
        {answerKey.answers.map((answer) => (
          <div
            key={answer.question_id}
            className="rounded-xl border p-4"
            style={{ borderColor: "var(--aurora-border-soft)", background: "var(--aurora-background-soft)" }}
          >
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--aurora-text-muted)" }}>
              {answer.question_id} · {answer.type}
            </p>
            <p className="mt-2 flex items-center gap-1.5 text-2xl font-bold" style={{ color: "var(--aurora-text-primary)" }}>
              <Check size={16} style={{ color: "var(--aurora-success)" }} />
              {answer.answer}
            </p>
          </div>
        ))}
      </div>

      {solutionMarkdown && (
        <div className="aurora-reading-surface mt-6 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--aurora-violet)" }}>
            Worked solution
          </p>
          <div className="overflow-x-auto">
            <DilrMarkdown content={solutionMarkdown} />
          </div>
        </div>
      )}
    </details>
  );
}
