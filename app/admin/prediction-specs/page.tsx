import type { Metadata } from "next";
import { FlaskConical } from "lucide-react";
import { AdminShell } from "@/components/layout/AdminShell";
import { AdminActionCard } from "@/components/admin/AdminCards";
import { predictedQuestions } from "@/data/analytics";

export const metadata: Metadata = { title: "Prediction Specs" };

export default function PredictionSpecsPage() {
  return (
    <AdminShell title="Prediction specs" subtitle="Transparent rules for practice archetype generation." activeHref="/admin/prediction-specs">
      <div className="grid gap-5 md:grid-cols-2">
        {predictedQuestions.map((question) => (
          <AdminActionCard
            key={question.id}
            icon={FlaskConical}
            title={`${question.topic}: ${question.archetype}`}
            description={question.rationale}
            status={`${question.probability}%`}
          />
        ))}
      </div>
    </AdminShell>
  );
}
