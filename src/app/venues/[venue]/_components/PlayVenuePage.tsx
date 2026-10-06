import { lookupVenueLockedResults } from "@/lib/venues/locked-results";
import {
  venueContactLinks,
  venueCustomerAbout,
  venueDistinctPlaySports,
  venueHoursLine,
  venuePlayFactsLine,
  venuePlayPlace,
  venueShortDisplayName,
  venueStartMatchHref,
  venueStartMatchLabel,
} from "@/lib/venues/page-template";
import type { VenueDetail } from "@/services/venues";
import Link from "next/link";
import {
  FocusedVenueShell,
  VenueAbout,
  VenueContactRow,
  VenueDirectionsFollow,
  VenueHeading,
  VenueHours,
  VenueLocation,
  VenueSinglePhoto,
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
  const sport = venueDistinctPlaySports(venue)[0] ?? null;
  const startHref = venueStartMatchHref(venue);
  const facts = sport ? venuePlayFactsLine(venue, sport.name) : null;
  const results = sport
    ? await lookupVenueLockedResults(venue._id, sport.key)
    : [];
  const name = venueShortDisplayName(venue.name, venue.address);
  const place = venuePlayPlace(venue.address);

  return (
    <FocusedVenueShell template="play" slug={venue.slug} jsonLd={jsonLd}>
      <div className="space-y-8">
        <VenueHeading name={name} place={place} />

        {startHref ? (
          <Link
            href={startHref}
            className="flex min-h-12 w-full items-center justify-center rounded-2xl bg-[var(--color-brand)] px-4 text-base font-semibold text-zinc-950 hover:bg-emerald-300"
          >
            {venueStartMatchLabel(sport?.name ?? "")}
          </Link>
        ) : null}

        {facts ? (
          <p className="text-sm leading-relaxed text-zinc-200">{facts}</p>
        ) : null}

        <VenueSinglePhoto venue={venue} name={name} />
        <VenueAbout text={venueCustomerAbout(venue.description)} />
        <VenueContactRow links={venueContactLinks(venue)} />
        <VenueLocation venue={venue} />
        <VenueHours line={venueHoursLine(venue)} />

        {results.length > 0 ? (
          <section aria-labelledby="venue-results">
            <h2
              id="venue-results"
              className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500"
            >
              Results
            </h2>
            <ul className="mt-3 divide-y divide-white/8 overflow-hidden rounded-3xl border border-white/10 bg-[#141814]">
              {results.map((result) => (
                <li key={result.id}>
                  <Link
                    href={result.href}
                    className="block px-4 py-3 hover:bg-white/5"
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
          </section>
        ) : null}

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
