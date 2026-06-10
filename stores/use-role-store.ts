"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Role } from "@/types/examiq";

type RoleState = {
  role: Role;
  setRole: (role: Role) => void;
  signOut: () => void;
};

export const roles: Role[] = ["guest", "free", "premium", "admin"];

export const roleLabels: Record<Role, string> = {
  guest: "Guest",
  free: "Free",
  premium: "Premium",
  admin: "Admin",
};

export const useRoleStore = create<RoleState>()(
  persist(
    (set) => ({
      role: "guest",
      setRole: (role) => set({ role }),
      signOut: () => set({ role: "guest" }),
    }),
    {
      name: "examiq-demo-role",
    },
  ),
);

export function isSignedIn(role: Role) {
  return role !== "guest";
}

export function isPremium(role: Role) {
  return role === "premium" || role === "admin";
}

export function isAdmin(role: Role) {
  return role === "admin";
}
