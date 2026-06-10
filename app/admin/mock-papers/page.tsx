import type { Metadata } from "next";
import { ClipboardCheck } from "lucide-react";
import { AdminShell } from "@/components/layout/AdminShell";
import { AdminActionCard } from "@/components/admin/AdminCards";
import { mockPapers } from "@/data/analytics";

export const metadata: Metadata = { title: "Admin Mock Papers" };

export default function AdminMockPapersPage() {
  return (
    <AdminShell title="Manage mock papers" subtitle="Trend-weighted mock configuration placeholders." activeHref="/admin/mock-papers">
      <div className="grid gap-5 md:grid-cols-3">
        {mockPapers.map((mock) => (
          <AdminActionCard
            key={mock.id}
            icon={ClipboardCheck}
            title={mock.title}
            description={`${mock.spec}. ${mock.questions} questions, ${mock.duration}, ${mock.difficulty} difficulty.`}
            status="Draft"
          />
        ))}
      </div>
    </AdminShell>
  );
}
