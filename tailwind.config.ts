import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        aurora: {
          bg: "#0b0d12",
          card: "#1a1d24",
          line: "#262a33",
          accent: "#a78bfa",
          accentDeep: "#7c3aed",
          green: "#4ade80",
          yellow: "#facc15",
          red: "#ef4444",
          muted: "#9ca3af",
        },
      },
      fontFamily: {
        sans: [
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
