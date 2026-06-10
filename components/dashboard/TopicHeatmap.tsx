import type { HeatmapData } from "@/types/examiq";

function cellColor(value: number) {
  const opacity = 0.12 + (value / 100) * 0.85;
  return `rgba(34, 211, 238, ${opacity.toFixed(2)})`;
}

export function TopicHeatmap({ data }: { data: HeatmapData }) {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[560px]">
        <div className="flex items-center gap-1 pl-36">
          {data.years.map((year) => (
            <div key={year} className="flex-1 text-center text-xs font-medium text-slate-500">
              {year}
            </div>
          ))}
        </div>
        <div className="mt-2 space-y-1.5">
          {data.rows.map((row) => (
            <div key={row.topic} className="flex items-center gap-1">
              <div className="w-36 truncate pr-2 text-sm text-slate-300">{row.topic}</div>
              {row.values.map((value, index) => (
                <div key={`${row.topic}-${data.years[index]}`} className="group relative flex-1">
                  <div
                    className="flex h-10 items-center justify-center rounded-md text-[11px] font-semibold text-white/90 transition-transform hover:scale-105"
                    style={{ background: cellColor(value) }}
                  >
                    {value}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="mt-5 flex items-center gap-3">
          <span className="text-xs text-slate-500">Low</span>
          <div className="flex h-2.5 flex-1 overflow-hidden rounded-full">
            {[20, 40, 60, 80, 100].map((value) => (
              <div key={value} className="flex-1" style={{ background: cellColor(value) }} />
            ))}
          </div>
          <span className="text-xs text-slate-500">High</span>
        </div>
      </div>
    </div>
  );
}
