import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { VarcSourcePracticeBrowser } from "@/components/practice/VarcSourcePracticeBrowser";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getCatVarcSourceByLevel } from "@/lib/content/practice/cat-varc-source";
import type { PracticeLevel } from "@/types/practice";

const level = "Beginner" as PracticeLevel;

export const metadata: Metadata = { title: "CAT VARC Source – Beginner" };

export default function CatVarcSourceBeginnerPage() {
  const questions = getCatVarcSourceByLevel(level);
  return (
    <PageShell withGrid>
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <Link href="/exams/cat/varc/source" className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-300">
          <ArrowLeft size={14} /> Back to VARC source bank
        </Link>
        <div className="mt-8">
          <SectionHeader
            eyebrow="CAT VARC · Source direct"
            title="Beginner VARC practice from source."
            description="Foundation-level Reading Comprehension and Verbal Ability questions preserved directly from source PDFs."
          />
        </div>
        <div className="mt-10">
          <VarcSourcePracticeBrowser questions={questions} level={level} />
        </div>
      </section>
    </PageShell>
  );
}
