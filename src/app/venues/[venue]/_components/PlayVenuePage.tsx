import { toGolfVenueOption } from "@/lib/golf/venue-options";
import { lookupVenueLockedResults } from "@/lib/venues/locked-results";
import {
  venueContactLinks,
  venueCustomerAbout,
  venueDistinctPlaySports,
  venueHoursLine,
  venuePlayPlace,
  venuePlayStats,
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
  ScoreboardBody,
  ScoreboardContact,
  ScoreboardGallery,
  ScoreboardPhoto,
  ScoreboardStats,
} from "./FocusedVenueSections";

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
  const stats = venuePlayStats(venue, sport);
  const showBoard = Boolean(about || hours);

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
      <ScoreboardStats
        count={stats.count}
        setting={stats.setting}
        labels={stats.amenities}
      />
      <ScoreboardBody>
        <ScoreboardPhoto venue={venue} stamp="THE CLUB" />
        <ScoreboardGallery images={venue.gallery ?? []} />
        <div className={showBoard ? "grid items-start gap-5 lg:grid-cols-2 lg:gap-8" : undefined}>
          {showBoard ? (
            <div className="min-w-0 space-y-5">
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
      </ScoreboardBody>
    </FocusedVenueShell>
  );
}
