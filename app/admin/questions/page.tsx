import type { Metadata } from "next";
import { FileQuestion } from "lucide-react";
import { AdminShell } from "@/components/layout/AdminShell";
import { AdminActionCard } from "@/components/admin/AdminCards";
import { demoQuestions } from "@/data/questions";

export const metadata: Metadata = { title: "Admin Questions" };

export default function AdminQuestionsPage() {
  return (
    <AdminShell title="Manage questions" subtitle="Question bank review placeholders." activeHref="/admin/questions">
      <div className="grid gap-5">
        {demoQuestions.slice(0, 8).map((question) => (
          <AdminActionCard
            key={question.id}
            icon={FileQuestion}
            title={`${question.paperCode} - ${question.topic}`}
            description={`${question.subtopic}. Difficulty: ${question.difficulty}. Archetype: ${question.archetype}.`}
            status={question.isFree ? "Free preview" : "Premium"}
          />
        ))}
      </div>
    </AdminShell>
  );
}
