import type { Metadata } from "next";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { ReportDownloadCard } from "@/components/dashboard/ReportDownloadCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { reports } from "@/data/analytics";

export const metadata: Metadata = {
  title: "Downloads",
  description: "Statstrive demo download center.",
};

export default function DownloadsPage() {
  return (
    <DashboardShell title="Downloads" subtitle="Mock report actions and export placeholders." activeHref="/dashboard/downloads">
      <SectionHeader eyebrow="Download center" title="Reports and exports" />
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {reports.map((report) => (
          <ReportDownloadCard key={report.id} report={report} locked={report.tier === "premium"} />
        ))}
      </div>
    </DashboardShell>
  );
}
