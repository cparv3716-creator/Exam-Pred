import type { HeatmapData } from "@/types/examiq";

function cellColor(value: number) {
  const opacity = 0.1 + (value / 100) * 0.85;
  return `rgba(79, 70, 229, ${opacity.toFixed(2)})`;
}

function cellText(value: number) {
  return value >= 55 ? "rgba(255,255,255,0.95)" : "#0F172A";
}

export function TopicHeatmap({ data }: { data: HeatmapData }) {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[560px]">
        <div className="flex items-center gap-1 pl-36">
          {data.years.map((year) => (
            <div key={year} className="flex-1 text-center text-xs font-medium" style={{ color: "var(--aurora-text-muted)" }}>
              {year}
            </div>
          ))}
        </div>
        <div className="mt-2 space-y-1.5">
          {data.rows.map((row) => (
            <div key={row.topic} className="flex items-center gap-1">
              <div className="w-36 truncate pr-2 text-sm" style={{ color: "var(--aurora-text-secondary)" }}>{row.topic}</div>
              {row.values.map((value, index) => (
                <div key={`${row.topic}-${data.years[index]}`} className="group relative flex-1">
                  <div
                    className="flex h-10 items-center justify-center rounded-md text-[11px] font-semibold transition-transform hover:scale-105"
                    style={{ background: cellColor(value), color: cellText(value) }}
                  >
                    {value}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="mt-5 flex items-center gap-3">
          <span className="text-xs" style={{ color: "var(--aurora-text-muted)" }}>Low</span>
          <div className="flex h-2.5 flex-1 overflow-hidden rounded-full">
            {[20, 40, 60, 80, 100].map((value) => (
              <div key={value} className="flex-1" style={{ background: cellColor(value) }} />
            ))}
          </div>
          <span className="text-xs" style={{ color: "var(--aurora-text-muted)" }}>High</span>
        </div>
      </div>
    </div>
  );
}
