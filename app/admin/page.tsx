import type { Metadata } from "next";
import Link from "next/link";
import { ClipboardCheck, Database, FileBarChart, FileQuestion, FlaskConical, Layers, Radio, Sparkles, UploadCloud } from "lucide-react";
import { AdminShell } from "@/components/layout/AdminShell";
import { AdminActionCard, QualityChecklist } from "@/components/admin/AdminCards";

export const metadata: Metadata = {
  title: "Admin Console",
  description: "Statstrive admin cockpit placeholders.",
};

export default function AdminPage() {
  return (
    <AdminShell title="Admin console" subtitle="Premium placeholders for content operations, uploads, review and publish controls." activeHref="/admin">
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Layers, title: "Manage exams", href: "/admin/exams", description: "Catalog settings, sections and access tier visibility." },
          { icon: UploadCloud, title: "Upload PYQs", href: "/admin/upload-pyqs", description: "CSV/PDF upload workflow placeholder with validation states." },
          { icon: FileQuestion, title: "Question bank", href: "/admin/questions", description: "Review topic metadata, difficulty and solution status." },
          { icon: FlaskConical, title: "Prediction specs", href: "/admin/prediction-specs", description: "Configure transparent mock prediction rules." },
          { icon: Sparkles, title: "Generated practice", href: "/admin/generated-practice-status", description: "CAT Quant generated-practice import status and quality tiers." },
        ].map((item) => (
          <Link key={item.href} href={item.href}>
            <AdminActionCard icon={item.icon} title={item.title} description={item.description} />
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <QualityChecklist
          items={[
            "No copyrighted real PYQs in demo data",
            "No leaked, official, exact, guaranteed or sure-shot claims",
            "Synthetic solution metadata present",
            "Production storage pipeline pending",
            "Admin approval and audit trail pending",
          ]}
        />
        <div className="rounded-xl border border-white/8 bg-white/[0.025] p-5">
          <h3 className="text-base font-semibold text-white">Publish controls</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Demo controls illustrate the future workflow without mutating real content.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              ["Publish selected demo batch", "Ready"],
              ["Unpublish stale mock", "Queued"],
              ["Run topic quality audit", "Ready"],
              ["Export admin report", "Mock"],
            ].map(([label, status]) => (
              <button key={label} type="button" className="flex items-center justify-between rounded-lg border border-white/8 bg-white/[0.025] px-4 py-3 text-left text-sm text-slate-300">
                <span className="inline-flex items-center gap-2"><Radio size={14} className="text-emerald-300" /> {label}</span>
                <span className="text-xs text-slate-500">{status}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        <AdminActionCard icon={Database} title="Data integrity" description="Placeholder duplicate detection and schema checks." status="Mock" />
        <AdminActionCard icon={FileBarChart} title="Report queue" description="Premium export generation and approval queue." status="Mock" />
        <AdminActionCard icon={ClipboardCheck} title="Mock paper QA" description="Review balance, timing and difficulty distribution." status="Mock" />
      </div>
    </AdminShell>
  );
}
