import type { Dashboard } from "@/lib/types";
import { kpColor } from "./KpBarChart";

export function NowSection({ data }: { data: Dashboard }) {
  const { now, location, camera } = data;
  const pct = Math.round(now.visibleProbability);
  return (
    <section
      id="now"
      className="min-h-[calc(100vh-4rem)] flex items-center px-4 py-8 scroll-mt-20"
    >
      <div className="max-w-6xl mx-auto w-full grid md:grid-cols-2 gap-8 items-center">
        <div>
          <div className="text-aurora-muted uppercase tracking-wider text-sm md:text-base">
            Aurora probability now
          </div>
          <div className="flex items-baseline gap-4 mt-2 flex-wrap">
            <div
              className="font-black leading-none"
              style={{ fontSize: "clamp(4rem, 14vw, 11rem)", color: kpColor(now.kp) }}
            >
              {pct}%
            </div>
            <div className="text-xl md:text-2xl text-aurora-muted">
              in {location.name}
              {location.region ? `, ${location.region}` : ""}
            </div>
          </div>
          <p className="mt-4 text-base md:text-xl text-aurora-muted max-w-xl">
            {narrative(now, location.name)}
          </p>
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
              label="Aurora activity"
              value={`${Math.round(now.ovationProbability)}%`}
              color={kpColor(now.ovationProbability / 11)}
            />
          </div>
          {now.rIndexLabel && (
            <div className="mt-4 text-sm text-aurora-muted">
              FMI R-index: <span className="text-white">{now.rIndex?.toFixed(1)}</span> —{" "}
              {now.rIndexLabel}
            </div>
          )}
        </div>
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
              <div className="text-aurora-muted group-hover:text-white transition">↗</div>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}

function Tile({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-xl bg-aurora-card border border-aurora-line p-3">
      <div className="text-xs uppercase tracking-wider text-aurora-muted">
        {label}
      </div>
      <div className="text-2xl md:text-3xl font-bold mt-1" style={{ color }}>
        {value}
      </div>
    </div>
  );
}

function cloudColor(cc: number): string {
  if (cc >= 75) return "#ef4444";
  if (cc >= 40) return "#facc15";
  return "#4ade80";
}

function narrative(
  now: { visibleProbability: number; kp: number; cloudCover: number; isDay: boolean },
  name: string,
): string {
  if (now.isDay) {
    return `Daylight in ${name}. Aurora cannot be seen now even with activity — check again after dusk.`;
  }
  if (now.visibleProbability >= 40) {
    return `Strong chance of seeing the Northern Lights in ${name}. Look north.`;
  }
  if (now.visibleProbability >= 10) {
    return `Some chance of seeing the Northern Lights in ${name}. Get to a dark place away from city lights.`;
  }
  if (now.cloudCover >= 75) {
    return `Sky is overcast in ${name}. Clouds would block any aurora even if activity rises.`;
  }
  if (now.kp < 3) {
    return `Geomagnetic activity is low. Aurora is unlikely to reach ${name} right now.`;
  }
  return `Low chance of seeing the Northern Lights in ${name} right now.`;
}
