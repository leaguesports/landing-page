import { loadEventKickoffs } from "@/lib/venues/event-kickoffs";
import {
  venueContactLinks,
  venueCustomerAbout,
  venueGoodForLabels,
  venueHoursLine,
  venueShortDisplayName,
  venueWatchPlace,
} from "@/lib/venues/page-template";
import {
  buildWatchVenueWeek,
  screeningListingDays,
} from "@/lib/venues/watch-week";
import { getUpcomingFixtures } from "@/services/events";
import type { VenueDetail } from "@/services/venues";
import {
  FocusedVenueShell,
  ScoreboardAbout,
  ScoreboardAmenities,
  ScoreboardBand,
  ScoreboardContact,
  ScoreboardPhoto,
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
  const hours = venueHoursLine(venue);
  const amenities = venueGoodForLabels(venue, true);

  return (
    <FocusedVenueShell template="watch" slug={venue.slug} jsonLd={jsonLd}>
      <ScoreboardBand mode="watch" name={name} place={place} />
      <div className="mx-auto max-w-7xl space-y-10 px-4 py-8 sm:px-6 lg:px-8">
        <VenueWeekFixtures days={week.days} cards={week.cards} />
        <ScoreboardPhoto venue={venue} stamp="THE VENUE" />
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
          <div className="space-y-8">
            <ScoreboardAmenities labels={amenities} />
            {about ? (
              <div>
                <p className="mb-3 font-display text-2xl uppercase tracking-[0.18em] text-[#C6FF00]">
                  About
                </p>
                <ScoreboardAbout text={about} />
              </div>
            ) : null}
            {hours ? (
              <div>
                <p className="mb-3 font-display text-2xl uppercase tracking-[0.18em] text-[#C6FF00]">
                  Hours
                </p>
                <p className="text-sm text-[#C8C8C8]">{hours}</p>
              </div>
            ) : null}
          </div>
          <ScoreboardContact
            venue={venue}
            links={venueContactLinks(venue)}
            mapsUrl={mapsUrl}
          />
        </div>
      </div>
    </FocusedVenueShell>
  );
}
