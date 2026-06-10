import type { Metadata } from "next";
import { FileBarChart, FileText, ToggleLeft, UploadCloud } from "lucide-react";
import { AdminShell } from "@/components/layout/AdminShell";
import { AdminActionCard } from "@/components/admin/AdminCards";
import { reports } from "@/data/analytics";
import { getCatDownloads, getCatPipelineSummary } from "@/lib/content/cat";

export const metadata: Metadata = { title: "Admin Reports" };

export default function AdminReportsPage() {
  const catDownloads = getCatDownloads();
  const pipelineSummary = getCatPipelineSummary();

  return (
    <AdminShell title="Manage reports" subtitle="Report templates, generation and publish placeholders." activeHref="/admin/reports">
      <div className="mb-8 grid gap-5 md:grid-cols-3">
        <AdminActionCard icon={UploadCloud} title="Upload PDF report" description="Attach a PDF artifact and map it to free or premium access." status="UI ready" />
        <AdminActionCard icon={FileText} title="Upload markdown report" description="Render sanitized markdown previews from local report files." status={pipelineSummary.exists ? "Detected" : "Missing"} />
        <AdminActionCard icon={ToggleLeft} title="Publish controls" description="Toggle draft, review, published and unpublished states." status="Phase 2B" />
      </div>
      <div className="mb-8 rounded-xl border border-white/8 bg-white/[0.025] p-5">
        <h3 className="text-base font-semibold text-white">CAT local report artifacts</h3>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {catDownloads.map((download) => (
            <div key={download.id} className="flex items-center justify-between gap-4 rounded-lg border border-white/8 bg-white/[0.025] p-4">
              <div>
                <p className="text-sm font-semibold text-white">{download.label}</p>
                <p className="mt-1 text-xs text-slate-500">{download.fileName}</p>
              </div>
              <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-slate-400">{download.tier}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {reports.map((report) => (
          <AdminActionCard key={report.id} icon={FileBarChart} title={report.title} description={report.description} status={report.tier} />
        ))}
      </div>
    </AdminShell>
  );
}
