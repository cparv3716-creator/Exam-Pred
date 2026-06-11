"use client";

import Link from "next/link";
import {
  BookOpen,
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

/**
 * DashboardShell — Aurora Glass Intelligence Command Mode.
 * Light icy canvas, glass cockpit rail (drawer < lg), sticky glass top bar,
 * one faint corner aurora glow (static — no orb, no drift). Content area is
 * wrapped in `.aurora-command`, which re-skins legacy dark widgets for
 * readability without modifying them.
 */
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
    <div
      className="relative min-h-screen overflow-x-clip"
      style={{ background: "var(--aurora-background)", color: "var(--aurora-text-primary)" }}
    >
      {/* static corner aurora glow (Command Mode: one faint corner, no motion) */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute -right-40 -top-40 h-[34rem] w-[34rem] rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, var(--aurora-glow-primary), transparent 70%)", opacity: 0.5 }}
        />
        <div
          className="absolute -bottom-44 -left-44 h-[30rem] w-[30rem] rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, var(--aurora-glow-cyan), transparent 70%)", opacity: 0.45 }}
        />
      </div>

      {/* glass cockpit rail */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transform border-r transition-transform duration-200 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
        style={{
          background: "var(--aurora-surface-glass-strong)",
          backdropFilter: "blur(18px) saturate(140%)",
          WebkitBackdropFilter: "blur(18px) saturate(140%)",
          borderColor: "var(--aurora-border-soft)",
        }}
      >
        <div className="flex h-16 items-center justify-between border-b px-5" style={{ borderColor: "var(--aurora-border-soft)" }}>
          <Link href="/" className="aurora-focus-ring flex items-center gap-2.5 rounded-lg">
            <span
              aria-hidden
              className="relative grid h-8 w-8 place-items-center rounded-full"
              style={{
                background:
                  "radial-gradient(circle at 35% 30%, #ffffff, var(--aurora-primary-bright) 55%, var(--aurora-primary) 100%)",
                boxShadow: "var(--aurora-glow-md)",
              }}
            >
              <span className="text-[0.65rem] font-black text-white">S</span>
            </span>
            <span className="text-sm font-extrabold tracking-tight" style={{ color: "var(--aurora-text-primary)" }}>
              Statstrive
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="aurora-focus-ring rounded-md lg:hidden"
            style={{ color: "var(--aurora-text-muted)" }}
            aria-label="Close sidebar"
          >
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
                aria-current={active ? "page" : undefined}
                className="aurora-focus-ring group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors"
                style={
                  active
                    ? {
                        color: "var(--aurora-primary)",
                        background: "var(--aurora-background-soft)",
                        boxShadow: "var(--aurora-glow-sm)",
                      }
                    : { color: "var(--aurora-text-secondary)" }
                }
              >
                <span className="flex items-center gap-3">
                  <item.icon size={17} aria-hidden />
                  {item.label}
                </span>
                {locked && <Crown size={13} aria-hidden style={{ color: "var(--aurora-violet)" }} />}
              </Link>
            );
          })}
        </div>

        {isAdmin(role) && (
          <div className="px-3">
            <p className="px-3 pb-2 pt-3 text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--aurora-text-muted)" }}>
              Admin
            </p>
            <Link
              href="/admin"
              className="aurora-focus-ring flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors"
              style={{ color: "var(--aurora-text-secondary)" }}
            >
              <ShieldCheck size={17} aria-hidden /> Admin Console
            </Link>
          </div>
        )}

        <div className="absolute inset-x-3 bottom-3">
          <div
            className="rounded-2xl border p-4"
            style={{
              borderColor: premium
                ? "color-mix(in srgb, var(--aurora-violet) 40%, transparent)"
                : "var(--aurora-border-soft)",
              background: premium
                ? "color-mix(in srgb, var(--aurora-violet) 7%, var(--aurora-surface))"
                : "var(--aurora-surface)",
              boxShadow: "var(--aurora-shadow-1)",
            }}
          >
            <div className="flex items-center gap-2">
              {premium ? (
                <Crown size={15} aria-hidden style={{ color: "var(--aurora-violet)" }} />
              ) : (
                <Sparkles size={15} aria-hidden style={{ color: "var(--aurora-cyan)" }} />
              )}
              <span className="text-xs font-bold" style={{ color: "var(--aurora-text-primary)" }}>
                {roleLabels[role]}
              </span>
            </div>
            {!premium && (
              <Link href="/pricing" className="aurora-button-primary aurora-focus-ring mt-3 w-full px-3 py-2 text-xs" style={{ minHeight: 36 }}>
                Upgrade to Premium
              </Link>
            )}
          </div>
        </div>
      </aside>

      {open && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="lg:pl-64">
        {/* sticky glass top bar */}
        <header
          className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b px-4 sm:px-6"
          style={{
            background: "var(--aurora-surface-glass)",
            backdropFilter: "blur(16px) saturate(140%)",
            WebkitBackdropFilter: "blur(16px) saturate(140%)",
            borderColor: "var(--aurora-border-soft)",
          }}
        >
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="aurora-focus-ring rounded-md lg:hidden"
            style={{ color: "var(--aurora-text-primary)" }}
            aria-label="Open sidebar"
          >
            <Menu size={22} />
          </button>
          <Link
            href="/"
            className="aurora-focus-ring hidden items-center gap-1 rounded-md text-sm font-medium transition-colors hover:text-[color:var(--aurora-primary)] sm:flex"
            style={{ color: "var(--aurora-text-muted)" }}
          >
            <ChevronLeft size={16} aria-hidden /> Back to site
          </Link>
          <div className="ml-auto flex items-center gap-3">
            <span className="aurora-darkland rounded-full p-0.5" style={{ background: "var(--aurora-text-primary)" }}>
              <RoleSwitcher compact />
            </span>
            <Link href="/exams" className="aurora-button-secondary aurora-focus-ring px-3 py-1.5 text-xs" style={{ minHeight: 34 }}>
              Explore PYQs
            </Link>
          </div>
        </header>

        <div className="aurora-command relative z-10 mx-auto max-w-6xl px-4 py-8 sm:px-6">
          {title && (
            <div className="mb-8">
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em]" style={{ color: "var(--aurora-primary)" }}>
                Command center
              </p>
              <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight sm:text-3xl" style={{ color: "var(--aurora-text-primary)" }}>
                {title}
              </h1>
              {subtitle && (
                <p className="mt-1.5 max-w-2xl text-sm leading-6" style={{ color: "var(--aurora-text-secondary)" }}>
                  {subtitle}
                </p>
              )}
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
