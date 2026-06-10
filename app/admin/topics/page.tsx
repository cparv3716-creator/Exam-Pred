import type { Metadata } from "next";
import { Settings2 } from "lucide-react";
import { AdminShell } from "@/components/layout/AdminShell";
import { AdminActionCard } from "@/components/admin/AdminCards";
import { topicProbability } from "@/data/analytics";

export const metadata: Metadata = { title: "Admin Topics" };

export default function AdminTopicsPage() {
  return (
    <AdminShell title="Manage topics" subtitle="Topic taxonomy, aliases and probability metadata placeholders." activeHref="/admin/topics">
      <div className="grid gap-5 md:grid-cols-2">
        {topicProbability.map((topic) => (
          <AdminActionCard
            key={topic.topic}
            icon={Settings2}
            title={topic.topic}
            description={`Probability ${topic.probability}%, frequency ${topic.frequency}%, risk ${topic.risk}.`}
            status="Mapped"
          />
        ))}
      </div>
    </AdminShell>
  );
}
