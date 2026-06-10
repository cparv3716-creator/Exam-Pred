"use client";

import Link from "next/link";
import { LockKeyhole, Sparkles } from "lucide-react";
import { isPremium, isSignedIn, useRoleStore } from "@/stores/use-role-store";
import { cn } from "@/lib/utils";

export function BlurredPreviewGate({
  children,
  mode = "signup",
  title = "Sign up to unlock full PYQ analysis",
  description = "Create a free account to reveal this preview layer and keep your practice plan organized.",
  className,
}: {
  children: React.ReactNode;
  mode?: "signup" | "premium";
  title?: string;
  description?: string;
  className?: string;
}) {
  const role = useRoleStore((state) => state.role);
  const allowed = mode === "signup" ? isSignedIn(role) : isPremium(role);

  return (
    <div className={cn("relative overflow-hidden rounded-xl", className)}>
      <div className={cn(!allowed && "pointer-events-none select-none blur-sm")}>{children}</div>
      {!allowed && (
        <div className="absolute inset-0 flex items-center justify-center bg-ink-950/55 p-5 backdrop-blur-[2px]">
          <div className="max-w-sm text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/12 text-cyan-200 shadow-cyan">
              <LockKeyhole size={20} />
            </div>
            <h3 className="mt-4 text-base font-semibold text-white">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">{description}</p>
            <Link
              href={mode === "signup" ? "/signup" : "/pricing"}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white"
            >
              <Sparkles size={15} /> {mode === "signup" ? "Start Free" : "Upgrade"}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
