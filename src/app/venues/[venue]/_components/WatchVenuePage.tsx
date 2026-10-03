import { loadEventKickoffs } from "@/lib/venues/event-kickoffs";
import {
  venueCustomerAbout,
  venueGoodForLabels,
  venueHoursLine,
  venueShortDisplayName,
  venueWatchPlace,
  venueWatchScreensLine,
} from "@/lib/venues/page-template";
import {
  buildWatchVenueWeek,
  screeningListingDays,
} from "@/lib/venues/watch-week";
import { getUpcomingFixtures } from "@/services/events";
import type { VenueDetail } from "@/services/venues";
import {
  FocusedVenueShell,
  VenueAbout,
  VenueDirectionsFollow,
  VenueGoodFor,
  VenueHeading,
  VenueHours,
  VenueLocation,
  VenueScreensLine,
  VenueSinglePhoto,
} from "./FocusedVenueSections";
import { VenueWeekFixtures } from "./VenueWeekFixtures";

export async function WatchVenuePage({
  venue,
  mapsUrl,
  jsonLd,
}: {
  venue: VenueDetail;
  mapsUrl: string;
  jsonLd: unknown;
}) {
  const days = screeningListingDays(venue.upcoming_screenings);
  const [fixtures, events] = await Promise.all([
    getUpcomingFixtures({ limit: 48 }),
    loadEventKickoffs(days),
  ]);
  const week = buildWatchVenueWeek({ venue, fixtures, events });
  const name = venueShortDisplayName(venue.name, venue.address);
  const place = venueWatchPlace(venue.address);

  return (
    <FocusedVenueShell template="watch" slug={venue.slug} jsonLd={jsonLd}>
      <div className="space-y-8">
        <VenueHeading name={name} place={place} />
        <VenueWeekFixtures days={week.days} cards={week.cards} />
        <VenueSinglePhoto venue={venue} name={name} />
        <VenueGoodFor labels={venueGoodForLabels(venue, true)} />
        <VenueAbout text={venueCustomerAbout(venue.description)} />
        <VenueScreensLine line={venueWatchScreensLine(venue)} />
        <VenueLocation venue={venue} />
        <VenueHours line={venueHoursLine(venue)} />
        <VenueDirectionsFollow
          venueCmsId={venue._id}
          venueName={venue.name}
          venueSlug={venue.slug}
          mapsUrl={mapsUrl}
        />
      </div>
    </FocusedVenueShell>
  );
}
