import Link from "next/link";
import { Brain } from "lucide-react";
import { legalDisclaimer } from "@/lib/utils";

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/5 bg-ink-950/70">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.2fr_1fr_1fr] lg:px-8">
        <div>
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600">
              <Brain size={19} className="text-white" />
            </div>
            <span className="text-base font-semibold text-white">
              Stat<span className="text-cyan-300">strive</span>
            </span>
          </Link>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-500">
            {legalDisclaimer}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Platform</p>
          <div className="mt-4 grid gap-2 text-sm text-slate-400">
            <Link href="/exams" className="hover:text-white">Exams</Link>
            <Link href="/pricing" className="hover:text-white">Pricing</Link>
            <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
            <Link href="/about" className="hover:text-white">About</Link>
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Content Status</p>
          <p className="mt-4 text-sm leading-relaxed text-slate-500">
            CAT is connected to local pipeline outputs. Other exams currently use demo previews until their pipelines are uploaded.
          </p>
        </div>
      </div>
    </footer>
  );
}
