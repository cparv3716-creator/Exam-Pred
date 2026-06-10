import type { Metadata } from "next";
import { User } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { RoleSwitcher } from "@/components/ui/RoleSwitcher";

export const metadata: Metadata = {
  title: "Profile",
  description: "ExamIQ demo profile.",
};

export default function ProfilePage() {
  return (
    <DashboardShell title="Profile" subtitle="Demo account settings and role preview." activeHref="/dashboard/profile">
      <div className="max-w-2xl rounded-xl border border-white/8 bg-white/[0.025] p-6">
        <User size={24} className="text-cyan-300" />
        <h2 className="mt-4 text-lg font-semibold text-white">Demo learner profile</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          Real authentication, profile fields, notification preferences and billing data will be connected in Phase 2.
        </p>
        <div className="mt-6">
          <RoleSwitcher />
        </div>
      </div>
    </DashboardShell>
  );
}
