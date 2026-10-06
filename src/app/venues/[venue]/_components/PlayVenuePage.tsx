import { toGolfVenueOption } from "@/lib/golf/venue-options";
import { lookupVenueLockedResults } from "@/lib/venues/locked-results";
import {
  venueContactLinks,
  venueCourtFacility,
  venueCustomerAbout,
  venueDistinctPlaySports,
  venueGolfHoles,
  venueGoodForLabels,
  venueHoursLine,
  venuePlayPlace,
  venueShortDisplayName,
  venueStartMatchLabel,
  venueUsesPadelScoreboard,
} from "@/lib/venues/page-template";
import { padelNewHref, venueQuickStartActivities } from "@/lib/venues/quick-start";
import type { VenueDetail } from "@/services/venues";
import Link from "next/link";
import {
  FocusedVenueShell,
  ScoreboardAbout,
  ScoreboardBand,
  ScoreboardContact,
  ScoreboardGallery,
  ScoreboardPhoto,
  ScoreboardStats,
} from "./FocusedVenueSections";

function splitCount(label: string | null): { count: string; caption: string } | null {
  if (!label) return null;
  const match = label.match(/^(\d+)\s+(.+)$/);
  if (!match?.[1] || !match[2]) return null;
  return { count: match[1], caption: match[2] };
}

export async function PlayVenuePage({
  venue,
  mapsUrl,
  jsonLd,
}: {
  venue: VenueDetail;
  mapsUrl: string;
  jsonLd: unknown;
}) {
  const padelSlice = venueUsesPadelScoreboard(venue);
  const sport = padelSlice
    ? { key: "padel", name: "Padel" }
    : venueDistinctPlaySports(venue)[0] ?? null;
  const activity = venueQuickStartActivities(toGolfVenueOption(venue)).find((item) =>
    item.href.includes("venue="),
  );
  const startHref = padelSlice
    ? padelNewHref(venue.slug)
    : activity?.href ?? null;
  const startLabel = padelSlice
    ? "Start padel"
    : activity
      ? venueStartMatchLabel(activity.name)
      : "";
  const results =
    sport && !padelSlice
      ? await lookupVenueLockedResults(venue._id, sport.key)
      : sport
        ? await lookupVenueLockedResults(venue._id, "padel")
        : [];
  const name = venueShortDisplayName(venue.name, venue.address);
  const place = venuePlayPlace(venue.address);
  const about = venueCustomerAbout(venue.description);
  const hours = venueHoursLine(venue);
  const facility = padelSlice
    ? venueCourtFacility(venue.description)
    : venueCourtFacility(venue.description) ??
      (sport?.key === "golf" ? venueGolfHoles(venue.golfCourse) : null);
  const stat = splitCount(facility);
  const sportName = (sport?.name ?? "").trim().toLowerCase();
  const amenities = venueGoodForLabels(venue, false).filter(
    (label) => label.trim().toLowerCase() !== sportName,
  );

  return (
    <FocusedVenueShell template="play" slug={venue.slug} jsonLd={jsonLd}>
      <ScoreboardBand mode="play" name={name} place={place} />
      {startHref ? (
        <Link
          href={startHref}
          className="flex min-h-16 w-full items-center justify-center bg-[#C6FF00] px-4 font-display text-4xl uppercase tracking-wide text-black hover:bg-white sm:text-5xl"
        >
          {startLabel}
        </Link>
      ) : null}
      <div className="mx-auto max-w-7xl space-y-10 px-4 py-8 sm:px-6 lg:px-8">
        <ScoreboardStats
          count={stat?.count ?? null}
          caption={stat?.caption ?? null}
          labels={amenities}
        />
        <ScoreboardPhoto venue={venue} stamp="THE CLUB" />
        <ScoreboardGallery images={venue.gallery ?? []} />
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
          <div className="space-y-8">
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
        {results.length > 0 ? (
          <section aria-labelledby="venue-results">
            <h2
              id="venue-results"
              className="font-display text-3xl uppercase tracking-[0.18em] text-[#C6FF00]"
            >
              Results
            </h2>
            <ul className="mt-4 border-2 border-[#333]">
              {results.map((result) => (
                <li key={result.id} className="border-b-2 border-[#1D1D1D] last:border-b-0">
                  <Link href={result.href} className="block px-4 py-4 hover:bg-[#050505]">
                    {result.when ? (
                      <span className="block font-display text-lg uppercase tracking-wide text-[#C6FF00]">
                        {result.when}
                      </span>
                    ) : null}
                    <span className="mt-1 block text-sm text-white">{result.summary}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </FocusedVenueShell>
  );
}
