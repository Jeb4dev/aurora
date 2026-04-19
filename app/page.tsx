import { buildDashboard } from "@/lib/dashboard";
import { CameraSection } from "./components/CameraSection";
import { ConditionsSection } from "./components/ConditionsSection";
import { ExplainerSection } from "./components/ExplainerSection";
import { ForecastSection } from "./components/ForecastSection";
import { InfoScreenRotator } from "./components/InfoScreenRotator";
import { Nav } from "./components/Nav";
import { NowSection } from "./components/NowSection";

export const revalidate = 300;

type SearchParams = Promise<{
  city?: string | string[];
  rotate?: string | string[];
  interval?: string | string[];
}>;

function flat(v: string | string[] | undefined): string | undefined {
  if (!v) return undefined;
  return Array.isArray(v) ? v[0] : v;
}

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const city = flat(sp.city);
  const rotate = flat(sp.rotate);
  const interval = Number(flat(sp.interval) ?? "15");
  const rotateEnabled = rotate === "1" || rotate === "true";

  const data = await buildDashboard(city);

  const locationLabel = `${data.location.name}${data.location.region ? ", " + data.location.region : ""}`;

  return (
    <>
      <Nav location={locationLabel} />
      <main>
        <NowSection data={data} />
        <ForecastSection data={data} />
        <CameraSection data={data} />
        <ConditionsSection data={data} />
        <ExplainerSection latitude={data.location.latitude} />
        <Footer data={data} />
      </main>
      <InfoScreenRotator enabled={rotateEnabled} intervalSec={Math.max(5, interval)} />
    </>
  );
}

function Footer({ data }: { data: Awaited<ReturnType<typeof buildDashboard>> }) {
  const updated = new Date(data.generatedAt);
  return (
    <footer className="text-center text-aurora-muted text-xs md:text-sm px-4 py-8 space-y-1">
      <div>
        Data: NOAA SWPC (KP, solar wind, OVATION), FMI MIRACLE / RWC, Open-Meteo.
      </div>
      <div>
        Updated{" "}
        {updated.toLocaleString("en-GB", {
          timeZone: data.location.timezone,
          hour: "2-digit",
          minute: "2-digit",
          day: "2-digit",
          month: "short",
        })}{" "}
        ({data.location.timezone})
      </div>
      {data.errors.length > 0 && (
        <div className="text-aurora-yellow">
          Some sources unavailable: {data.errors.join(", ")}
        </div>
      )}
      <div>
        Change location: add{" "}
        <code className="text-white">?city=helsinki</code> to the URL. For info
        screen rotation:{" "}
        <code className="text-white">?rotate=1&interval=15</code>.
      </div>
    </footer>
  );
}
