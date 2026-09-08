import type { Metadata } from "next";
import Link from "next/link";
import { GolfQuickStart } from "@/components/golf/GolfQuickStart";
import { isGolfVenue, toGolfVenueOption } from "@/lib/golf/venue-options";
import { venueQueryKey } from "@/lib/scorecard/start-href";
import { rankVenuesByCity } from "@/lib/conversion/deep-links";
import { getVenueBySlug, searchVenues } from "@/services/venues";

export const metadata: Metadata = {
  title: "New Golf Round | LeagueSports",
  description:
    "Start a live golf round with a course, tee, starting hole, holes played, and 1–4 players.",
  robots: { index: false, follow: false },
};

export default async function NewGolfRoundPage({
  searchParams,
}: {
  searchParams: Promise<{
    venue?: string | string[];
    cmsId?: string | string[];
    sport?: string | string[];
    city?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const requestedSlug = venueQueryKey(params);
  const cityPrefill = Array.isArray(params.city) ? params.city[0] : params.city;

  const [golfCourses, requestedVenue] = await Promise.all([
    searchVenues({ intent: "play", sportSlug: "golf" }).then((venues) =>
      venues.map(toGolfVenueOption).filter(isGolfVenue),
    ),
    requestedSlug ? getVenueBySlug(requestedSlug) : Promise.resolve(null),
  ]);

  const requestedOption = requestedVenue
    ? toGolfVenueOption(requestedVenue)
    : null;
  const initialVenue =
    requestedOption && isGolfVenue(requestedOption) ? requestedOption : null;

  const ranked = rankVenuesByCity(golfCourses, cityPrefill);
  const venues = initialVenue
    ? [
        initialVenue,
        ...ranked.filter(
          (course) =>
            course.slug.toLowerCase() !== initialVenue.slug.toLowerCase(),
        ),
      ]
    : ranked;

  return (
    <main className="min-h-dvh bg-[#0c0f0c]">
      <div className="border-b border-white/6 bg-[#0c0f0c]/80 px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
          <Link
            href={
              initialVenue
                ? `/venues/${initialVenue.slug}`
                : "/play/golf"
            }
            className="text-sm text-zinc-400 transition-colors hover:text-white"
          >
            {initialVenue ? "← Venue" : "← Play golf"}
          </Link>
          <Link
            href="/golf/history"
            className="text-sm text-zinc-400 transition-colors hover:text-white"
          >
            History
          </Link>
        </div>
      </div>
      <GolfQuickStart
        venues={venues}
        initialVenueSlug={initialVenue?.slug}
        lockVenue={Boolean(initialVenue)}
      />
    </main>
  );
}
