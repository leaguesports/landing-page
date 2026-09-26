import type { IntentAmenityStat } from "@/lib/intent/enrichment";
import type { IntentKind } from "@/lib/intent/paths";
import { Sparkles } from "lucide-react";

type IntentHighlightsProps = {
  intent: IntentKind;
  amenityStats: IntentAmenityStat[];
  verifiedCount: number;
};

/**
 * Play city pages only. Watch city hubs use a stat strip plus WatchCityCalendar
 * so amenity counts are not repeated in a second "What these listings offer" block.
 */
export function IntentHighlights({
  intent,
  amenityStats,
  verifiedCount,
}: IntentHighlightsProps) {
  if (amenityStats.length === 0 && verifiedCount <= 0) {
    return null;
  }

  const accent = intent === "watch" ? "text-sky-400" : "text-emerald-400";

  return (
    <section className="border-t border-white/5 px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <p
          className={`mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] ${accent}`}
        >
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          At a glance
        </p>
        <h2 className="font-display text-2xl tracking-wide text-white sm:text-3xl">
          What these listings offer
        </h2>
        <ul className="mt-4 space-y-2 text-sm leading-relaxed text-zinc-400">
          {verifiedCount > 0 ? (
            <li>
              {verifiedCount} verified{" "}
              {verifiedCount === 1 ? "venue" : "venues"} on LeagueSports
            </li>
          ) : null}
          {amenityStats.map((stat) => (
            <li key={stat.key}>{stat.label}</li>
          ))}
          {amenityStats.length === 0 && verifiedCount <= 0 ? (
            <li>Open each venue for the latest facility details.</li>
          ) : null}
        </ul>
      </div>
    </section>
  );
}
