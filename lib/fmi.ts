import { fetchJson } from "./fetch";

type RIndexLatest = {
  time?: string;
  R?: number | string;
  "R-index"?: number | string;
  value?: number | string;
  description?: string;
  [k: string]: unknown;
};

export async function fetchRIndex(): Promise<{
  value: number | null;
  label: string | null;
  time: string | null;
}> {
  try {
    const data = await fetchJson<RIndexLatest | RIndexLatest[]>(
      "https://space.fmi.fi/MIRACLE/RWC/data/r_index_latest_fi.json",
      5 * 60,
    );
    const pick = Array.isArray(data) ? data[data.length - 1] : data;
    if (!pick) return { value: null, label: null, time: null };
    const rawVal =
      pick["R-index"] ?? pick.R ?? pick.value ?? (pick as { r?: number }).r;
    const n = rawVal == null ? null : Number(rawVal);
    const value = n !== null && Number.isFinite(n) ? n : null;
    return {
      value,
      label: value === null ? null : labelForR(value),
      time: (pick.time as string) ?? null,
    };
  } catch {
    return { value: null, label: null, time: null };
  }
}

function labelForR(r: number): string {
  if (r >= 4) return "Very likely";
  if (r >= 3) return "Likely";
  if (r >= 2) return "Possible";
  if (r >= 1) return "Low";
  return "Very low";
}
