import type { Metadata } from "next";
import { User } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { RoleSwitcher } from "@/components/ui/RoleSwitcher";

export const metadata: Metadata = {
  title: "Profile",
  description: "Statstrive demo profile.",
};

export default function ProfilePage() {
  return (
    <DashboardShell title="Profile" subtitle="Demo account settings and role preview." activeHref="/dashboard/profile">
      <div className="aurora-glass aurora-fade-slide-up relative max-w-2xl overflow-hidden p-7">
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-[3px]"
          style={{ background: "linear-gradient(90deg, var(--aurora-1), var(--aurora-2), var(--aurora-3))" }}
        />
        <span
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl"
          style={{ background: "var(--aurora-background-soft)", color: "var(--aurora-primary)" }}
        >
          <User size={20} aria-hidden />
        </span>
        <h2 className="mt-4 text-lg font-bold" style={{ color: "var(--aurora-text-primary)" }}>
          Demo learner profile
        </h2>
        <p className="mt-2 text-sm leading-6" style={{ color: "var(--aurora-text-secondary)" }}>
          Real authentication, profile fields, notification preferences and billing data will be connected in a later phase.
          Until then, use the role switcher to preview free, premium and admin views.
        </p>
        <div className="mt-6 border-t pt-5" style={{ borderColor: "var(--aurora-border-soft)" }}>
          <span className="aurora-darkland inline-block rounded-full p-0.5" style={{ background: "var(--aurora-text-primary)" }}>
            <RoleSwitcher />
          </span>
        </div>
      </div>
    </DashboardShell>
  );
}
