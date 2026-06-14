import Link from "next/link";

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>

          <p className="mt-4 text-sm text-white/50">
            Last updated: June 14, 2026
          </p>

          <div className="mt-8 space-y-7 text-white/70">
            <section>
              <h2 className="text-xl font-semibold text-white">1. Information We Collect</h2>
              <p className="mt-2 leading-7">
                We may collect basic account information such as name, email
                address, login details, payment status, selected exams, practice
                activity, and feedback submitted by users.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">2. How We Use Information</h2>
              <p className="mt-2 leading-7">
                We use information to provide access to the platform, improve
                exam preparation tools, manage subscriptions, respond to support
                requests, and improve user experience.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">3. Payments</h2>
              <p className="mt-2 leading-7">
                Payments may be processed through third-party payment providers.
                We do not store full card numbers, CVV, UPI PINs, or sensitive
                banking credentials on Statstrive.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">4. Data Security</h2>
              <p className="mt-2 leading-7">
                We take reasonable measures to protect user data, but no online
                system can be guaranteed to be completely secure.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">5. Sharing of Information</h2>
              <p className="mt-2 leading-7">
                We do not sell personal information. We may share limited data
                with service providers needed to operate the platform, such as
                authentication, hosting, analytics, or payment services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">6. User Rights</h2>
              <p className="mt-2 leading-7">
                Users may contact us to request correction or deletion of their
                data, subject to technical, legal, and operational limitations.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">7. Contact</h2>
              <p className="mt-2 leading-7">
                For privacy-related questions, contact us at{" "}
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