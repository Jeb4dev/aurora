import { fetchJson } from "./fetch";
import type { HourlyWeather } from "./types";

type OMForecast = {
  hourly?: {
    time: string[];
    cloud_cover?: number[];
    is_day?: number[];
  };
  timezone?: string;
};

export async function fetchCloudCover(
  lat: number,
  lon: number,
  timezone = "auto",
): Promise<HourlyWeather[]> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&hourly=cloud_cover,is_day&forecast_days=3&timezone=${encodeURIComponent(timezone)}`;
  const data = await fetchJson<OMForecast>(url, 10 * 60);
  const h = data.hourly;
  if (!h) return [];
  const out: HourlyWeather[] = [];
  for (let i = 0; i < h.time.length; i++) {
    out.push({
      time: h.time[i],
      cloudCover: h.cloud_cover?.[i] ?? 0,
      isDay: (h.is_day?.[i] ?? 1) === 1,
    });
  }
  return out;
}
