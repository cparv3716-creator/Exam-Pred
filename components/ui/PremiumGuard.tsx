"use client";

import { isPremium, useRoleStore } from "@/stores/use-role-store";
import { PlanLockCard } from "@/components/ui/PlanLockCard";

export function PremiumGuard({
  title,
  description,
  features,
  children,
}: {
  title: string;
  description: string;
  features?: string[];
  children: React.ReactNode;
}) {
  const role = useRoleStore((state) => state.role);

  if (isPremium(role)) {
    return children;
  }

  return <PlanLockCard title={title} description={description} features={features} />;
}
