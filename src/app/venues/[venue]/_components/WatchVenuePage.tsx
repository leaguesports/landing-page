import { loadEventKickoffs } from "@/lib/venues/event-kickoffs";
import {
  venueAddressLine,
  venueContactLinks,
  venueCustomerAbout,
  venueHoursLine,
  venueShortDisplayName,
  venueWatchPlace,
} from "@/lib/venues/page-template";
import { venueHasVisibleAmenities } from "@/lib/venues/watch-chrome";
import {
  buildWatchVenueWeek,
  screeningListingDays,
} from "@/lib/venues/watch-week";
import { getUpcomingFixtures } from "@/services/events";
import type { VenueDetail } from "@/services/venues";
import {
  FocusedVenueShell,
  VenueAbout,
  VenueActionCard,
  VenueAmenityPanel,
  VenueColumns,
  VenueHero,
  VenueLocation,
  VenueSection,
  VenueSportNames,
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
  const about = venueCustomerAbout(venue.description);
  const address = venueAddressLine(venue.address);
  const hours = venueHoursLine(venue);
  const sports = (venue.broadcasts ?? [])
    .map((sport) => ({
      _id: sport._id,
      name: sport.name?.trim() ?? "",
    }))
    .filter((sport) => sport.name);
  const showAmenities = venueHasVisibleAmenities(venue, true);

  return (
    <FocusedVenueShell template="watch" slug={venue.slug} jsonLd={jsonLd}>
      <VenueHero venue={venue} name={name} place={place} />
      <VenueColumns
        aside={
          <VenueActionCard
            venue={venue}
            links={venueContactLinks(venue)}
            mapsUrl={mapsUrl}
          />
        }
        main={
          <>
            <VenueWeekFixtures days={week.days} cards={week.cards} />
            {about ? (
              <VenueSection id="about" eyebrow="About" title={name}>
                <VenueAbout text={about} />
              </VenueSection>
            ) : null}
            {sports.length > 0 ? (
              <VenueSection
                id="sports"
                eyebrow="Sports"
                title="On the screens"
                subtitle="Broadcast at this venue"
              >
                <VenueSportNames sports={sports} />
              </VenueSection>
            ) : null}
            {showAmenities ? (
              <VenueSection
                id="amenities"
                eyebrow="Amenities"
                title="Amenities"
                subtitle="Power, screens, and on-site facilities"
              >
                <VenueAmenityPanel venue={venue} supportsWatch />
              </VenueSection>
            ) : null}
            {hours ? (
              <VenueSection id="hours" eyebrow="Hours" title="Hours">
                <p className="text-sm text-zinc-300">{hours}</p>
              </VenueSection>
            ) : null}
            {address ? (
              <VenueSection
                id="location"
                eyebrow="Location"
                title="Location"
                subtitle={place || undefined}
              >
                <VenueLocation name={name} venue={venue} mapsUrl={mapsUrl} />
              </VenueSection>
            ) : null}
          </>
        }
      />
    </FocusedVenueShell>
  );
}
