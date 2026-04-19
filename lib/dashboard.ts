import { pickCamera } from "./cameras";
import { safe } from "./fetch";
import { fetchRIndex } from "./fmi";
import { resolveLocation } from "./geocode";
import { fetchKpForecast, fetchOvationAt, fetchSolarWind } from "./noaa";
import { shortTermSamples, visibleProbability } from "./probability";
import type { Dashboard, HourlyWeather, KpPoint } from "./types";
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

  const { best24h, best24hKp } = computeBest24h({
    kpUpcoming,
    cloudHours,
    ovation: ovationPercent,
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
      best24h,
      best24hKp,
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

function computeBest24h(opts: {
  kpUpcoming: KpPoint[];
  cloudHours: HourlyWeather[];
  ovation: number;
  latitude: number;
}): { best24h: number; best24hKp: number } {
  const cutoff = Date.now() + 24 * 60 * 60 * 1000;
  let best = 0;
  let bestKp = 0;

  for (const kpPoint of opts.kpUpcoming) {
    const t = new Date(kpPoint.time).getTime();
    if (t > cutoff) break;

    const matchedHour = findHourAt(opts.cloudHours, t);
    const cc = matchedHour?.cloudCover ?? 50;
    const isDay = matchedHour?.isDay ?? false;

    const p = visibleProbability({
      kp: kpPoint.kp,
      ovation: opts.ovation,
      cloudCover: cc,
      isDay,
      latitude: opts.latitude,
    });

    if (p > best) {
      best = p;
      bestKp = kpPoint.kp;
    }
  }
  return { best24h: best, best24hKp: bestKp };
}

function findNowHour(hours: HourlyWeather[]): HourlyWeather | undefined {
  if (hours.length === 0) return undefined;
  const now = Date.now();
  let best: HourlyWeather | undefined;
  let bestDelta = Infinity;
  for (const h of hours) {
    const d = Math.abs(new Date(h.time).getTime() - now);
    if (d < bestDelta) { best = h; bestDelta = d; }
  }
  return best;
}

function findHourAt(hours: HourlyWeather[], ts: number): HourlyWeather | undefined {
  let best: HourlyWeather | undefined;
  let bestDelta = Infinity;
  for (const h of hours) {
    const d = Math.abs(new Date(h.time).getTime() - ts);
    if (d < bestDelta) { best = h; bestDelta = d; }
  }
  return best;
}

function selectTonightWindow(hours: HourlyWeather[]): HourlyWeather[] {
  const now = Date.now();
  return hours
    .filter((h) => new Date(h.time).getTime() >= now - 60 * 60 * 1000)
    .slice(0, 12);
}
