import { probabilityColor, probabilityLabel } from "@/lib/probability";
import type { Dashboard } from "@/lib/types";
import { kpColor } from "./KpBarChart";

export function NowSection({ data }: { data: Dashboard }) {
  const { now, location, camera } = data;
  const pct = Math.round(now.visibleProbability);
  const color = probabilityColor(pct);
  const label = probabilityLabel(pct);
  const best24Color = probabilityColor(now.best24h);

  return (
    <section
      id="now"
      className="min-h-[calc(100vh-4rem)] flex items-center px-4 py-8 scroll-mt-20"
    >
      <div className="max-w-6xl mx-auto w-full grid md:grid-cols-2 gap-8 items-center">
        <div>
          <div className="text-aurora-muted uppercase tracking-wider text-sm md:text-base font-medium">
            Aurora probability now
          </div>

          {/* Main probability number */}
          <div className="flex items-end gap-3 mt-1 flex-wrap">
            <div
              className="font-black leading-none"
              style={{ fontSize: "clamp(5rem, 16vw, 12rem)", color }}
            >
              {pct}%
            </div>
          </div>
          <div className="text-lg md:text-2xl text-aurora-muted mt-1">
            in {location.name}
            {location.region ? `, ${location.region}` : ""}
          </div>

          {/* Status label */}
          <div
            className="mt-3 text-xl md:text-2xl font-semibold"
            style={{ color }}
          >
            {label}
          </div>
          <p className="mt-2 text-base md:text-lg text-aurora-muted max-w-xl">
            {narrative(now, location.name)}
          </p>

          {/* Stat tiles */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
            <Tile
              label="KP Index"
              value={now.kp.toFixed(2).replace(".", ",")}
              color={kpColor(now.kp)}
            />
            <Tile
              label="Cloud cover"
              value={`${Math.round(now.cloudCover)}%`}
              color={cloudColor(now.cloudCover)}
            />
            <Tile
              label="Darkness"
              value={now.isDay ? "Daylight" : "Dark"}
              color={now.isDay ? "#facc15" : "#a78bfa"}
            />
            <Tile
              label="Best tonight"
              value={`${now.best24h}%`}
              color={best24Color}
              sublabel={now.best24h > pct ? `KP ${now.best24hKp.toFixed(1)}` : undefined}
            />
          </div>

          {now.rIndexLabel && (
            <div className="mt-4 text-sm text-aurora-muted">
              FMI R-index:{" "}
              <span className="text-white">{now.rIndex?.toFixed(1)}</span>{" "}
              — {now.rIndexLabel}
            </div>
          )}
        </div>

        {/* Live sky camera */}
        <div className="rounded-2xl overflow-hidden border border-aurora-line bg-aurora-card">
          <a
            href={camera.url}
            target="_blank"
            rel="noreferrer"
            className="block group"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={camera.url}
              alt={`${camera.name} all-sky camera`}
              className="w-full aspect-square object-cover bg-black"
              loading="eager"
            />
            <div className="px-4 py-3 flex items-center justify-between">
              <div>
                <div className="font-semibold">{camera.name}</div>
                <div className="text-xs text-aurora-muted">
                  {camera.source} — closest camera
                </div>
              </div>
              <div className="text-aurora-muted group-hover:text-white transition text-lg">
                ↗
              </div>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}

function Tile({
  label,
  value,
  color,
  sublabel,
}: {
  label: string;
  value: string;
  color: string;
  sublabel?: string;
}) {
  return (
    <div className="rounded-xl bg-aurora-card border border-aurora-line p-3">
      <div className="text-xs uppercase tracking-wider text-aurora-muted">
        {label}
      </div>
      <div className="text-2xl md:text-3xl font-bold mt-1 leading-tight" style={{ color }}>
        {value}
      </div>
      {sublabel && (
        <div className="text-xs text-aurora-muted mt-0.5">{sublabel}</div>
      )}
    </div>
  );
}

function cloudColor(cc: number): string {
  if (cc >= 75) return "#ef4444";
  if (cc >= 40) return "#facc15";
  return "#4ade80";
}

function narrative(
  now: {
    visibleProbability: number;
    kp: number;
    cloudCover: number;
    isDay: boolean;
    best24h: number;
  },
  name: string,
): string {
  if (now.isDay) {
    if (now.best24h >= 35) {
      return `Daylight now, but tonight looks promising (${now.best24h}% peak). Check again after dusk.`;
    }
    return `Daylight in ${name}. Check again after dark.`;
  }
  if (now.visibleProbability >= 60) {
    return `Good chance of seeing the Northern Lights in ${name}. Get to a dark spot away from city lights and look north.`;
  }
  if (now.visibleProbability >= 35) {
    return `Some chance of seeing aurora in ${name}. A dark location away from city lights will improve your odds significantly.`;
  }
  if (now.cloudCover >= 75) {
    return `Heavy cloud cover in ${name} is blocking the view. Aurora may be active above the clouds.`;
  }
  if (now.kp < 3) {
    return `Geomagnetic activity is low right now. Aurora is unlikely to reach this far south.`;
  }
  return `Low chance of seeing the Northern Lights in ${name} right now. Conditions may improve.`;
}
