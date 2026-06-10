import { PageShell } from "@/components/layout/PageShell";

export default function PracticeQuestionLoading() {
  return (
    <PageShell withGrid>
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="h-4 w-40 animate-pulse rounded bg-white/10" />
        <div className="mt-6 flex gap-2">
          <div className="h-6 w-20 animate-pulse rounded-full bg-white/10" />
          <div className="h-6 w-20 animate-pulse rounded-full bg-white/10" />
          <div className="h-6 w-16 animate-pulse rounded-full bg-white/10" />
        </div>
        <div className="mt-8 rounded-2xl border border-white/8 bg-white/[0.025] p-6 sm:p-8">
          <div className="space-y-3">
            <div className="h-4 w-full animate-pulse rounded bg-white/10" />
            <div className="h-4 w-11/12 animate-pulse rounded bg-white/10" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-white/10" />
          </div>
          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-white/[0.06]" />
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
