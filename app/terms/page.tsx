import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/"
          className="inline-block rounded-full border border-white/10 px-4 py-2 text-sm text-white/70 hover:text-white"
        >
          ← Back to Home
        </Link>

        <section className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur md:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-300">
            Statstrive
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
            Terms and Conditions
          </h1>

          <p className="mt-4 text-sm text-white/50">
            Last updated: June 14, 2026
          </p>

          <div className="mt-8 space-y-7 text-white/70">
            <section>
              <h2 className="text-xl font-semibold text-white">1. Acceptance of Terms</h2>
              <p className="mt-2 leading-7">
                By accessing or using Statstrive, you agree to follow these Terms
                and Conditions. If you do not agree, please do not use the platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">2. Educational Purpose</h2>
              <p className="mt-2 leading-7">
                Statstrive provides exam preparation content, practice questions,
                analytics, and learning tools for educational purposes only. We do
                not guarantee admission, selection, rank, score, or exam success.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">3. User Responsibility</h2>
              <p className="mt-2 leading-7">
                You are responsible for using the platform honestly and lawfully.
                You should not misuse, copy, scrape, resell, or distribute our
                content without permission.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">4. Account and Payment</h2>
              <p className="mt-2 leading-7">
                Some features may require login or payment. You are responsible for
                keeping your account information safe. Payment-related access may
                depend on successful verification from our payment provider.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">5. Content Accuracy</h2>
              <p className="mt-2 leading-7">
                We try to keep questions, explanations, and exam resources accurate,
                but errors may occur. Users should verify important information from
                official exam sources.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">6. Changes to Terms</h2>
              <p className="mt-2 leading-7">
                We may update these terms from time to time. Continued use of
                Statstrive after changes means you accept the updated terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">7. Contact</h2>
              <p className="mt-2 leading-7">
                For questions about these terms, contact us at{" "}
                <a
                  href="mailto:statstrive@gmail.com"
                  className="text-violet-300 hover:text-violet-200"
                >
                  statstrive@gmail.com
                </a>.
              </p>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}