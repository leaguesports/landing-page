import type { CtaMatrix } from "@/lib/conversion/cta-matrix";
import type { GuideVenueCardEntry } from "@/lib/guides/venueCards";
import {
  guideVenueCardVisual,
  type GuideVenueMedia,
} from "@/lib/guides/venueMedia";
import { VenueListCard } from "@/components/venues/VenueListCard";

export function GuideVenueCard({
  venue,
  media,
  sport,
  matrix,
  pageSlug,
}: {
  venue: GuideVenueCardEntry;
  media: GuideVenueMedia | null;
  sport: string | null;
  matrix: CtaMatrix;
  pageSlug: string;
}) {
  const suburb = venue.suburb || media?.suburb || "";
  const visual = guideVenueCardVisual({
    name: venue.name,
    suburb,
    media,
  });
  const blurb = venue.blurb
    .split(/\n\n/)
    .map((part) => part.trim())
    .filter(Boolean);

  return (
    <VenueListCard
      variant="guide"
      name={venue.name}
      suburb={suburb}
      slug={venue.slug}
      initial={visual.initial}
      photoSrc={visual.kind === "photo" ? visual.src : null}
      hook={venue.hook}
      blurb={blurb}
      bestFor={venue.bestFor}
      anchorId={venue.anchorId}
      matrix={matrix}
      sport={sport}
      city={suburb || null}
      pageSlug={pageSlug}
      pageType="guide"
    />
  );
}
