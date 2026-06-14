import Link from "next/link";
import { FeedbackForm } from "@/components/feedback/FeedbackForm";

export default function FeedbackPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/"
          className="inline-block rounded-full border border-white/10 px-4 py-2 text-sm text-white/70 hover:text-white"
        >
          ← Back to Home
        </Link>

        <section className="mt-12 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-300">
            Statstrive Feedback
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-6xl">
            Help us improve Statstrive
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/60 md:text-lg">
            Found a bug, wrong answer, payment issue, or want a new feature?
            Share your feedback with us.
          </p>
        </section>

        <FeedbackForm />
      </div>
    </main>
  );
}