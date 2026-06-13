"use client";

import type { InputHTMLAttributes, ReactNode } from "react";

export function AuthInput({
  label,
  id,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  id: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--aurora-text-muted)" }}>
        {label}
      </label>
      <input
        id={id}
        className="aurora-focus-ring mt-1.5 w-full rounded-xl border px-4 py-3 text-sm"
        style={{
          borderColor: "var(--aurora-border-strong)",
          background: "var(--aurora-surface)",
          color: "var(--aurora-text-primary)",
        }}
        {...props}
      />
    </div>
  );
}

export function AuthMessage({ tone = "info", children }: { tone?: "info" | "success" | "error"; children: ReactNode }) {
  const colors = {
    info: "var(--aurora-text-secondary)",
    success: "var(--aurora-success)",
    error: "var(--aurora-danger)",
  };

  return (
    <p
      className="rounded-xl border px-4 py-3 text-sm leading-6"
      style={{
        borderColor: "var(--aurora-border-soft)",
        background: "rgba(255,255,255,0.66)",
        color: colors[tone],
      }}
    >
      {children}
    </p>
  );
}
