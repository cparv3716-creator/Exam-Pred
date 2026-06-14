import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  ClipboardList,
  Download,
  FileQuestion,
  FlaskConical,
} from "lucide-react";

export type PremiumContentKind =
  | "predicted_questions"
  | "mock_tests"
  | "topic_probability"
  | "analytics_report"
  | "practice_planner"
  | "downloadable_reports";

const icons = {
  predicted_questions: FileQuestion,
  mock_tests: FlaskConical,
  topic_probability: BrainCircuit,
  analytics_report: BarChart3,
  practice_planner: ClipboardList,
  downloadable_reports: Download,
} satisfies Record<PremiumContentKind, typeof FileQuestion>;

export function PremiumContentCard({
  kind,
  title,
  description,
  href,
  available,
  detail,
}: {
  kind: PremiumContentKind;
  title: string;
  description: string;
  href: string;
  available: boolean;
  detail?: string;
}) {
  const Icon = icons[kind];

  return (
    <article className="aurora-glass aurora-card-hover flex h-full flex-col p-5">
      <div className="flex items-start justify-between gap-4">
        <span
          className="grid h-10 w-10 place-items-center rounded-xl"
          style={{
            background: available
              ? "rgba(99, 102, 241, 0.1)"
              : "var(--aurora-background-soft)",
            color: available
              ? "var(--aurora-primary)"
              : "var(--aurora-text-muted)",
          }}
        >
          <Icon size={18} aria-hidden />
        </span>
        <span
          className="aurora-badge"
          style={{
            color: available
              ? "var(--aurora-success)"
              : "var(--aurora-warning)",
          }}
        >
          {available ? "Available" : "Preparing"}
        </span>
      </div>

      <h3 className="mt-4 text-base font-extrabold">{title}</h3>
      <p
        className="mt-2 flex-1 text-sm leading-6"
        style={{ color: "var(--aurora-text-secondary)" }}
      >
        {description}
      </p>

      {detail && available && (
        <p
          className="mt-3 text-xs font-semibold"
          style={{ color: "var(--aurora-text-muted)" }}
        >
          {detail}
        </p>
      )}

      {available ? (
        <Link href={href} className="aurora-button-primary mt-5 w-full text-sm">
          Open content <ArrowRight size={15} aria-hidden />
        </Link>
      ) : (
        <p
          className="mt-5 rounded-xl border p-3 text-xs font-semibold leading-5"
          style={{
            borderColor: "var(--aurora-border-soft)",
            background: "var(--aurora-background-soft)",
            color: "var(--aurora-text-secondary)",
          }}
        >
          Premium access active. Content is being prepared.
        </p>
      )}
    </article>
  );
}
