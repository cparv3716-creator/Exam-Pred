"use client";

import Link from "next/link";
import { Crown, Lock } from "lucide-react";
import type { PracticeLevel } from "@/types/practice";
import { isPremium, useRoleStore } from "@/stores/use-role-store";

export function PracticeLockGate({ level }: { level: PracticeLevel }) {
  const role = useRoleStore((state) => state.role);
  const premium = isPremium(role);
  const locked = role === "guest" || (level === "Advanced" && !premium);

  if (!locked) return null;

  return (
    <div className="rounded-2xl border border-purple-400/25 bg-purple-400/[0.06] p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-purple-200">
            {level === "Advanced" ? <Crown size={14} /> : <Lock size={14} />} {level} access gate
          </p>
          <h2 className="mt-3 text-xl font-semibold text-white">
            {role === "guest" ? "Sign up to unlock generated CAT Quant practice." : "Advanced CAT Quant practice is Premium only."}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
            Practice level, difficulty and topic likelihood are displayed separately so high-probability easy questions do not get confused with tough simulations.
          </p>
        </div>
        <Link href={role === "guest" ? "/signup" : "/pricing"} className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-purple-500 to-blue-600 px-5 py-3 text-sm font-semibold text-white">
          {role === "guest" ? "Sign up" : "Upgrade"}
        </Link>
      </div>
    </div>
  );
}
