import type { Dashboard } from "@/lib/types";
import {
  KpBarChart,
  dailyKpToBars,
  kpHistoryToBars,
  kpUpcomingToBars,
} from "./KpBarChart";
import { SectionHeader } from "./SectionHeader";

export function ForecastSection({ data }: { data: Dashboard }) {
  const history = kpHistoryToBars(data.kpHistory);
  const upcoming = kpUpcomingToBars(data.kpUpcoming);
  const daily = dailyKpToBars(data.kpLongTerm);

  return (
    <section
      id="forecast"
      className="px-4 py-10 scroll-mt-20 bg-aurora-card/30"
    >
      <div className="max-w-6xl mx-auto space-y-10">
        <div id="probability" className="rounded-2xl bg-aurora-card border border-aurora-line p-5 md:p-8">
          <SectionHeader
            title="Viewing probability"
            subtitle={`${data.location.name}${data.location.region ? ", " + data.location.region : ""}`}
          />
          <ProbabilityList samples={data.shortTerm} />
        </div>

        <div id="clouds" className="rounded-2xl bg-aurora-card border border-aurora-line p-5 md:p-8">
          <SectionHeader title="Cloud coverage tonight" subtitle="Lower is better" />
          <CloudList hours={data.cloudCoverTonight} timezone={data.location.timezone} />
        </div>

        <div id="kp-history" className="rounded-2xl bg-aurora-card border border-aurora-line p-5 md:p-8">
          <SectionHeader title="KP Index — History" subtitle="KP Index Earlier" />
          <KpBarChart data={history} highlightNowIndex={history.length - 1} />
        </div>

        <div id="kp-upcoming" className="rounded-2xl bg-aurora-card border border-aurora-line p-5 md:p-8">
          <SectionHeader title="KP Index — Upcoming" subtitle="Next hours" />
          <KpBarChart data={upcoming} />
        </div>

        <div id="kp-week" className="rounded-2xl bg-aurora-card border border-aurora-line p-5 md:p-8">
          <SectionHeader title="KP Index — Upcoming days" subtitle="One-week outlook" />
          <KpBarChart data={daily} />
        </div>
      </div>
    </section>
  );
}

function ProbabilityList({
  samples,
}: {
  samples: Dashboard["shortTerm"];
}) {
  const max = Math.max(5, ...samples.map((s) => s.probability));
  return (
    <ul className="max-w-md mx-auto divide-y divide-aurora-line">
      {samples.map((s) => (
        <li key={s.offsetMinutes} className="flex items-center gap-4 py-2">
          <span className="w-24 text-right text-aurora-muted">
            {s.offsetMinutes === 0 ? "Now" : `${s.offsetMinutes} mins`}
          </span>
          <span
            className="inline-block w-1 self-stretch"
            style={{ background: "#4ade80" }}
          />
          <span className="text-lg font-semibold">
            {s.probability}%
          </span>
          <span
            className="flex-1 h-2 rounded-full bg-aurora-line overflow-hidden"
            aria-hidden
          >
            <span
              className="block h-full bg-aurora-green"
              style={{ width: `${(s.probability / max) * 100}%` }}
            />
          </span>
        </li>
      ))}
    </ul>
  );
}

function CloudList({
  hours,
  timezone,
}: {
  hours: Dashboard["cloudCoverTonight"];
  timezone: string;
}) {
  if (hours.length === 0) {
    return <div className="text-center text-aurora-muted">Weather unavailable</div>;
  }
  return (
    <ul className="max-w-md mx-auto divide-y divide-aurora-line">
      {hours.map((h) => {
        const d = new Date(h.time);
        const hh = d.toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: timezone,
        });
        return (
          <li key={h.time} className="flex items-center gap-4 py-2">
            <span className="w-20 text-right text-aurora-muted">{hh}</span>
            <span
              className="inline-block w-1 self-stretch"
              style={{ background: "#3a404c" }}
            />
            <span className="text-lg font-semibold" style={{ color: cloudColor(h.cloudCover) }}>
              {Math.round(h.cloudCover)}%
            </span>
            <span className="text-aurora-muted">({label(h.cloudCover)})</span>
          </li>
        );
      })}
    </ul>
  );
}

function cloudColor(cc: number): string {
  if (cc >= 75) return "#ef4444";
  if (cc >= 40) return "#facc15";
  return "#4ade80";
}

function label(cc: number): string {
  if (cc >= 75) return "Overcast";
  if (cc >= 40) return "Cloudy";
  if (cc >= 15) return "Partly clear";
  return "Great";
}
