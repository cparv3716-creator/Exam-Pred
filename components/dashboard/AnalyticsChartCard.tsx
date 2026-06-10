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
    <div className="rounded-xl border border-white/8 bg-white/[0.025] p-6">
      <div>
        <h3 className="text-base font-semibold text-white">{title}</h3>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      <div className="mt-5 h-72 min-h-72">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
            {variant === "area" ? (
              <AreaChart data={trendByYear}>
                <defs>
                  <linearGradient id="arithmetic" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.55} />
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="year" stroke="#64748b" tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "#070b16", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                <Area type="monotone" dataKey="arithmetic" stroke="#22d3ee" fill="url(#arithmetic)" strokeWidth={2} />
                <Area type="monotone" dataKey="algebra" stroke="#a855f7" fill="transparent" strokeWidth={2} />
              </AreaChart>
            ) : (
              <BarChart data={topicProbability.slice(0, 6)}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="topic" stroke="#64748b" tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "#070b16", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                <Bar dataKey="probability" fill="#22d3ee" radius={[6, 6, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        ) : (
          <div className="h-full rounded-lg border border-white/8 bg-white/[0.025] p-4">
            <div className="skeleton h-full rounded-md opacity-70" />
          </div>
        )}
      </div>
    </div>
  );
}
