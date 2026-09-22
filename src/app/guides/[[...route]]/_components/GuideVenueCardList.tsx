import type { CtaMatrix } from "@/lib/conversion/cta-matrix";
import type { GuideVenueCardEntry } from "@/lib/guides/venueCards";
import { getGuideVenueMedia } from "@/lib/guides/venueMediaLookup";
import { GuideVenueCard } from "./GuideVenueCard";

export async function GuideVenueCardList({
  venues,
  sport,
  matrix,
  pageSlug,
}: {
  venues: GuideVenueCardEntry[];
  sport: string | null;
  matrix: CtaMatrix;
  pageSlug: string;
}) {
  const media = await getGuideVenueMedia(
    venues.flatMap((venue) => (venue.slug ? [venue.slug] : [])),
  );

  return (
    <div
      className="my-10 grid grid-cols-1 gap-6 lg:grid-cols-2"
      data-guide-venue-list=""
    >
      {venues.map((venue) => (
        <GuideVenueCard
          key={venue.key}
          venue={venue}
          media={venue.slug ? (media.get(venue.slug) ?? null) : null}
          sport={sport}
          matrix={matrix}
          pageSlug={pageSlug}
        />
      ))}
    </div>
  );
}
