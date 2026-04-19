import Link from "next/link";

const ITEMS = [
  { id: "now", label: "Now" },
  { id: "forecast", label: "Forecast" },
  { id: "camera", label: "Sky camera" },
  { id: "conditions", label: "Conditions" },
  { id: "guide", label: "Guide" },
];

export function Nav({ location }: { location: string }) {
  return (
    <header className="sticky top-0 z-20 bg-aurora-accent/90 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span aria-hidden className="text-2xl">◆</span>
          <div>
            <div className="font-bold text-lg md:text-xl leading-tight">
              Aurora
            </div>
            <div className="text-xs md:text-sm opacity-90 leading-tight">
              {location}
            </div>
          </div>
        </div>
        <nav className="flex gap-1 md:gap-2 text-sm md:text-base overflow-x-auto">
          {ITEMS.map((it) => (
            <Link
              key={it.id}
              href={`#${it.id}`}
              className="px-2 md:px-3 py-1 rounded hover:bg-white/20 font-medium whitespace-nowrap"
            >
              {it.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
