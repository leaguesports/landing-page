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
  ScoreboardBody,
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
  const amenities = venueGoodForLabels(venue, true).filter((label) => label.trim());
  const showBoard = Boolean(about || hours || amenities.length > 0);

  return (
    <FocusedVenueShell template="watch" slug={venue.slug} jsonLd={jsonLd}>
      <ScoreboardBand mode="watch" name={name} place={place} />
      <ScoreboardBody>
        <VenueWeekFixtures days={week.days} cards={week.cards} />
        <ScoreboardPhoto venue={venue} stamp="THE VENUE" />
        <div className={showBoard ? "grid items-start gap-5 lg:grid-cols-2 lg:gap-8" : undefined}>
          {showBoard ? (
            <div className="min-w-0 space-y-5">
              <ScoreboardAmenities labels={amenities} />
              {about ? (
                <div>
                  <p className="mb-2 font-display text-2xl uppercase tracking-[0.18em] text-[#C6FF00]">
                    About
                  </p>
                  <ScoreboardAbout text={about} />
                </div>
              ) : null}
              {hours ? (
                <div>
                  <p className="mb-2 font-display text-2xl uppercase tracking-[0.18em] text-[#C6FF00]">
                    Hours
                  </p>
                  <p className="text-sm text-[#C8C8C8]">{hours}</p>
                </div>
              ) : null}
            </div>
          ) : null}
          <ScoreboardContact
            venue={venue}
            links={venueContactLinks(venue)}
            mapsUrl={mapsUrl}
          />
        </div>
      </ScoreboardBody>
    </FocusedVenueShell>
  );
}
