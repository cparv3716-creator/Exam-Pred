import Link from "next/link";
import { Lock, Sparkles } from "lucide-react";

export function LockedFeatureOverlay({
  message = "Upgrade to unlock this intelligence layer",
}: {
  message?: string;
}) {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-ink-950/60 p-5 backdrop-blur-[6px]">
      <div className="max-w-xs text-center">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-lg border border-purple-400/30 bg-purple-500/15 text-purple-200">
          <Lock size={18} />
        </div>
        <p className="mt-3 text-sm font-semibold text-white">{message}</p>
        <Link
          href="/pricing"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-600 px-4 py-2 text-xs font-semibold text-white"
        >
          <Sparkles size={14} /> View Premium
        </Link>
      </div>
    </div>
  );
}
