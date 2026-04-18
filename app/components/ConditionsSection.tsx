import type { Dashboard } from "@/lib/types";
import { LineChart } from "./LineChart";
import { SectionHeader } from "./SectionHeader";

export function ConditionsSection({ data }: { data: Dashboard }) {
  const { solarWind } = data;
  return (
    <section
      id="conditions"
      className="px-4 py-10 scroll-mt-20"
    >
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-5">
        <Card title="Solar wind speed (km/s)">
          <LineChart
            points={solarWind.speed.map((p) => ({ time: p.time, value: p.speed ?? 0 }))}
          />
          <Latest label="km/s" value={solarWind.speed.at(-1)?.speed} />
        </Card>
        <Card title="Solar wind density (p/cc)">
          <LineChart
            points={solarWind.density.map((p) => ({ time: p.time, value: p.density ?? 0 }))}
          />
          <Latest label="p/cc" value={solarWind.density.at(-1)?.density} />
        </Card>
        <Card title="Solar wind Bz (nT)">
          <LineChart
            points={solarWind.bz.map((p) => ({ time: p.time, value: p.bz ?? 0 }))}
            showZero
            stroke="#a78bfa"
            valueFormatter={(v) => v.toFixed(1)}
          />
          <Latest label="nT" value={solarWind.bz.at(-1)?.bz} precision={1} />
        </Card>
        <Card title="Solar wind Bt (nT)">
          <LineChart
            points={solarWind.bt.map((p) => ({ time: p.time, value: p.bt ?? 0 }))}
            stroke="#facc15"
            valueFormatter={(v) => v.toFixed(1)}
          />
          <Latest label="nT" value={solarWind.bt.at(-1)?.bt} precision={1} />
        </Card>
      </div>
    </section>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-aurora-card border border-aurora-line p-5">
      <SectionHeader title={title} />
      {children}
    </div>
  );
}

function Latest({
  label,
  value,
  precision = 0,
}: {
  label: string;
  value?: number;
  precision?: number;
}) {
  if (value === undefined) return null;
  return (
    <div className="mt-2 text-center text-aurora-muted text-sm">
      latest: <span className="text-white font-semibold">{value.toFixed(precision)}</span>{" "}
      {label}
    </div>
  );
}
