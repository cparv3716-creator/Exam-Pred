"use client";

import Link from "next/link";
import {
  Brain,
  ClipboardCheck,
  CreditCard,
  Database,
  FileBarChart,
  FileQuestion,
  FlaskConical,
  Layers,
  Menu,
  MonitorCheck,
  Settings2,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { RoleSwitcher } from "@/components/ui/RoleSwitcher";
import { cn } from "@/lib/utils";

const adminNav = [
  { label: "Console", href: "/admin", icon: Database },
  { label: "Exams", href: "/admin/exams", icon: Layers },
  { label: "Users & Access", href: "/admin/users", icon: Users },
  { label: "Subscriptions", href: "/admin/subscriptions", icon: ShieldCheck },
  { label: "Payment Orders", href: "/admin/payments", icon: CreditCard },
  { label: "Upload PYQs", href: "/admin/upload-pyqs", icon: UploadCloud },
  { label: "Questions", href: "/admin/questions", icon: FileQuestion },
  { label: "Topics", href: "/admin/topics", icon: Settings2 },
  { label: "Reports", href: "/admin/reports", icon: FileBarChart },
  { label: "Prediction Specs", href: "/admin/prediction-specs", icon: FlaskConical },
  { label: "Mock Papers", href: "/admin/mock-papers", icon: ClipboardCheck },
  { label: "Generated Practice", href: "/admin/generated-practice-status", icon: Sparkles },
  { label: "Content Status", href: "/admin/content-status", icon: MonitorCheck },
];

export function AdminShell({
  children,
  title,
  subtitle,
  activeHref,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  activeHref?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-ink-950 text-slate-200">
      <div className="pointer-events-none fixed inset-0 grid-bg opacity-40" />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-72 transform border-r border-white/5 bg-ink-900/88 backdrop-blur-2xl transition-transform duration-200 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/5 px-5">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-600">
              <Brain size={18} className="text-white" />
            </div>
            <span className="text-sm font-semibold text-white">Statstrive Admin</span>
          </Link>
          <button type="button" onClick={() => setOpen(false)} className="text-slate-400 lg:hidden">
            <X size={20} />
          </button>
        </div>
        <div className="flex flex-col gap-1 p-3">
          {adminNav.map((item) => {
            const active = activeHref === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active ? "bg-emerald-400/10 text-emerald-200" : "text-slate-400 hover:bg-white/5 hover:text-white",
                )}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </div>
        <div className="absolute inset-x-3 bottom-3 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.05] p-4">
          <p className="text-xs font-semibold text-white">Server-gated admin</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            Admin pages require an active admin_users row. Content upload controls remain local workflow placeholders.
          </p>
        </div>
      </aside>

      {open && <button type="button" aria-label="Close admin sidebar" className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setOpen(false)} />}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-white/5 bg-ink-900/82 px-4 backdrop-blur-2xl sm:px-6">
          <button type="button" onClick={() => setOpen(true)} className="text-slate-300 lg:hidden" aria-label="Open admin sidebar">
            <Menu size={22} />
          </button>
          <Link href="/dashboard" className="text-sm text-slate-500 hover:text-slate-300">
            Back to dashboard
          </Link>
          <div className="ml-auto">
            <RoleSwitcher compact />
          </div>
        </header>
        <main className="relative z-10 mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">Admin cockpit</p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
