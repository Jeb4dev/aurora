import type { ProbabilitySample } from "./types";

// KP → minimum geographic latitude where aurora is visible (approximate).
// Iterates highest-latitude-first so lat=62.9 correctly returns kp=4.
const AURORA_THRESHOLDS: { minLat: number; kp: number }[] = [
  { minLat: 70, kp: 0 },
  { minLat: 68, kp: 1 },
  { minLat: 66, kp: 2 },
  { minLat: 64, kp: 3 },
  { minLat: 62, kp: 4 },
  { minLat: 60, kp: 5 },
  { minLat: 58, kp: 6 },
  { minLat: 56, kp: 7 },
];

export function kpThresholdFor(lat: number): number {
  for (const { minLat, kp } of AURORA_THRESHOLDS) {
    if (lat >= minLat) return kp;
  }
  return 9; // too far south for visible aurora
}

// NOAA OVATION aurora activity % → viewing probability (dark, clear rural site).
// Calibrated: OVATION 8% → ~36%, 20% → ~65%, 40% → ~85%
function ovationToProbability(ovation: number): number {
  if (ovation <= 0) return 0;
  return Math.round(95 * (1 - Math.exp(-ovation / 18)));
}

// KP-based floor: rises quickly once KP exceeds latitude threshold, caps at 65%.
function kpBaseProbability(kp: number, lat: number): number {
  const threshold = kpThresholdFor(lat);
  if (kp < threshold) return 0;
  const over = kp - threshold;
  return Math.min(65, Math.round(65 * (1 - Math.exp(-over / 0.8))));
}

export function visibleProbability(opts: {
  kp: number;
  ovation: number;
  cloudCover: number;
  isDay: boolean;
  latitude: number;
}): number {
  if (opts.isDay) return 0;
  const base = Math.max(
    ovationToProbability(opts.ovation),
    kpBaseProbability(opts.kp, opts.latitude),
  );
  const cloudFactor = Math.max(0, 1 - opts.cloudCover / 100);
  return Math.min(100, Math.round(base * cloudFactor));
}

export function shortTermSamples(opts: {
  kp: number;
  ovation: number;
  cloudCover: number;
  isDay: boolean;
  latitude: number;
}): ProbabilitySample[] {
  const base = visibleProbability(opts);
  return Array.from({ length: 7 }, (_, i) => {
    const m = i * 5;
    const noise = Math.sin((m / 30) * Math.PI) * 1.5;
    return {
      offsetMinutes: m,
      probability: Math.max(0, Math.min(100, Math.round(base + noise))),
    };
  });
}

export function probabilityColor(p: number): string {
  if (p >= 80) return "#a78bfa"; // purple — extraordinary
  if (p >= 60) return "#ef4444"; // red — high
  if (p >= 35) return "#f97316"; // orange — moderate-good
  if (p >= 15) return "#facc15"; // yellow — low
  if (p > 0) return "#4ade80";   // green — very low
  return "#6b7280";              // gray — unlikely
}

export function probabilityLabel(p: number): string {
  if (p >= 80) return "Extraordinary";
  if (p >= 60) return "High";
  if (p >= 35) return "Moderate";
  if (p >= 15) return "Low";
  if (p > 0) return "Very low";
  return "Unlikely";
}
