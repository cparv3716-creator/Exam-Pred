import type { Metadata } from "next";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { ReportDownloadCard } from "@/components/dashboard/ReportDownloadCard";
import { reports } from "@/data/analytics";

export const metadata: Metadata = {
  title: "Downloads",
  description: "Statstrive demo download center.",
};

export default function DownloadsPage() {
  return (
    <DashboardShell
      title="Downloads"
      subtitle="Report exports and download placeholders. Premium reports unlock with the premium tier."
      activeHref="/dashboard/downloads"
    >
      <div className="aurora-fade-slide-up grid gap-5 md:grid-cols-3">
        {reports.map((report) => (
          <ReportDownloadCard key={report.id} report={report} locked={report.tier === "premium"} />
        ))}
      </div>
      {reports.length === 0 && (
        <div className="aurora-surface p-8 text-center text-sm" style={{ color: "var(--aurora-text-muted)" }}>
          No reports yet — start practice to unlock your first export.
        </div>
      )}
    </DashboardShell>
  );
}
