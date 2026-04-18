import type { KpPoint, DailyKp } from "@/lib/types";

type BarItem = { label: string; value: number; sublabel?: string };

export function KpBarChart({
  data,
  highlightNowIndex,
  maxY = 9,
  height = 260,
  className = "",
}: {
  data: BarItem[];
  highlightNowIndex?: number;
  maxY?: number;
  height?: number;
  className?: string;
}) {
  if (data.length === 0) {
    return (
      <div className="text-center text-aurora-muted py-10">No data available</div>
    );
  }
  const width = 600;
  const padLeft = 40;
  const padBottom = 40;
  const padTop = 30;
  const padRight = 16;
  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;
  const barW = chartW / data.length;
  const gap = Math.max(4, barW * 0.15);

  const yTicks = [0, 2, 4, 6, 8].filter((v) => v <= maxY);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={`w-full h-auto ${className}`}
      role="img"
      aria-label="Kp index chart"
    >
      {yTicks.map((t) => {
        const y = padTop + chartH - (t / maxY) * chartH;
        return (
          <g key={t}>
            <line
              x1={padLeft}
              x2={width - padRight}
              y1={y}
              y2={y}
              stroke="#2a2f3a"
              strokeWidth={1}
            />
            <text
              x={padLeft - 6}
              y={y + 4}
              textAnchor="end"
              className="fill-aurora-muted"
              fontSize={14}
            >
              {t.toFixed(1).replace(".", ",")}
            </text>
          </g>
        );
      })}
      <line
        x1={padLeft}
        x2={padLeft}
        y1={padTop}
        y2={padTop + chartH}
        stroke="#3a404c"
      />
      {data.map((d, i) => {
        const h = Math.max(2, (Math.min(d.value, maxY) / maxY) * chartH);
        const x = padLeft + i * barW + gap / 2;
        const y = padTop + chartH - h;
        const color = kpColor(d.value);
        const isHighlight = i === highlightNowIndex;
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={barW - gap}
              height={h}
              fill={color}
              stroke={isHighlight ? "#ffffff" : "none"}
              strokeWidth={isHighlight ? 2 : 0}
              rx={2}
            />
            <text
              x={x + (barW - gap) / 2}
              y={y - 6}
              textAnchor="middle"
              className="fill-white"
              fontSize={15}
              fontWeight={600}
            >
              {d.value.toFixed(2).replace(".", ",")}
            </text>
            <text
              x={x + (barW - gap) / 2}
              y={padTop + chartH + 20}
              textAnchor="middle"
              className="fill-aurora-muted"
              fontSize={14}
            >
              {d.label}
            </text>
            {d.sublabel && (
              <text
                x={x + (barW - gap) / 2}
                y={padTop + chartH + 35}
                textAnchor="middle"
                className="fill-aurora-muted"
                fontSize={11}
              >
                {d.sublabel}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export function kpColor(k: number): string {
  if (k >= 5) return "#ef4444"; // red
  if (k >= 3) return "#facc15"; // yellow
  return "#4ade80"; // green
}

export function kpHistoryToBars(points: KpPoint[]): BarItem[] {
  return points.map((p, i) => {
    const d = new Date(p.time);
    const hh = d.getUTCHours().toString().padStart(2, "0");
    const mm = d.getUTCMinutes().toString().padStart(2, "0");
    const isLast = i === points.length - 1;
    return {
      label: isLast ? "Now" : `${hh}:${mm}`,
      value: p.kp,
    };
  });
}

export function kpUpcomingToBars(points: KpPoint[]): BarItem[] {
  return points.map((p) => {
    const d = new Date(p.time);
    const hh = d.getUTCHours().toString().padStart(2, "0");
    const mm = d.getUTCMinutes().toString().padStart(2, "0");
    const day = d.toLocaleDateString("en", { weekday: "short", day: "numeric" });
    return {
      label: `${hh}:${mm}`,
      sublabel: hh === "00" ? day : undefined,
      value: p.kp,
    };
  });
}

export function dailyKpToBars(days: DailyKp[]): BarItem[] {
  return days.map((d) => {
    const dt = new Date(d.date);
    return {
      label: dt.toLocaleDateString("en", { weekday: "short", day: "numeric" }),
      value: d.kp,
    };
  });
}
