import type { ProbabilitySample } from "./types";

// Latitude-to-Kp threshold: below this Kp, aurora will not reach the geomagnetic
// latitude of the observer (rough approximation for northern hemisphere).
const THRESHOLDS: { maxGeoLat: number; kp: number }[] = [
  { maxGeoLat: 58, kp: 0 }, // far north (above arctic circle, essentially always possible when dark)
  { maxGeoLat: 60, kp: 1 },
  { maxGeoLat: 62, kp: 2 },
  { maxGeoLat: 64, kp: 3 },
  { maxGeoLat: 66, kp: 4 },
  { maxGeoLat: 68, kp: 5 },
  { maxGeoLat: 70, kp: 6 },
  { maxGeoLat: 72, kp: 7 },
];

function kpThresholdFor(lat: number): number {
  for (const { maxGeoLat, kp } of THRESHOLDS) {
    if (lat >= maxGeoLat) return kp;
  }
  return 9;
}

export function baseProbability(kp: number, lat: number): number {
  const threshold = kpThresholdFor(lat);
  if (kp < threshold) return 0;
  // Smooth ramp above threshold. A Kp one step over threshold ~20%, two steps ~50%, etc.
  const over = kp - threshold;
  const raw = 100 * (1 - Math.exp(-over / 1.5));
  return Math.min(100, Math.max(0, raw));
}

export function visibleProbability(opts: {
  kp: number;
  ovation: number; // 0-100 aurora activity
  cloudCover: number; // 0-100
  isDay: boolean;
  latitude: number;
}): number {
  if (opts.isDay) return 0;
  const base = Math.max(opts.ovation, baseProbability(opts.kp, opts.latitude));
  const cloudFactor = Math.max(0, 1 - opts.cloudCover / 100);
  return Math.round(base * cloudFactor);
}

export function shortTermSamples(opts: {
  kp: number;
  ovation: number;
  cloudCover: number;
  isDay: boolean;
  latitude: number;
}): ProbabilitySample[] {
  const samples: ProbabilitySample[] = [];
  const base = visibleProbability(opts);
  // The 0-30 min window in a mobile app is basically a smoothed persistence of
  // the current activity. Tiny perturbations just give the chart some shape.
  for (let m = 0; m <= 30; m += 5) {
    const noise = Math.sin((m / 30) * Math.PI) * 2;
    const p = Math.max(0, Math.min(100, Math.round(base + noise)));
    samples.push({ offsetMinutes: m, probability: p });
  }
  return samples;
}
