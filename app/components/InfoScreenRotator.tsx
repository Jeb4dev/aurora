"use client";

import { useEffect, useRef, useState } from "react";

const SECTIONS = ["now", "forecast", "camera", "conditions"];

export function InfoScreenRotator({
  enabled,
  intervalSec = 15,
  refreshMin = 5,
}: {
  enabled: boolean;
  intervalSec?: number;
  refreshMin?: number;
}) {
  const [paused, setPaused] = useState(false);
  const indexRef = useRef(0);

  useEffect(() => {
    if (!enabled || paused) return;
    const id = setInterval(() => {
      indexRef.current = (indexRef.current + 1) % SECTIONS.length;
      const el = document.getElementById(SECTIONS[indexRef.current]);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, intervalSec * 1000);
    return () => clearInterval(id);
  }, [enabled, intervalSec, paused]);

  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => {
      window.location.reload();
    }, refreshMin * 60 * 1000);
    return () => clearInterval(id);
  }, [enabled, refreshMin]);

  if (!enabled) return null;

  return (
    <div className="fixed bottom-3 right-3 z-30 flex items-center gap-2 rounded-full bg-black/60 text-white text-xs px-3 py-1.5 backdrop-blur">
      <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" />
      <span>Info screen · rotating every {intervalSec}s</span>
      <button
        className="ml-2 underline opacity-75 hover:opacity-100"
        onClick={() => setPaused((p) => !p)}
      >
        {paused ? "Resume" : "Pause"}
      </button>
    </div>
  );
}
