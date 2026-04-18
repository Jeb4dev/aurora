import "./globals.css";
import type { Metadata, Viewport } from "next";
import { PlausibleAnalytics } from "./components/PlausibleAnalytics";

export const metadata: Metadata = {
  title: "Aurora — Northern Lights forecast",
  description:
    "Northern lights probability, KP index history and forecast, sky camera and space-weather conditions.",
};

export const viewport: Viewport = {
  themeColor: "#0b0d12",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-aurora-bg text-gray-200 antialiased min-h-screen">
        <PlausibleAnalytics />
        {children}
      </body>
    </html>
  );
}
