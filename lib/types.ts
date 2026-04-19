export type Location = {
  name: string;
  region?: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
};

export type KpPoint = {
  time: string; // ISO
  kp: number;
  kind: "observed" | "estimated" | "predicted";
};

export type WindPoint = {
  time: string;
  speed?: number; // km/s
  density?: number; // p/cc
  bz?: number; // nT
  bt?: number; // nT
};

export type HourlyWeather = {
  time: string; // ISO
  cloudCover: number; // 0-100
  isDay: boolean;
};

export type DailyKp = {
  date: string; // YYYY-MM-DD
  kp: number; // max of the day
};

export type SkyCamera = {
  name: string;
  url: string;
  latitude: number;
  longitude: number;
  source: string;
  pageUrl?: string;
};

export type ProbabilitySample = {
  offsetMinutes: number;
  probability: number; // 0-100
};

export type Dashboard = {
  location: Location;
  generatedAt: string;
  now: {
    kp: number;
    ovationProbability: number; // raw aurora activity percent at lat/lon
    cloudCover: number;
    isDay: boolean;
    visibleProbability: number; // 0-100, adjusted for clouds + day
    best24h: number; // best visibility probability in next 24h
    best24hKp: number; // KP at that best hour
    rIndex?: number | null;
    rIndexLabel?: string | null;
  };
  shortTerm: ProbabilitySample[]; // 0..30 min
  cloudCoverTonight: HourlyWeather[];
  kpHistory: KpPoint[];
  kpUpcoming: KpPoint[];
  kpLongTerm: DailyKp[];
  solarWind: {
    speed: WindPoint[];
    density: WindPoint[];
    bz: WindPoint[];
    bt: WindPoint[];
  };
  hemisphericPower?: { time: string; gw: number }[];
  camera: SkyCamera;
  errors: string[];
};
