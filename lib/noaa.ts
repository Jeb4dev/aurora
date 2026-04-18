import { fetchJson } from "./fetch";
import type { DailyKp, KpPoint, WindPoint } from "./types";

// NOAA SWPC delivers most "products" JSON feeds as header-row arrays.
type Row = (string | number | null)[];
type Table = Row[];

function parseTable(table: Table): { cols: string[]; rows: Row[] } {
  if (!Array.isArray(table) || table.length === 0) return { cols: [], rows: [] };
  const cols = (table[0] as string[]).map((c) => String(c));
  return { cols, rows: table.slice(1) };
}

function toIso(v: string | number | null): string {
  if (v == null) return new Date().toISOString();
  const s = String(v).trim();
  // SWPC timestamps like "2026-04-18 15:00:00" (UTC, no TZ marker)
  const iso = s.includes("T") ? s : s.replace(" ", "T");
  const withZ = /Z$|[+\-]\d\d:?\d\d$/.test(iso) ? iso : iso + "Z";
  return withZ;
}

function num(v: string | number | null): number | undefined {
  if (v == null) return undefined;
  const n = Number(v);
  if (!Number.isFinite(n)) return undefined;
  return n;
}

type KpForecastRow = {
  time_tag: string;
  kp: number | string;
  observed?: string;
};

export async function fetchKpForecast(): Promise<{
  history: KpPoint[];
  upcoming: KpPoint[];
  longTerm: DailyKp[];
}> {
  // Has observed/estimated/predicted 3-hour cadence for ~last ~week + next ~72h.
  // Recent format: array of objects with keys time_tag, kp, observed.
  const raw = await fetchJson<KpForecastRow[] | Table>(
    "https://services.swpc.noaa.gov/products/noaa-planetary-k-index-forecast.json",
    15 * 60,
  );
  const points = parseKpRows(raw);
  const now = Date.now();
  const history = points.filter((p) => new Date(p.time).getTime() <= now);
  const upcoming = points.filter((p) => new Date(p.time).getTime() > now);
  const longTerm = collapseDaily(points);
  return { history, upcoming, longTerm };
}

function parseKpRows(raw: KpForecastRow[] | Table): KpPoint[] {
  if (!Array.isArray(raw) || raw.length === 0) return [];
  const first = raw[0];
  if (Array.isArray(first)) {
    const { cols, rows } = parseTable(raw as Table);
    const tIdx = cols.indexOf("time_tag");
    const kIdx = cols.indexOf("kp");
    const obsIdx = cols.findIndex((c) => c.toLowerCase().includes("observed"));
    if (tIdx === -1 || kIdx === -1) return [];
    return rows.map((r) => ({
      time: toIso(r[tIdx] as string),
      kp: num(r[kIdx]) ?? 0,
      kind: classify(obsIdx >= 0 ? String(r[obsIdx] ?? "") : ""),
    }));
  }
  return (raw as KpForecastRow[]).map((r) => ({
    time: toIso(r.time_tag),
    kp: num(r.kp) ?? 0,
    kind: classify(r.observed ?? ""),
  }));
}

function classify(flag: string): KpPoint["kind"] {
  const f = flag.toLowerCase();
  if (f.includes("predicted")) return "predicted";
  if (f.includes("estimated")) return "estimated";
  return "observed";
}

function collapseDaily(points: KpPoint[]): DailyKp[] {
  const byDay = new Map<string, number>();
  for (const p of points) {
    const d = p.time.slice(0, 10);
    byDay.set(d, Math.max(byDay.get(d) ?? 0, p.kp));
  }
  const today = new Date().toISOString().slice(0, 10);
  return Array.from(byDay.entries())
    .filter(([d]) => d >= today)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, kp]) => ({ date, kp }));
}

export async function fetchSolarWind(): Promise<{
  speed: WindPoint[];
  density: WindPoint[];
  bz: WindPoint[];
  bt: WindPoint[];
}> {
  const [plasma, mag] = await Promise.all([
    fetchJson<Table>(
      "https://services.swpc.noaa.gov/products/solar-wind/plasma-2-hour.json",
      5 * 60,
    ).catch(() => [] as Table),
    fetchJson<Table>(
      "https://services.swpc.noaa.gov/products/solar-wind/mag-2-hour.json",
      5 * 60,
    ).catch(() => [] as Table),
  ]);

  const plasmaParsed = parseTable(plasma);
  const magParsed = parseTable(mag);

  const speed: WindPoint[] = [];
  const density: WindPoint[] = [];
  const bz: WindPoint[] = [];
  const bt: WindPoint[] = [];

  if (plasmaParsed.cols.length) {
    const tIdx = plasmaParsed.cols.indexOf("time_tag");
    const sIdx = plasmaParsed.cols.indexOf("speed");
    const dIdx = plasmaParsed.cols.indexOf("density");
    for (const r of plasmaParsed.rows) {
      const time = toIso(r[tIdx] as string);
      const s = num(r[sIdx]);
      const d = num(r[dIdx]);
      if (s !== undefined) speed.push({ time, speed: s });
      if (d !== undefined) density.push({ time, density: d });
    }
  }

  if (magParsed.cols.length) {
    const tIdx = magParsed.cols.indexOf("time_tag");
    const bzIdx = magParsed.cols.indexOf("bz_gsm");
    const btIdx = magParsed.cols.indexOf("bt");
    for (const r of magParsed.rows) {
      const time = toIso(r[tIdx] as string);
      const z = num(r[bzIdx]);
      const t = num(r[btIdx]);
      if (z !== undefined) bz.push({ time, bz: z });
      if (t !== undefined) bt.push({ time, bt: t });
    }
  }
  const trim = <T extends WindPoint>(arr: T[]) => arr.slice(-180); // last ~15h at 5-min cadence
  return { speed: trim(speed), density: trim(density), bz: trim(bz), bt: trim(bt) };
}

type OvationJson = {
  "Observation Time"?: string;
  "Forecast Time"?: string;
  coordinates?: [number, number, number][]; // [lon, lat, aurora_percent]
};

export async function fetchOvationAt(
  lat: number,
  lon: number,
): Promise<{ probability: number; forecastTime?: string } | null> {
  const data = await fetchJson<OvationJson>(
    "https://services.swpc.noaa.gov/json/ovation_aurora_latest.json",
    5 * 60,
  );
  if (!data.coordinates) return null;
  // Grid is 1° lon (0..359) × 1° lat (-90..90). Normalize longitude to 0..360.
  const targetLon = ((lon % 360) + 360) % 360;
  const targetLat = Math.round(lat);
  let best: { d: number; p: number } | null = null;
  for (const [gLon, gLat, p] of data.coordinates) {
    if (gLat !== targetLat) continue;
    const dLon = Math.min(
      Math.abs(gLon - targetLon),
      360 - Math.abs(gLon - targetLon),
    );
    if (dLon > 1.5) continue;
    if (!best || dLon < best.d) best = { d: dLon, p };
  }
  return { probability: best?.p ?? 0, forecastTime: data["Forecast Time"] };
}
