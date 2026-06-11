import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AuroraPageShell } from "@/components/aurora/AuroraPageShell";
import { DilrSetViewer } from "@/components/dilr/DilrSetViewer";
import { getAllDilrSets, getDilrSetById } from "@/lib/content/dilr";

export function generateStaticParams() {
  return getAllDilrSets().map((set) => ({ setId: set.set_id }));
}

export async function generateMetadata({ params }: { params: Promise<{ setId: string }> }): Promise<Metadata> {
  const { setId } = await params;
  const set = getDilrSetById(setId);
  if (!set) return { title: "DILR set not found" };
  return { title: `${set.metadata.title} | CAT DILR` };
}

export default async function DilrPracticeSetPage({ params }: { params: Promise<{ setId: string }> }) {
  const { setId } = await params;
  const set = getDilrSetById(setId);
  if (!set) notFound();

  return (
    <AuroraPageShell>
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Link
          href="/exams/cat/dilr"
          className="aurora-focus-ring inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-[color:var(--aurora-text-muted)] transition-colors hover:text-[color:var(--aurora-primary)]"
        >
          <ArrowLeft size={14} aria-hidden /> Back to DILR library
        </Link>
        <div className="mt-6">
          <DilrSetViewer set={set} />
        </div>
      </section>
    </AuroraPageShell>
  );
}