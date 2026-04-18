import { pickCamera } from "./cameras";
import { safe } from "./fetch";
import { fetchRIndex } from "./fmi";
import { resolveLocation } from "./geocode";
import { fetchKpForecast, fetchOvationAt, fetchSolarWind } from "./noaa";
import { shortTermSamples, visibleProbability } from "./probability";
import type { Dashboard, HourlyWeather } from "./types";
import { fetchCloudCover } from "./weather";

export async function buildDashboard(city?: string): Promise<Dashboard> {
  const errors: string[] = [];
  const location = await resolveLocation(city);

  const [kpData, windData, ovation, cloud, rIndex] = await Promise.all([
    safe(() => fetchKpForecast(), errors, "kp-forecast"),
    safe(() => fetchSolarWind(), errors, "solar-wind"),
    safe(
      () => fetchOvationAt(location.latitude, location.longitude),
      errors,
      "ovation",
    ),
    safe(
      () =>
        fetchCloudCover(location.latitude, location.longitude, location.timezone),
      errors,
      "weather",
    ),
    safe(() => fetchRIndex(), errors, "r-index"),
  ]);

  const kpHistory = kpData?.history ?? [];
  const kpUpcoming = kpData?.upcoming ?? [];
  const kpLongTerm = kpData?.longTerm ?? [];
  const latestKp = kpHistory.at(-1)?.kp ?? kpUpcoming.at(0)?.kp ?? 0;

  const cloudHours = cloud ?? [];
  const nowHour = findNowHour(cloudHours);
  const cloudCover = nowHour?.cloudCover ?? 0;
  const isDay = nowHour?.isDay ?? true;

  const ovationPercent = ovation?.probability ?? 0;

  const visible = visibleProbability({
    kp: latestKp,
    ovation: ovationPercent,
    cloudCover,
    isDay,
    latitude: location.latitude,
  });

  const shortTerm = shortTermSamples({
    kp: latestKp,
    ovation: ovationPercent,
    cloudCover,
    isDay,
    latitude: location.latitude,
  });

  const cloudCoverTonight = selectTonightWindow(cloudHours);

  return {
    location,
    generatedAt: new Date().toISOString(),
    now: {
      kp: latestKp,
      ovationProbability: ovationPercent,
      cloudCover,
      isDay,
      visibleProbability: visible,
      rIndex: rIndex?.value ?? null,
      rIndexLabel: rIndex?.label ?? null,
    },
    shortTerm,
    cloudCoverTonight,
    kpHistory: kpHistory.slice(-8),
    kpUpcoming: kpUpcoming.slice(0, 16),
    kpLongTerm: kpLongTerm.slice(0, 8),
    solarWind: windData ?? { speed: [], density: [], bz: [], bt: [] },
    camera: pickCamera(location.latitude, location.longitude),
    errors,
  };
}

function findNowHour(hours: HourlyWeather[]): HourlyWeather | undefined {
  if (hours.length === 0) return undefined;
  const now = Date.now();
  let best: HourlyWeather | undefined;
  let bestDelta = Infinity;
  for (const h of hours) {
    const t = new Date(h.time).getTime();
    const d = Math.abs(t - now);
    if (d < bestDelta) {
      best = h;
      bestDelta = d;
    }
  }
  return best;
}

function selectTonightWindow(hours: HourlyWeather[]): HourlyWeather[] {
  if (hours.length === 0) return [];
  const now = Date.now();
  // Show up to 12 hours starting from the next 21:00 local (or now if already evening).
  return hours.filter((h) => {
    const t = new Date(h.time).getTime();
    if (t < now - 60 * 60 * 1000) return false;
    return true;
  }).slice(0, 12);
}
