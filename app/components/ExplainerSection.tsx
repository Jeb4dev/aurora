import { kpThresholdFor } from "@/lib/probability";

export function ExplainerSection({ latitude }: { latitude: number }) {
  const threshold = kpThresholdFor(latitude);
  return (
    <section id="guide" className="px-4 py-10 scroll-mt-20 bg-aurora-card/30">
      <div className="max-w-6xl mx-auto">
        <h2 className="uppercase font-extrabold tracking-wider text-xl md:text-2xl text-center mb-8">
          How to read this page
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          <Card title="KP Index" icon="◆">
            <p>
              The <strong>Planetary K-index</strong> is a 0–9 scale measuring
              global geomagnetic activity. Higher = stronger aurora.
            </p>
            <Table
              rows={[
                ["KP 0–2", "Polar regions only"],
                ["KP 3", "≥ 64 °N"],
                [`KP ${threshold}+`, "Your latitude"],
                ["KP 7–9", "Visible far south"],
              ]}
            />
            <p className="mt-2 text-xs text-aurora-muted">
              At your latitude, aurora becomes likely around KP {threshold}.
            </p>
          </Card>

          <Card title="Viewing probability" icon="◉">
            <p>
              Our probability combines the NOAA{" "}
              <strong>OVATION aurora model</strong> (activity at your exact
              lat/lon), the KP threshold for your latitude, and real-time{" "}
              <strong>cloud cover</strong>. 0 % during daylight.
            </p>
            <ColorScale
              items={[
                { color: "#6b7280", label: "Very low — unlikely" },
                { color: "#4ade80", label: "Low — faint on horizon" },
                { color: "#facc15", label: "Moderate — worth looking" },
                { color: "#f97316", label: "Good — clearly visible" },
                { color: "#ef4444", label: "High — impressive display" },
                { color: "#a78bfa", label: "Extraordinary — rare event" },
              ]}
            />
          </Card>

          <Card title="Solar wind Bz" icon="↕">
            <p>
              <strong>Bz</strong> is the north–south component of the
              interplanetary magnetic field (IMF). When Bz is{" "}
              <span className="text-aurora-red font-semibold">negative</span> it
              couples with Earth&apos;s field and injects energy into the
              magnetosphere, powering aurora.
            </p>
            <p className="mt-2">
              A sustained Bz of −5 nT or lower is a good sign. Below −10 nT
              → strong storm likely.
            </p>
          </Card>

          <Card title="Solar wind speed" icon="→">
            <p>
              The solar wind constantly streams from the Sun. Normal speed is{" "}
              <strong>300–500 km/s</strong>. Speeds above 600 km/s often
              accompany solar events and can enhance aurora even at lower
              latitudes.
            </p>
          </Card>

          <Card title="Solar wind density" icon="·">
            <p>
              Measured in <strong>protons per cubic centimetre (p/cc)</strong>.
              Higher density during a CME or solar stream compresses
              Earth&apos;s magnetosphere and can trigger geomagnetic storms
              even if Bz stays positive.
            </p>
            <p className="mt-2">Typical baseline: 3–10 p/cc.</p>
          </Card>

          <Card title="Sky camera" icon="◎">
            <p>
              The FMI MIRACLE network operates all-sky cameras across Finland.
              The camera shown is the closest one to your location. Images
              update roughly every minute during dark hours.
            </p>
            <p className="mt-2">
              Bright arcs or curtains along the north horizon, or coloured bands
              overhead, indicate active aurora.
            </p>
          </Card>
        </div>

        <div className="mt-8 p-5 rounded-xl bg-aurora-card border border-aurora-line text-aurora-muted text-sm max-w-3xl mx-auto">
          <strong className="text-white">Tip for info-screen mode:</strong> Add{" "}
          <code className="text-aurora-accent">?rotate=1&interval=20</code> to
          the URL to automatically cycle between sections every 20 seconds.
          Change city with{" "}
          <code className="text-aurora-accent">?city=helsinki</code>.
        </div>
      </div>
    </section>
  );
}

function Card({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-aurora-card border border-aurora-line p-5 text-sm text-gray-300 space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-aurora-accent text-lg">{icon}</span>
        <h3 className="font-bold text-white text-base uppercase tracking-wide">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

function Table({ rows }: { rows: [string, string][] }) {
  return (
    <table className="w-full mt-2 text-xs">
      <tbody>
        {rows.map(([kp, desc]) => (
          <tr key={kp} className="border-t border-aurora-line">
            <td className="py-1 font-semibold text-white pr-3">{kp}</td>
            <td className="py-1 text-aurora-muted">{desc}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ColorScale({ items }: { items: { color: string; label: string }[] }) {
  return (
    <ul className="mt-2 space-y-1">
      {items.map((item) => (
        <li key={item.color} className="flex items-center gap-2 text-xs">
          <span
            className="inline-block w-3 h-3 rounded-full flex-shrink-0"
            style={{ background: item.color }}
          />
          <span style={{ color: item.color }}>{item.label}</span>
        </li>
      ))}
    </ul>
  );
}
