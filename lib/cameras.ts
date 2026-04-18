import type { SkyCamera } from "./types";

// FMI MIRACLE / RWC all-sky cameras in Finland.
// Image URL pattern: https://space.fmi.fi/MIRACLE/RWC/latest_<CODE>_AllSky.jpg
// Page: https://rwc-finland.fmi.fi/index.php/revontulikameroiden-kuvat/
const FMI_PAGE = "https://rwc-finland.fmi.fi/index.php/revontulikameroiden-kuvat/";

const CAMERAS: SkyCamera[] = [
  {
    name: "Hankasalmi (SIR)",
    url: "https://space.fmi.fi/MIRACLE/RWC/latest_SIR_AllSky.jpg",
    latitude: 62.3,
    longitude: 26.65,
    source: "FMI MIRACLE",
    pageUrl: FMI_PAGE,
  },
  {
    name: "Nyrölä (NYR)",
    url: "https://space.fmi.fi/MIRACLE/RWC/latest_NYR_AllSky.jpg",
    latitude: 62.34,
    longitude: 25.51,
    source: "FMI MIRACLE",
    pageUrl: FMI_PAGE,
  },
  {
    name: "Sodankylä (SOD)",
    url: "https://space.fmi.fi/MIRACLE/RWC/latest_SOD_AllSky.jpg",
    latitude: 67.42,
    longitude: 26.39,
    source: "FMI MIRACLE",
    pageUrl: FMI_PAGE,
  },
  {
    name: "Kevo (KEV)",
    url: "https://space.fmi.fi/MIRACLE/RWC/latest_KEV_AllSky.jpg",
    latitude: 69.76,
    longitude: 27.01,
    source: "FMI MIRACLE",
    pageUrl: FMI_PAGE,
  },
];

function haversine(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
): number {
  const R = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export function pickCamera(lat: number, lon: number): SkyCamera {
  return CAMERAS.slice().sort(
    (a, b) =>
      haversine({ latitude: lat, longitude: lon }, a) -
      haversine({ latitude: lat, longitude: lon }, b),
  )[0];
}

export const ALL_CAMERAS = CAMERAS;
