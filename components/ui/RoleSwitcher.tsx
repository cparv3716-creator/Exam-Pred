"use client";

import { ChevronDown, LayoutDashboard, Shield } from "lucide-react";
import { useState } from "react";
import { roleLabels, roles, useRoleStore } from "@/stores/use-role-store";
import { cn } from "@/lib/utils";

export function RoleSwitcher({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const { role, setRole } = useRoleStore();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 text-xs font-medium text-slate-300 transition-colors hover:border-cyan-400/40",
          compact ? "px-2.5 py-1.5" : "px-3 py-1.5",
        )}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-cyan" />
        Demo: {roleLabels[role]}
        <ChevronDown size={14} />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-white/10 bg-ink-900/95 p-1.5 shadow-2xl shadow-cyan-950/30 backdrop-blur-2xl">
          <p className="px-3 py-2 text-[10px] uppercase tracking-wider text-slate-500">
            Preview access tier
          </p>
          {roles.map((candidate) => {
            const Icon = candidate === "admin" ? Shield : LayoutDashboard;
            return (
              <button
                key={candidate}
                type="button"
                onClick={() => {
                  setRole(candidate);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                  role === candidate
                    ? "bg-cyan-400/10 text-cyan-200"
                    : "text-slate-300 hover:bg-white/5",
                )}
              >
                <Icon size={15} />
                {roleLabels[candidate]}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
