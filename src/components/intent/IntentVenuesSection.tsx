import { VenueDirectoryCard } from "@/app/venues/_components/VenueDirectoryCard";
import type { IntentKind } from "@/lib/intent/paths";
import { intentPath } from "@/lib/intent/paths";
import { mergeVenueUpcomingScreenings } from "@/lib/sports/events-path";
import { getUpcomingFixtures } from "@/services/events";
import type { VenueDetail } from "@/services/venues";
import { ArrowUpRight, MapPin } from "lucide-react";
import Link from "next/link";

type IntentVenuesSectionProps = {
  intent: IntentKind;
  venues: VenueDetail[];
  activityName: string;
  locationTitle: string;
  usedCityFallback?: boolean;
  suburbTitle?: string | null;
  cityTitle?: string | null;
  related?: { slug: string; title: string }[];
  activitySlug: string;
};

export async function IntentVenuesSection({
  intent,
  venues,
  activityName,
  locationTitle,
  usedCityFallback = false,
  suburbTitle,
  cityTitle,
  related = [],
  activitySlug,
}: IntentVenuesSectionProps) {
  const accent = intent === "watch" ? "text-sky-400" : "text-emerald-400";
  const fallbackSuburb = suburbTitle ?? locationTitle;
  const fallbackCity = cityTitle ?? "this city";
  const verb = intent === "watch" ? "Watch" : "Play";
  const fixtures =
    intent === "watch" ? await getUpcomingFixtures({ limit: 48 }) : [];

  return (
    <section
      id="venues"
      className="scroll-mt-28 border-t border-white/5 px-4 py-14 sm:px-6 sm:py-16 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 max-w-3xl sm:mb-10">
          <p
            className={`mb-2 text-xs font-semibold uppercase tracking-[0.2em] ${accent}`}
          >
            Venues
          </p>
          <h2 className="font-display text-3xl tracking-wide text-white sm:text-4xl">
            {verb} {activityName} in {locationTitle}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400 sm:text-base">
            {intent === "watch"
              ? "Restaurants, bars & fan zones screening live sport"
              : "Courts and clubs hosting this sport"}
          </p>
        </header>

        {usedCityFallback && venues.length > 0 ? (
          <div
            className={`mb-6 rounded-2xl border px-4 py-3.5 sm:px-5 ${
              intent === "watch"
                ? "border-sky-400/20 bg-sky-400/8"
                : "border-emerald-400/20 bg-emerald-400/8"
            }`}
          >
            <p className="text-sm leading-relaxed text-zinc-200">
              No venues found directly in{" "}
              <span className="font-medium text-white">{fallbackSuburb}</span>{" "}
              yet. Showing top matches in nearby{" "}
              <span className="font-medium text-white">{fallbackCity}</span>.
            </p>
          </div>
        ) : null}

        {venues.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            {venues.map((venue) => (
              <VenueDirectoryCard
                key={venue._id}
                venue={venue}
                intent={intent}
                nextScreening={
                  intent === "watch"
                    ? mergeVenueUpcomingScreenings(venue, fixtures)[0] ?? null
                    : null
                }
              />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-white/8 bg-[#141814] px-6 py-12 text-center">
            <MapPin className="mx-auto mb-3 h-10 w-10 text-zinc-600" />
            <p className="text-sm text-zinc-400">
              No {intent} venues for {activityName} in {locationTitle} yet.
            </p>
            <Link
              href={intentPath(intent, activitySlug)}
              className={`mt-4 inline-flex items-center gap-1.5 text-sm font-medium ${accent}`}
            >
              Try another area
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}

        {related.length > 0 ? (
          <div className="mt-12">
            <h3 className="font-display text-2xl tracking-wide text-white">
              Nearby areas
            </h3>
            <ul className="mt-4 flex flex-wrap gap-2">
              {related.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={intentPath(intent, activitySlug, item.slug)}
                    className="inline-flex rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-sm text-zinc-300 transition-colors hover:border-white/20 hover:text-white"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}
