"use client";

import Link from "next/link";
import { Crown, Download, FileText, Lock } from "lucide-react";
import type { CatDownload } from "@/types/content";
import { isPremium, useRoleStore } from "@/stores/use-role-store";

export function CatDownloadsExperience({
  downloads,
  premiumAccess = false,
}: {
  downloads: CatDownload[];
  premiumAccess?: boolean;
}) {
  const role = useRoleStore((state) => state.role);
  const premium = premiumAccess || isPremium(role);

  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {downloads.map((download) => {
        const guestLocked = !premiumAccess && role === "guest";
        const premiumLocked = download.tier === "premium" && !premium;
        const locked = guestLocked || premiumLocked;

        return (
          <div key={download.id} className="rounded-xl border border-white/8 bg-white/[0.025] p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
                <FileText size={18} />
              </div>
              {download.tier === "premium" && <Crown size={17} className="text-purple-300" />}
            </div>
            <h3 className="mt-5 text-base font-semibold text-white">{download.label}</h3>
            <p className="mt-2 text-sm text-slate-500">{download.fileName}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-600">{Math.round(download.sizeBytes / 1024)} KB / {download.tier}</p>
            {locked ? (
              <div className="mt-5 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-semibold text-slate-500">
                <Lock size={15} /> {guestLocked ? "Sign up required" : "Premium locked"}
              </div>
            ) : (
              <Link href={download.href} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-600 px-4 py-2 text-sm font-semibold text-white">
                <Download size={15} /> Download PDF
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
}
