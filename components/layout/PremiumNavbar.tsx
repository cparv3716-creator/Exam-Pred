"use client";

import Link from "next/link";
import {
  BarChart3,
  BookOpenCheck,
  Brain,
  ChevronDown,
  Layers,
  LayoutDashboard,
  LogOut,
  Menu,
  Shield,
  Sigma,
  X,
} from "lucide-react";
import { useState } from "react";
import { isAdmin, isSignedIn, useRoleStore } from "@/stores/use-role-store";
import { RoleSwitcher } from "@/components/ui/RoleSwitcher";
import { ProgressPill } from "@/components/ui/premium";

const navLinks = [
  { label: "Exams", href: "/exams" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
];

const catLinks = [
  { label: "CAT dashboard", href: "/exams/cat", icon: Brain, desc: "Overview & coverage" },
  { label: "Quant practice", href: "/exams/cat/quant/latex-source", icon: Sigma, desc: "Source-authored Quant" },
  { label: "VARC practice", href: "/exams/cat/varc/source", icon: BookOpenCheck, desc: "RC & Verbal Ability" },
  { label: "Reports", href: "/exams/cat/reports", icon: BarChart3, desc: "Section summaries & PDFs" },
];

export function PremiumNavbar() {
  const [open, setOpen] = useState(false);
  const { role, signOut } = useRoleStore();
  const signedIn = isSignedIn(role);

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/5 bg-ink-900/82 backdrop-blur-2xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="relative">
              <div className="absolute inset-0 rounded-lg bg-cyan-400/30 blur-md animate-pulse-glow" />
              <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600">
                <Brain size={20} className="text-white" />
              </div>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-base font-semibold tracking-tight text-white">
                Exam<span className="text-cyan-300">IQ</span>
              </span>
              <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500">Intelligence</span>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {/* CAT dropdown */}
            <div className="group relative">
              <button
                type="button"
                className="flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-white group-hover:text-white"
              >
                CAT <ChevronDown size={14} className="transition-transform group-hover:rotate-180" />
              </button>
              <div className="invisible absolute left-0 top-full w-72 translate-y-1 pt-2 opacity-0 transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-ink-900/95 p-2 shadow-2xl backdrop-blur-2xl">
                  {catLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-white/5"
                    >
                      <link.icon size={17} className="mt-0.5 shrink-0 text-cyan-300" />
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-white">{link.label}</span>
                        <span className="block text-xs text-slate-500">{link.desc}</span>
                      </span>
                    </Link>
                  ))}
                  <div className="mt-1 flex items-start gap-3 rounded-xl px-3 py-2.5 opacity-60">
                    <Layers size={17} className="mt-0.5 shrink-0 text-slate-500" />
                    <span className="min-w-0">
                      <span className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                        DILR practice <ProgressPill accent="slate">Soon</ProgressPill>
                      </span>
                      <span className="block text-xs text-slate-600">Data Interpretation & Logical Reasoning</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
            {signedIn && (
              <Link href="/dashboard" className="rounded-lg px-4 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-white">
                Dashboard
              </Link>
            )}
            {isAdmin(role) && (
              <Link href="/admin" className="rounded-lg px-4 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-white">
                Admin
              </Link>
            )}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <RoleSwitcher />
            {signedIn ? (
              <button
                type="button"
                onClick={signOut}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 hover:text-white"
              >
                <LogOut size={16} /> Sign out
              </button>
            ) : (
              <>
                <Link href="/login" className="rounded-lg px-4 py-2 text-sm font-medium text-slate-300 hover:text-white">
                  Log in
                </Link>
                <Link
                  href="/exams/cat"
                  className="rounded-lg bg-gradient-to-r from-cyan-400 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-cyan transition-opacity hover:opacity-90"
                >
                  Explore CAT
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-300 hover:bg-white/5 md:hidden"
            aria-label="Toggle navigation"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-white/5 bg-ink-900/95 px-4 py-4 backdrop-blur-2xl md:hidden">
          <p className="px-4 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">CAT</p>
          {catLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-2.5 rounded-lg px-4 py-3 text-sm font-medium text-slate-300 hover:bg-white/5"
              onClick={() => setOpen(false)}
            >
              <link.icon size={16} className="text-cyan-300" /> {link.label}
            </Link>
          ))}
          <div className="flex items-center gap-2.5 rounded-lg px-4 py-3 text-sm font-medium text-slate-500">
            <Layers size={16} /> DILR practice
            <ProgressPill accent="slate" className="ml-auto">
              Soon
            </ProgressPill>
          </div>

          <div className="my-2 h-px bg-white/5" />

          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block rounded-lg px-4 py-3 text-sm font-medium text-slate-300 hover:bg-white/5"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {signedIn && (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-slate-300 hover:bg-white/5"
              onClick={() => setOpen(false)}
            >
              <LayoutDashboard size={16} /> Dashboard
            </Link>
          )}
          {isAdmin(role) && (
            <Link
              href="/admin"
              className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-slate-300 hover:bg-white/5"
              onClick={() => setOpen(false)}
            >
              <Shield size={16} /> Admin
            </Link>
          )}
          <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <RoleSwitcher compact />
            <Link
              href="/exams/cat"
              className="rounded-lg bg-gradient-to-r from-cyan-400 to-blue-600 px-4 py-2 text-xs font-semibold text-white"
              onClick={() => setOpen(false)}
            >
              Explore CAT
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
