/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "space.fmi.fi" },
      { protocol: "https", hostname: "rwc-finland.fmi.fi" },
    ],
  },
};

module.exports = nextConfig;
