"use client";

import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { trendByYear, topicProbability } from "@/data/analytics";

export function AnalyticsChartCard({
  title,
  subtitle,
  variant = "area",
}: {
  title: string;
  subtitle?: string;
  variant?: "area" | "bar";
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="aurora-surface p-6">
      <div>
        <h3 className="text-base font-bold" style={{ color: "var(--aurora-text-primary)" }}>{title}</h3>
        {subtitle && <p className="mt-1 text-sm" style={{ color: "var(--aurora-text-secondary)" }}>{subtitle}</p>}
      </div>
      <div className="mt-5 h-72 min-h-72">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
            {variant === "area" ? (
              <AreaChart data={trendByYear}>
                <defs>
                  <linearGradient id="arithmetic" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(15,23,42,0.08)" vertical={false} />
                <XAxis dataKey="year" stroke="#64748b" tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "#FFFFFF", border: "1px solid rgba(148,163,184,0.45)", borderRadius: 12, color: "#0F172A", boxShadow: "0 8px 24px rgba(15,23,42,0.12)" }} />
                <Area type="monotone" dataKey="arithmetic" stroke="#06B6D4" fill="url(#arithmetic)" strokeWidth={2} />
                <Area type="monotone" dataKey="algebra" stroke="#8B5CF6" fill="transparent" strokeWidth={2} />
              </AreaChart>
            ) : (
              <BarChart data={topicProbability.slice(0, 6)}>
                <CartesianGrid stroke="rgba(15,23,42,0.08)" vertical={false} />
                <XAxis dataKey="topic" stroke="#64748b" tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "#FFFFFF", border: "1px solid rgba(148,163,184,0.45)", borderRadius: 12, color: "#0F172A", boxShadow: "0 8px 24px rgba(15,23,42,0.12)" }} />
                <Bar dataKey="probability" fill="#4F46E5" radius={[6, 6, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        ) : (
          <div className="h-full rounded-lg border p-4" style={{ borderColor: "var(--aurora-border-soft)", background: "var(--aurora-background-soft)" }}>
            <div className="skeleton h-full rounded-md opacity-70" />
          </div>
        )}
      </div>
    </div>
  );
}
