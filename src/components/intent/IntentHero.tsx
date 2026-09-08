import { ConversionKit } from "@/components/conversion/ConversionKit";
import type { CtaMatrix } from "@/lib/conversion/cta-matrix";
import type { IntentAmenityStat } from "@/lib/intent/enrichment";
import type { IntentActivity } from "@/lib/intent/activity";
import type { IntentKind } from "@/lib/intent/paths";

type IntentHeroProps = {
  intent: IntentKind;
  activity: IntentActivity;
  locationTitle: string;
  locationSlug: string;
  heading: string;
  introParagraphs: string[];
  venueCount: number;
  amenityStats?: IntentAmenityStat[];
  matrix: CtaMatrix;
  sourcePage: string;
};

export function IntentHero({
  intent,
  activity,
  locationTitle,
  heading,
  introParagraphs,
  venueCount,
  amenityStats = [],
  matrix,
  locationSlug,
  sourcePage,
}: IntentHeroProps) {
  const accent = intent === "watch" ? "text-sky-400" : "text-emerald-400";
  const wash =
    intent === "watch"
      ? "from-sky-950/45 via-[#0c0f0c] to-[#0c0f0c]"
      : "from-emerald-950/45 via-[#0c0f0c] to-[#0c0f0c]";
  const glow = intent === "watch" ? "bg-sky-500/10" : "bg-emerald-400/10";
  const verb = intent === "watch" ? "Watch" : "Play";

  return (
    <section className="relative overflow-hidden border-b border-white/5">
      <div className={`absolute inset-0 bg-linear-to-br ${wash}`} />
      <div
        className={`pointer-events-none absolute right-0 top-1/4 h-80 w-80 rounded-full ${glow} blur-3xl`}
      />

      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <p
          className={`mb-3 text-xs font-semibold uppercase tracking-[0.2em] ${accent}`}
        >
          {verb} · {locationTitle}
        </p>
        <h1 className="font-display max-w-4xl text-4xl tracking-wide text-white sm:text-5xl lg:text-6xl">
          {heading}
        </h1>

        <div className="mt-5 max-w-2xl space-y-3 text-base leading-relaxed text-zinc-400">
          {introParagraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 48)}>{paragraph}</p>
          ))}
        </div>

        {(venueCount > 0 || amenityStats.length > 0) && (
          <ul className="mt-6 flex flex-wrap gap-2" aria-label="Listing highlights">
            <li className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-200">
              {venueCount} {venueCount === 1 ? "venue" : "venues"}
            </li>
            {amenityStats.slice(0, 4).map((stat) => (
              <li
                key={stat.key}
                className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-medium ${
                  intent === "watch"
                    ? "border-sky-400/20 bg-sky-400/10 text-sky-100"
                    : "border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
                }`}
              >
                {stat.label}
              </li>
            ))}
            <li className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-400">
              {activity.name}
            </li>
          </ul>
        )}

        <div className="mt-8">
          <ConversionKit
            matrix={matrix}
            tone={intent === "watch" ? "watch" : "play"}
            sport={activity.sportSlug || activity.slug}
            sportName={activity.name}
            city={locationSlug}
            cityName={locationTitle}
            sourcePage={sourcePage}
            pageKey={`${intent}:${activity.slug}:${locationSlug}`}
            pageType={intent === "watch" ? "watch_city_sport" : "play_city_sport"}
            showSticky
            showFallback={false}
          />
        </div>
      </div>
    </section>
  );
}
