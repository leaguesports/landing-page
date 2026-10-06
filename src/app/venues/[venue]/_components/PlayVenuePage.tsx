import { toGolfVenueOption } from "@/lib/golf/venue-options";
import { lookupVenueLockedResults } from "@/lib/venues/locked-results";
import {
  venueAddressLine,
  venueContactLinks,
  venueCourtFacility,
  venueCustomerAbout,
  venueDistinctPlaySports,
  venueGolfHoles,
  venueHoursLine,
  venuePlayPlace,
  venueShortDisplayName,
  venueStartMatchLabel,
} from "@/lib/venues/page-template";
import { venueQuickStartActivities } from "@/lib/venues/quick-start";
import { venueHasVisibleAmenities } from "@/lib/venues/watch-chrome";
import type { VenueDetail } from "@/services/venues";
import Link from "next/link";
import {
  FocusedVenueShell,
  VenueAbout,
  VenueActionCard,
  VenueAmenityPanel,
  VenueColumns,
  VenueCourtFact,
  VenueHero,
  VenueLocation,
  VenueSection,
} from "./FocusedVenueSections";
import { VenueQuickStart } from "./VenueQuickStart";

export async function PlayVenuePage({
  venue,
  mapsUrl,
  jsonLd,
}: {
  venue: VenueDetail;
  mapsUrl: string;
  jsonLd: unknown;
}) {
  const sport = venueDistinctPlaySports(venue)[0] ?? null;
  const activities = venueQuickStartActivities(toGolfVenueOption(venue))
    .filter((activity) => activity.href.includes("venue="))
    .map((activity) => ({
      ...activity,
      cta: venueStartMatchLabel(activity.name),
    }));
  const results = sport
    ? await lookupVenueLockedResults(venue._id, sport.key)
    : [];
  const name = venueShortDisplayName(venue.name, venue.address);
  const place = venuePlayPlace(venue.address);
  const about = venueCustomerAbout(venue.description);
  const address = venueAddressLine(venue.address);
  const hours = venueHoursLine(venue);
  const court =
    venueCourtFacility(venue.description) ??
    (sport?.key === "golf" ? venueGolfHoles(venue.golfCourse) : null);
  const showAmenities = venueHasVisibleAmenities(venue, false);

  return (
    <FocusedVenueShell template="play" slug={venue.slug} jsonLd={jsonLd}>
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
            <VenueQuickStart
              venueName={venue.name}
              activities={activities}
              embedded
            />
            {court ? (
              <VenueSection
                id="courts"
                eyebrow={court.includes("hole") ? "Course" : "Courts"}
                title={court.includes("hole") ? "The course" : "On the court"}
              >
                <VenueCourtFact label={court} />
              </VenueSection>
            ) : null}
            {about ? (
              <VenueSection id="about" eyebrow="About" title={name}>
                <VenueAbout text={about} />
              </VenueSection>
            ) : null}
            {showAmenities ? (
              <VenueSection
                id="amenities"
                eyebrow="Amenities"
                title="Amenities"
                subtitle="On-site facilities"
              >
                <VenueAmenityPanel venue={venue} supportsWatch={false} />
              </VenueSection>
            ) : null}
            {hours ? (
              <VenueSection id="hours" eyebrow="Hours" title="Hours">
                <p className="text-sm text-zinc-300">{hours}</p>
              </VenueSection>
            ) : null}
            {results.length > 0 ? (
              <VenueSection id="results" eyebrow="Results" title="Results">
                <ul className="-mx-5 -my-5 divide-y divide-white/10 sm:-mx-6 sm:-my-6">
                  {results.map((result) => (
                    <li key={result.id}>
                      <Link
                        href={result.href}
                        className="block px-5 py-4 hover:bg-white/5 sm:px-6"
                      >
                        {result.when ? (
                          <span className="block text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
                            {result.when}
                          </span>
                        ) : null}
                        <span className="mt-1 block text-sm text-white">
                          {result.summary}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
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
