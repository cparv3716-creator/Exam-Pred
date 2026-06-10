export function ProbabilityRing({
  value = 0,
  size = 64,
  label,
  accent = "#22d3ee",
}: {
  value?: number;
  size?: number;
  label?: string;
  accent?: string;
}) {
  const stroke = 5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={accent}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeWidth={stroke}
          style={{
            filter: `drop-shadow(0 0 10px ${accent}88)`,
            transition: "stroke-dashoffset 0.8s cubic-bezier(0.22,1,0.36,1)",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-semibold text-white">{value}%</span>
        {label && <span className="text-[9px] uppercase tracking-wide text-slate-500">{label}</span>}
      </div>
    </div>
  );
}

export function ProbabilityBar({
  value = 0,
  accent = "#22d3ee",
  showValue = true,
}: {
  value?: number;
  accent?: string;
  showValue?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full"
          style={{
            width: `${value}%`,
            background: `linear-gradient(90deg, ${accent}, ${accent}aa)`,
            boxShadow: `0 0 22px -8px ${accent}`,
            transition: "width 0.8s cubic-bezier(0.22,1,0.36,1)",
          }}
        />
      </div>
      {showValue && <span className="w-10 text-right text-xs font-semibold text-slate-300">{value}%</span>}
    </div>
  );
}
