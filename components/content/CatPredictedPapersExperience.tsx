"use client";

import Link from "next/link";
import { Crown, Download, Eye, FileText, Lock } from "lucide-react";
import type { CatDownload, CatPredictedPaper } from "@/types/content";
import { isPremium, useRoleStore } from "@/stores/use-role-store";
import { BlurredPreviewGate } from "@/components/ui/BlurredPreviewGate";
import { OutlinePill } from "@/components/ui/Badge";
import { PlanLockCard } from "@/components/ui/PlanLockCard";
import { MarkdownCard } from "@/components/content/MarkdownRenderer";

export function CatPredictedPapersExperience({
  papers,
  downloads,
}: {
  papers: CatPredictedPaper[];
  downloads: CatDownload[];
}) {
  const role = useRoleStore((state) => state.role);
  const premium = isPremium(role);
  const signedIn = role !== "guest";
  const visiblePapers = premium ? papers : papers.slice(0, signedIn ? 2 : 1);

  return (
    <div className="space-y-8">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {papers.map((paper, index) => {
          const locked = role === "guest" || (!premium && index > 1);
          return (
            <div key={paper.id} className="relative overflow-hidden rounded-xl border border-white/8 bg-white/[0.025] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold text-white">{paper.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{paper.strategy}</p>
                </div>
                {locked ? <Lock size={18} className="text-slate-600" /> : <Eye size={18} className="text-cyan-300" />}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <OutlinePill>{paper.variantType}</OutlinePill>
                <OutlinePill>{paper.questionCount} questions</OutlinePill>
                <OutlinePill>{paper.expectedOverlap?.toFixed(3) ?? "N/A"} overlap</OutlinePill>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-500">{paper.targetSectionMix}</p>
              {paper.pdfPath && !locked && (
                <Link href={paper.pdfPath} className="mt-5 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-200">
                  <Download size={15} /> Download PDF
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {role === "guest" && (
        <BlurredPreviewGate title="Sign up to preview CAT predicted papers" description="Guests can see paper names. Free users can open basic summaries; Premium unlocks all papers, PDFs and lineage." className="border border-white/8">
          <MarkdownCard markdown={papers[0]?.markdown.body ?? ""} compact />
        </BlurredPreviewGate>
      )}

      {signedIn && !premium && (
        <div className="space-y-5">
          {visiblePapers.map((paper) => (
            <MarkdownCard key={paper.id} title={`${paper.title} basic summary`} markdown={paper.markdown.body.split("## Questions")[0] ?? paper.markdown.body} />
          ))}
          <PlanLockCard
            title="Full CAT predicted paper portfolio is Premium"
            description="Premium unlocks all five variants, PDF downloads, detailed solutions and evidence lineage."
            features={["Balanced, arithmetic-heavy, reasoning-heavy, recent-trend and wildcard papers", "Detailed generated practice items", "PDF download access"]}
          />
        </div>
      )}

      {premium && (
        <div className="space-y-6">
          {papers.map((paper) => (
            <MarkdownCard key={paper.id} title={`${paper.title} - full paper and lineage`} markdown={paper.markdown.body} />
          ))}
        </div>
      )}

      <div className="rounded-xl border border-white/8 bg-white/[0.025] p-5">
        <h3 className="flex items-center gap-2 text-base font-semibold text-white">
          <FileText size={18} className="text-cyan-300" /> Available CAT files
        </h3>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {downloads.map((download) => {
            const locked = download.tier === "premium" && !premium;
            return (
              <div key={download.id} className="flex items-center justify-between gap-4 rounded-lg border border-white/8 bg-white/[0.025] p-4">
                <div>
                  <p className="text-sm font-semibold text-white">{download.label}</p>
                  <p className="mt-1 text-xs text-slate-500">{Math.round(download.sizeBytes / 1024)} KB / {download.tier}</p>
                </div>
                {locked ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-purple-300"><Crown size={13} /> Premium</span>
                ) : (
                  <Link href={download.href} className="text-sm font-semibold text-cyan-300 hover:text-cyan-200">
                    Download
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
