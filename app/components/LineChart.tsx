type Point = { time: string; value: number };

export function LineChart({
  points,
  stroke = "#4ade80",
  height = 160,
  className = "",
  yDomain,
  valueFormatter = (v) => v.toFixed(0),
  showZero = false,
}: {
  points: Point[];
  stroke?: string;
  height?: number;
  className?: string;
  yDomain?: [number, number];
  valueFormatter?: (v: number) => string;
  showZero?: boolean;
}) {
  if (points.length === 0) {
    return (
      <div className="text-center text-aurora-muted py-6">No data available</div>
    );
  }
  const width = 600;
  const padLeft = 44;
  const padRight = 10;
  const padTop = 12;
  const padBottom = 26;
  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const values = points.map((p) => p.value);
  const minV = yDomain?.[0] ?? Math.min(...values);
  const maxV = yDomain?.[1] ?? Math.max(...values);
  const span = maxV - minV || 1;

  const toX = (i: number) => padLeft + (i / Math.max(1, points.length - 1)) * chartW;
  const toY = (v: number) => padTop + chartH - ((v - minV) / span) * chartH;

  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${toX(i).toFixed(1)},${toY(p.value).toFixed(1)}`)
    .join(" ");

  const yTicks = [minV, (minV + maxV) / 2, maxV];

  const xLabels = pickXLabels(points);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={`w-full h-auto ${className}`}
      role="img"
    >
      {yTicks.map((t, i) => {
        const y = toY(t);
        return (
          <g key={i}>
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
              fontSize={11}
            >
              {valueFormatter(t)}
            </text>
          </g>
        );
      })}
      {showZero && minV < 0 && maxV > 0 && (
        <line
          x1={padLeft}
          x2={width - padRight}
          y1={toY(0)}
          y2={toY(0)}
          stroke="#4b5563"
          strokeDasharray="3 3"
        />
      )}
      <path d={path} stroke={stroke} strokeWidth={1.5} fill="none" />
      {xLabels.map((l, i) => (
        <text
          key={i}
          x={toX(l.index)}
          y={height - 8}
          textAnchor="middle"
          className="fill-aurora-muted"
          fontSize={11}
        >
          {l.label}
        </text>
      ))}
    </svg>
  );
}

function pickXLabels(points: Point[]): { index: number; label: string }[] {
  const n = points.length;
  if (n === 0) return [];
  const count = Math.min(4, n);
  const out: { index: number; label: string }[] = [];
  for (let i = 0; i < count; i++) {
    const idx = Math.round((i * (n - 1)) / Math.max(1, count - 1));
    const d = new Date(points[idx].time);
    const hh = d.getUTCHours().toString().padStart(2, "0");
    const mm = d.getUTCMinutes().toString().padStart(2, "0");
    out.push({ index: idx, label: `${hh}:${mm}` });
  }
  return out;
}
