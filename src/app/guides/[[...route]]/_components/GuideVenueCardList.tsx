import type { CtaMatrix } from "@/lib/conversion/cta-matrix";
import type { GuideVenueCardEntry } from "@/lib/guides/venueCards";
import type { GuideVenueMedia } from "@/lib/guides/venueMedia";
import { GuideVenueCard } from "./GuideVenueCard";

export function GuideVenueCardList({
  venues,
  media,
  sport,
  matrix,
  pageSlug,
}: {
  venues: GuideVenueCardEntry[];
  sport: string | null;
  matrix: CtaMatrix;
  pageSlug: string;
  media: Map<string, GuideVenueMedia>;
}) {
  return (
    <div
      className="my-8 grid grid-cols-1 gap-3 sm:grid-cols-2"
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
