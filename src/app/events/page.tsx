import { EventsCityFilter } from "@/components/events/EventsCityFilter";
import { EventsSportFilter } from "@/components/events/EventsSportFilter";
import { FeaturedFixtureHero } from "@/components/events/FeaturedFixtureHero";
import { FixtureRow } from "@/components/events/FixtureList";
import {
  eventsListCopy,
  eventsListHref,
  eventsSportChips,
  filterFixturesBySport,
  groupFixturesByDate,
  parseEventsSportParam,
} from "@/lib/events/scope";
import {
  eventsCityLabel,
  filterFixturesByCity,
  parseEventsCityParam,
} from "@/lib/sports/events-city";
import { selectFeaturedFixture } from "@/lib/sports/events-feed";
import { getUpcomingFixtures } from "@/services/events";
import type { Metadata } from "next";
import Link from "next/link";

export const revalidate = 300;

type EventsSearchParams = {
  city?: string | string[];
  sport?: string | string[];
};

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<EventsSearchParams>;
}): Promise<Metadata> {
  const params = await searchParams;
  const sport = parseEventsSportParam(params.sport);
  const city = parseEventsCityParam(params.city);
  const copy = eventsListCopy({ sport, city });
  return {
    title: copy.title,
    description: copy.description,
  };
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<EventsSearchParams>;
}) {
  const params = await searchParams;
  const sport = parseEventsSportParam(params.sport);
  const city = parseEventsCityParam(params.city);
  const cityName = eventsCityLabel(city);
  const copy = eventsListCopy({ sport, city });
  const chips = eventsSportChips({ sport, city });
  const allFixtures = await getUpcomingFixtures({ limit: 24 });
  const fixtures = filterFixturesByCity(
    filterFixturesBySport(allFixtures, sport),
    city,
  );
  const featured = selectFeaturedFixture(fixtures);
  const list = featured
    ? fixtures.filter((item) => item.slug !== featured.slug)
    : fixtures;
  const now = new Date();
  const groups = groupFixturesByDate(list, now);

  return (
    <div className="min-h-screen bg-[#0c0f0c] text-white">
      <section className="border-b border-white/5 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="font-display text-4xl tracking-wide text-white sm:text-5xl">
            {copy.heading}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
            {copy.sub}
          </p>

          <div className="mt-6 space-y-3">
            <EventsSportFilter chips={chips} />
            <EventsCityFilter city={city} sport={sport} />
          </div>
        </div>
      </section>

      <section className="px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {featured ? (
            <div className="mb-8">
              <FeaturedFixtureHero fixture={featured} now={now} compact />
            </div>
          ) : null}

          {fixtures.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/12 bg-[#141814] px-5 py-10 text-center">
              <p className="text-sm leading-relaxed text-zinc-400">
                {sport && cityName
                  ? `No upcoming ${copy.heading.toLowerCase()} listed for ${cityName} yet.`
                  : sport
                    ? `No upcoming ${copy.heading.toLowerCase()} listed yet.`
                    : cityName
                      ? `No upcoming fixtures listed for ${cityName} yet.`
                      : "No upcoming fixtures listed yet."}
              </p>
              {sport || city ? (
                <Link
                  href={
                    sport
                      ? eventsListHref({ sport })
                      : eventsListHref()
                  }
                  className="mt-5 inline-flex min-h-10 items-center justify-center text-sm font-medium text-sky-300 hover:text-white"
                >
                  {city && sport ? "All cities" : "All events"}
                </Link>
              ) : null}
            </div>
          ) : list.length === 0 ? null : (
            <div className="space-y-8">
              {groups.map((group) => (
                <div key={group.id}>
                  <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                    {group.label}
                  </h2>
                  <div className="divide-y divide-white/8 overflow-hidden rounded-2xl border border-white/8 bg-[#141814] px-4 sm:px-5">
                    {group.fixtures.map((item) => (
                      <FixtureRow
                        key={item.slug}
                        fixture={item}
                        now={now}
                        compact
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
