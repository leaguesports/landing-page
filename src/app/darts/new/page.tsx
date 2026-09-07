import type { Metadata } from "next";
import Link from "next/link";
import { DartsQuickStart } from "@/components/darts/DartsQuickStart";
import { isDartsVenue, toDartsVenueOption } from "@/lib/darts/venue-options";
import { venueQueryKey } from "@/lib/scorecard/start-href";
import { getVenueBySlug, searchVenues } from "@/services/venues";

export const metadata: Metadata = {
  title: "New Darts Game | LeagueSports",
  description:
    "Start a live 501 double-out darts game with 2–8 players. Venue is optional.",
  robots: { index: false, follow: false },
};

export default async function NewDartsGamePage({
  searchParams,
}: {
  searchParams: Promise<{
    venue?: string | string[];
    cmsId?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const requestedSlug = venueQueryKey(params);

  const [dartsVenues, requestedVenue] = await Promise.all([
    searchVenues({ intent: "play", sportSlug: "darts" })
      .then((venues) => venues.map(toDartsVenueOption).filter(isDartsVenue))
      .catch(() => []),
    requestedSlug
      ? getVenueBySlug(requestedSlug).catch(() => null)
      : Promise.resolve(null),
  ]);

  const requestedOption = requestedVenue
    ? toDartsVenueOption(requestedVenue)
    : null;
  const initialVenue =
    requestedOption && isDartsVenue(requestedOption) ? requestedOption : null;

  const venues = initialVenue
    ? [
        initialVenue,
        ...dartsVenues.filter(
          (item) => item.slug.toLowerCase() !== initialVenue.slug.toLowerCase(),
        ),
      ]
    : dartsVenues;

  return (
    <main className="min-h-dvh bg-[#0c0f0c]">
      <div className="border-b border-white/6 bg-[#0c0f0c]/80 px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
          <Link
            href={
              initialVenue ? `/venues/${initialVenue.slug}` : "/play/darts"
            }
            className="text-sm text-zinc-400 transition-colors hover:text-white"
          >
            {initialVenue ? "← Venue" : "← Play darts"}
          </Link>
          <Link
            href="/darts/history"
            className="text-sm text-zinc-400 transition-colors hover:text-white"
          >
            History
          </Link>
        </div>
      </div>
      <DartsQuickStart
        venues={venues}
        initialVenueSlug={initialVenue?.slug}
        lockVenue={Boolean(initialVenue)}
      />
    </main>
  );
}
