import Link from "next/link";

export default function ContactPage() {
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
            Contact Statstrive
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-6xl">
            Need help? Contact us.
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/60 md:text-lg">
            For support, payment issues, exam content issues, partnerships, or
            general queries, reach out to the Statstrive team.
          </p>
        </section>

        <section className="mx-auto mt-10 grid max-w-3xl gap-5">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur">
            <h2 className="text-xl font-semibold">Email Support</h2>
            <p className="mt-2 text-white/60">
              For support and general queries:
            </p>
            <a
              href="mailto:statstrive@gmail.com"
              className="mt-3 inline-block text-lg font-semibold text-violet-300 hover:text-violet-200"
            >
              statstrive@gmail.com
            </a>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur">
            <h2 className="text-xl font-semibold">Payment Issues</h2>
            <p className="mt-2 leading-7 text-white/60">
              If payment was deducted but premium access is not showing, email us
              with your registered email ID, payment screenshot, order ID, and
              approximate payment time.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur">
            <h2 className="text-xl font-semibold">Content Issues</h2>
            <p className="mt-2 leading-7 text-white/60">
              If you find a wrong answer, confusing explanation, or missing
              solution, mention the exam name, section, question number, and the
              issue clearly.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur">
            <h2 className="text-xl font-semibold">Important</h2>
            <p className="mt-2 leading-7 text-white/60">
              Please do not share passwords, OTPs, card numbers, CVV, UPI PINs,
              or any sensitive banking details.
            </p>
          </div>
        </section>

        <section className="mt-10 text-center text-sm text-white/45">
          <Link href="/terms" className="hover:text-white">
            Terms and Conditions
          </Link>
          <span className="mx-3">•</span>
          <Link href="/privacy" className="hover:text-white">
            Privacy Policy
          </Link>
        </section>
      </div>
    </main>
  );
}