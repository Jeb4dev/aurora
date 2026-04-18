import type { Dashboard } from "@/lib/types";
import { SectionHeader } from "./SectionHeader";

export function CameraSection({ data }: { data: Dashboard }) {
  const { camera, location } = data;
  return (
    <section id="camera" className="px-4 py-10 scroll-mt-20 bg-aurora-card/30">
      <div className="max-w-5xl mx-auto">
        <SectionHeader
          title="Closest sky camera"
          subtitle={`${camera.name} — live FMI MIRACLE all-sky view near ${location.name}`}
        />
        <div className="rounded-2xl overflow-hidden border border-aurora-line bg-black">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${camera.url}?t=${Math.floor(Date.now() / 60000)}`}
            alt={`${camera.name} all-sky camera`}
            className="w-full object-contain"
          />
        </div>
        <div className="mt-3 text-center text-aurora-muted text-sm">
          Updates ~every minute during dark hours.{" "}
          {camera.pageUrl && (
            <a
              className="underline hover:text-white"
              href={camera.pageUrl}
              target="_blank"
              rel="noreferrer"
            >
              Other cameras →
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
