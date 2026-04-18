import { fetchJson } from "./fetch";
import type { Location } from "./types";

const DEFAULT_LOCATION: Location = {
  name: "Kuopio",
  region: "Pohjois-Savo",
  country: "Finland",
  latitude: 62.8924,
  longitude: 27.677,
  timezone: "Europe/Helsinki",
};

type OMGeo = {
  results?: {
    name: string;
    latitude: number;
    longitude: number;
    country: string;
    admin1?: string;
    timezone: string;
    population?: number;
  }[];
};

export async function resolveLocation(raw?: string): Promise<Location> {
  if (!raw) return DEFAULT_LOCATION;
  const trimmed = raw.trim();
  if (!trimmed || trimmed.toLowerCase() === "kuopio") return DEFAULT_LOCATION;
  try {
    const data = await fetchJson<OMGeo>(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(trimmed)}&count=5&language=en&format=json`,
      60 * 60 * 24,
    );
    const result = pickBest(data.results, trimmed);
    if (!result) return DEFAULT_LOCATION;
    return {
      name: result.name,
      region: result.admin1,
      country: result.country,
      latitude: result.latitude,
      longitude: result.longitude,
      timezone: result.timezone ?? "UTC",
    };
  } catch {
    return DEFAULT_LOCATION;
  }
}

function pickBest(
  rows: OMGeo["results"],
  query: string,
): NonNullable<OMGeo["results"]>[number] | undefined {
  if (!rows || rows.length === 0) return undefined;
  const q = query.toLowerCase();
  const exact = rows.find((r) => r.name.toLowerCase() === q);
  if (exact) return exact;
  return rows.slice().sort((a, b) => (b.population ?? 0) - (a.population ?? 0))[0];
}

export { DEFAULT_LOCATION };
