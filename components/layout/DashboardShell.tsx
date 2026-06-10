"use client";

import Link from "next/link";
import {
  BookOpen,
  Brain,
  Calendar,
  ChevronLeft,
  Crown,
  Download,
  LayoutDashboard,
  Menu,
  ShieldCheck,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { useState } from "react";
import { isAdmin, isPremium, roleLabels, useRoleStore } from "@/stores/use-role-store";
import { RoleSwitcher } from "@/components/ui/RoleSwitcher";
import { cn } from "@/lib/utils";

const nav = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard, tier: "free" },
  { label: "My Exams", href: "/dashboard/exams", icon: BookOpen, tier: "free" },
  { label: "Downloads", href: "/dashboard/downloads", icon: Download, tier: "free" },
  { label: "Practice Planner", href: "/dashboard/practice-planner", icon: Calendar, tier: "premium" },
  { label: "Profile", href: "/dashboard/profile", icon: User, tier: "free" },
];

export function DashboardShell({
  children,
  title,
  subtitle,
  activeHref,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  activeHref?: string;
}) {
  const [open, setOpen] = useState(false);
  const role = useRoleStore((state) => state.role);
  const premium = isPremium(role);

  return (
    <div className="relative min-h-screen bg-ink-950 text-slate-200">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 top-0 h-96 w-96 rounded-full bg-cyan-500/8 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-purple-500/8 blur-[120px]" />
      </div>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transform border-r border-white/5 bg-ink-900/82 backdrop-blur-2xl transition-transform duration-200 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/5 px-5">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600">
              <Brain size={18} className="text-white" />
            </div>
            <span className="text-sm font-semibold text-white">
              Exam<span className="text-cyan-300">IQ</span>
            </span>
          </Link>
          <button type="button" onClick={() => setOpen(false)} className="text-slate-400 lg:hidden">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-1 p-3">
          {nav.map((item) => {
            const locked = item.tier === "premium" && !premium;
            const active = activeHref === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active ? "bg-cyan-400/10 text-cyan-200" : "text-slate-400 hover:bg-white/5 hover:text-white",
                )}
              >
                <span className="flex items-center gap-3">
                  <item.icon size={18} />
                  {item.label}
                </span>
                {locked && <Crown size={13} className="text-purple-300/70" />}
              </Link>
            );
          })}
        </div>

        {isAdmin(role) && (
          <div className="px-3">
            <p className="px-3 pb-2 pt-3 text-[10px] uppercase tracking-wider text-slate-600">Admin</p>
            <Link
              href="/admin"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white"
            >
              <ShieldCheck size={18} /> Admin Console
            </Link>
          </div>
        )}

        <div className="absolute inset-x-3 bottom-3">
          <div
            className={cn(
              "rounded-xl border p-4",
              premium ? "border-purple-400/25 bg-purple-500/[0.06]" : "border-white/8 bg-white/[0.03]",
            )}
          >
            <div className="flex items-center gap-2">
              {premium ? <Crown size={15} className="text-purple-300" /> : <Sparkles size={15} className="text-cyan-300" />}
              <span className="text-xs font-semibold text-white">{roleLabels[role]}</span>
            </div>
            {!premium && (
              <Link href="/pricing" className="mt-3 block rounded-lg bg-gradient-to-r from-purple-500 to-blue-600 px-3 py-2 text-center text-xs font-semibold text-white">
                Upgrade to Premium
              </Link>
            )}
          </div>
        </div>
      </aside>

      {open && <button type="button" aria-label="Close sidebar" className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setOpen(false)} />}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-white/5 bg-ink-900/82 px-4 backdrop-blur-2xl sm:px-6">
          <button type="button" onClick={() => setOpen(true)} className="text-slate-300 lg:hidden" aria-label="Open sidebar">
            <Menu size={22} />
          </button>
          <Link href="/" className="hidden items-center gap-1 text-sm text-slate-500 hover:text-slate-300 sm:flex">
            <ChevronLeft size={16} /> Back to site
          </Link>
          <div className="ml-auto flex items-center gap-3">
            <RoleSwitcher compact />
            <Link href="/exams" className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/5">
              Explore PYQs
            </Link>
          </div>
        </header>

        <div className="relative z-10 mx-auto max-w-6xl px-4 py-8 sm:px-6">
          {title && (
            <div className="mb-8">
              <h1 className="text-2xl font-semibold tracking-tight text-white">{title}</h1>
              {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
