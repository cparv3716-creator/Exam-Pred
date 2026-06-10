import type { Metadata } from "next";
import { Layers } from "lucide-react";
import { AdminShell } from "@/components/layout/AdminShell";
import { AdminActionCard } from "@/components/admin/AdminCards";
import { exams } from "@/data/exams";

export const metadata: Metadata = { title: "Admin Exams" };

export default function AdminExamsPage() {
  return (
    <AdminShell title="Manage exams" subtitle="Catalog configuration placeholders." activeHref="/admin/exams">
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {exams.map((exam) => (
          <AdminActionCard
            key={exam.slug}
            icon={Layers}
            title={exam.name}
            description={`${exam.sections.length} sections, ${exam.topicCount} topics, ${exam.yearsCovered} coverage. Last updated: ${exam.lastUpdated}.`}
            status="Visible"
          />
        ))}
      </div>
    </AdminShell>
  );
}
