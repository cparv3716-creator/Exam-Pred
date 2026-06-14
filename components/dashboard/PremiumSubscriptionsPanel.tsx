import Link from "next/link";
import { ArrowRight, Clock3, Crown } from "lucide-react";
import type { UserExamSubscriptionRow } from "@/lib/backend/payments";
import {
  getExam,
  getExamAccessHref,
  getPlan,
} from "@/lib/payments/plans";

function formatDate(value: string) {
  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
}

export function PremiumSubscriptionsPanel({
  subscriptions,
}: {
  subscriptions: UserExamSubscriptionRow[];
}) {
  const now = Date.now();
  const active = subscriptions.filter(
    (subscription) =>
      subscription.status === "active" &&
      new Date(subscription.valid_until).getTime() > now,
  );
  const expired = subscriptions.filter(
    (subscription) =>
      subscription.status !== "active" ||
      new Date(subscription.valid_until).getTime() <= now,
  );

  return (
    <section className="aurora-fade-slide-up mt-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p
            className="text-[0.65rem] font-bold uppercase tracking-[0.18em]"
            style={{ color: "var(--aurora-primary)" }}
          >
            Premium access
          </p>
          <h2 className="mt-1.5 text-xl font-extrabold">
            Your exam subscriptions
          </h2>
        </div>
        {active.length > 0 && (
          <span className="aurora-badge">{active.length} active</span>
        )}
      </div>

      {active.length > 0 ? (
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {active.map((subscription) => {
            const exam = getExam(subscription.exam_id);
            const plan = getPlan(subscription.plan_id);

            return (
              <article
                key={subscription.id}
                className="aurora-glass aurora-card-hover p-5"
              >
                <span
                  className="grid h-10 w-10 place-items-center rounded-xl"
                  style={{
                    background: "rgba(139, 92, 246, 0.1)",
                    color: "var(--aurora-violet)",
                  }}
                >
                  <Crown size={18} aria-hidden />
                </span>
                <h3 className="mt-4 text-lg font-extrabold">
                  {exam?.name ?? subscription.exam_id.toUpperCase()} Premium Active
                </h3>
                <div
                  className="mt-3 space-y-1 text-sm"
                  style={{ color: "var(--aurora-text-secondary)" }}
                >
                  <p>Plan: {subscription.plan_id}</p>
                  <p>Valid until: {formatDate(subscription.valid_until)}</p>
                  {plan && <p>{plan.name}</p>}
                </div>
                <Link
                  href={getExamAccessHref(subscription.exam_id)}
                  className="aurora-button-primary mt-5 w-full text-sm"
                >
                  Continue {exam?.name ?? subscription.exam_id.toUpperCase()} Premium
                  <ArrowRight size={15} aria-hidden />
                </Link>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="aurora-surface mt-5 p-6">
          <h3 className="text-lg font-extrabold">No premium plan active</h3>
          <p
            className="mt-2 text-sm leading-6"
            style={{ color: "var(--aurora-text-secondary)" }}
          >
            Upgrade an exam to unlock its premium analytics, mocks, predictions,
            and planning tools.
          </p>
          <Link href="/pricing" className="aurora-button-primary mt-5 text-sm">
            <Crown size={16} aria-hidden /> Upgrade to Premium
          </Link>
        </div>
      )}

      {expired.length > 0 && (
        <div className="mt-5">
          <p
            className="text-xs font-bold uppercase tracking-[0.16em]"
            style={{ color: "var(--aurora-text-muted)" }}
          >
            Expired plans
          </p>
          <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {expired.map((subscription) => {
              const exam = getExam(subscription.exam_id);

              return (
                <article
                  key={subscription.id}
                  className="rounded-2xl border p-4"
                  style={{
                    borderColor: "var(--aurora-border-soft)",
                    background: "var(--aurora-surface)",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Clock3
                      size={16}
                      style={{ color: "var(--aurora-warning)" }}
                      aria-hidden
                    />
                    <h3 className="font-bold">
                      {exam?.name ?? subscription.exam_id.toUpperCase()} Premium Expired
                    </h3>
                  </div>
                  <p
                    className="mt-2 text-sm"
                    style={{ color: "var(--aurora-text-secondary)" }}
                  >
                    Expired: {formatDate(subscription.valid_until)}
                  </p>
                  <Link
                    href={`/pricing?examId=${encodeURIComponent(subscription.exam_id)}`}
                    className="mt-3 inline-flex text-sm font-bold"
                    style={{ color: "var(--aurora-primary)" }}
                  >
                    Renew access
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
