import type { Metadata } from "next";
import { CheckCircle2, FileCheck2, FileText, Tags, UploadCloud, WandSparkles } from "lucide-react";
import { AdminShell } from "@/components/layout/AdminShell";
import { AdminActionCard, QualityChecklist } from "@/components/admin/AdminCards";
import { LocalPyqUploadStudio } from "@/components/admin/LocalPyqUploadStudio";

export const metadata: Metadata = { title: "Upload PYQs" };

export default function UploadPYQsPage() {
  return (
    <AdminShell title="Upload PYQs" subtitle="CSV/PDF upload workflow placeholder. No scraping and no copyrighted real PYQs in this demo." activeHref="/admin/upload-pyqs">
      <div className="rounded-2xl border border-dashed border-cyan-400/25 bg-cyan-400/[0.04] p-10 text-center">
        <UploadCloud size={34} className="mx-auto text-cyan-300" />
        <h2 className="mt-4 text-xl font-semibold text-white">Validate legally permitted CSV/PDF content locally</h2>
        <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
          Phase 2B-Lite validates files locally and exports cleaned JSON. Phase 2B full will add persistent upload storage, review history and approval logs.
        </p>
        <p className="mx-auto mt-6 max-w-2xl rounded-lg border border-white/10 bg-white/[0.035] px-4 py-3 text-sm font-semibold text-slate-200">
          Start from <code className="text-cyan-200">templates/pyq_upload_template.csv</code>, then run <code className="text-cyan-200">npm run import:pyq -- path/to/file.csv</code>.
        </p>
      </div>
      <div className="mt-8">
        <LocalPyqUploadStudio />
      </div>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        <AdminActionCard icon={FileCheck2} title="Schema validation" description="Validate required columns, topic mapping and solution fields." status="Ready" />
        <AdminActionCard icon={WandSparkles} title="AI metadata assist" description="Suggest topic, subtopic, archetype and difficulty tags." status="Phase 2" />
        <AdminActionCard icon={UploadCloud} title="Storage handoff" description="Persist source files, parsed records and review history." status="Phase 2" />
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-xl border border-white/8 bg-white/[0.025] p-5">
          <h3 className="text-base font-semibold text-white">Local upload workflow preview</h3>
          <div className="mt-5 divide-y divide-white/8">
            {[
              ["Upload CSV", "questions.csv, prediction_specs.csv, candidate_scores.csv"],
              ["Upload markdown report", "pipeline summary, final recommendation, paper markdown"],
              ["Upload PDF report", "public download artifact with title and tier"],
              ["Mark access tier", "free preview or premium evidence lineage"],
              ["Publish status", "draft, review, published, unpublished"],
            ].map(([title, detail]) => (
              <div key={title} className="py-3">
                <p className="text-sm font-semibold text-white">{title}</p>
                <p className="mt-1 text-xs text-slate-500">{detail}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-white/8 bg-white/[0.025] p-5">
          <h3 className="text-base font-semibold text-white">Detected column preview</h3>
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {["candidate_id", "topic", "subtopic", "difficulty", "question_text", "correct_answer", "paper_eligible", "verification_status"].map((column) => (
              <span key={column} className="inline-flex items-center gap-2 rounded-lg border border-white/8 bg-white/[0.025] px-3 py-2 text-sm text-slate-300">
                <CheckCircle2 size={14} className="text-emerald-300" /> {column}
              </span>
            ))}
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {[
              { icon: Tags, title: "Map fields", description: "Map source columns to canonical fields." },
              { icon: FileText, title: "Preview markdown", description: "Render sanitized previews before publish." },
              { icon: UploadCloud, title: "PDF artifact", description: "Attach files to free/premium tiers." },
            ].map((item) => (
              <div key={item.title}>
                <item.icon size={16} className="text-cyan-300" />
                <p className="mt-2 text-sm font-semibold text-white">{item.title}</p>
                <p className="mt-1 text-xs text-slate-500">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-8">
        <QualityChecklist items={["Source rights confirmed", "No real copyrighted demo content", "Question text marked synthetic until approved", "Duplicate detection pending", "OCR quality score pending"]} />
      </div>
    </AdminShell>
  );
}
