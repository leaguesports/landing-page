import { EventsCityFilter } from "@/components/events/EventsCityFilter";
import { FeaturedFixtureHero } from "@/components/events/FeaturedFixtureHero";
import { FixtureRow } from "@/components/events/FixtureList";
import {
  eventsCityLabel,
  filterFixturesByCity,
  parseEventsCityParam,
} from "@/lib/sports/events-city";
import { selectFeaturedFixture } from "@/lib/sports/events-feed";
import { getUpcomingFixtures } from "@/services/events";
import { Tv } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Big games & where to watch",
  description:
    "Find Springboks Tests, derbies, and other big South African fixtures — then see which bars and fan zones are screening them.",
};

export const revalidate = 300;

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string | string[] }>;
}) {
  const params = await searchParams;
  const city = parseEventsCityParam(params.city);
  const cityName = eventsCityLabel(city);
  const allFixtures = await getUpcomingFixtures({ limit: 24 });
  const fixtures = filterFixturesByCity(allFixtures, city);
  const featured = selectFeaturedFixture(fixtures);
  const list = featured
    ? fixtures.filter((item) => item.slug !== featured.slug)
    : fixtures;
  const now = new Date();

  return (
    <div className="min-h-screen bg-[#0c0f0c] text-white">
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-linear-to-br from-sky-950/40 via-[#0c0f0c] to-[#0c0f0c]" />
        <div className="pointer-events-none absolute -right-20 top-10 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-sky-400">
            <Tv className="h-3.5 w-3.5" aria-hidden />
            Events &amp; broadcasts
          </p>
          <h1 className="font-display max-w-4xl text-5xl tracking-wide text-white sm:text-6xl lg:text-7xl">
            Big games.{" "}
            <span className="text-sky-400">Where they&apos;re on.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-400">
            Springboks Tests, derbies, race weekends — see what&apos;s coming
            up, then pick a bar or fan zone screening it near you.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/watch"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-sky-400 hover:text-white"
            >
              Browse Watch
            </Link>
            <Link
              href="/venues"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/12 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white hover:text-zinc-950"
            >
              Find a venue
            </Link>
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 max-w-xl">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand)]">
              Upcoming
            </p>
            <h2 className="font-display text-4xl tracking-wide text-white sm:text-5xl">
              Fixtures
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400 sm:text-base">
              {cityName
                ? `Screenings in ${cityName}, plus national fixtures on the calendar.`
                : "Grouped from venue screenings and the event calendar — one fixture, every place showing it."}
            </p>
          </div>

          <div className="mb-8">
            <EventsCityFilter city={city} />
          </div>

          {featured ? (
            <div className="mb-8">
              <FeaturedFixtureHero fixture={featured} now={now} />
            </div>
          ) : null}

          {fixtures.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/12 bg-[#141814] px-5 py-12 text-center">
              <p className="text-sm leading-relaxed text-zinc-400">
                {cityName
                  ? `No upcoming fixtures listed for ${cityName} yet. Try another city, or browse Watch for venues that screen live sport.`
                  : "No upcoming fixtures listed yet. Browse Watch for venues that screen live sport, or check back when the next big game lands."}
              </p>
              {city ? (
                <Link
                  href="/events"
                  className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-sky-400 hover:text-white"
                >
                  All cities
                </Link>
              ) : (
                <Link
                  href="/watch/rugby"
                  className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-sky-400 hover:text-white"
                >
                  Watch rugby
                </Link>
              )}
            </div>
          ) : list.length === 0 ? null : (
            <div className="rounded-3xl border border-white/8 bg-[#141814] px-5 py-2 sm:px-8">
              {list.map((fixture) => (
                <FixtureRow key={fixture.slug} fixture={fixture} now={now} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
