import { FeaturedFixtureHero } from "@/components/events/FeaturedFixtureHero";
import {
  formatFixtureWhen,
  fixtureWatchHref,
  type UpcomingFixture,
} from "@/lib/sports/events-feed";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

export function HomeUpcomingEvents({
  fixtures,
  featured = null,
}: {
  fixtures: UpcomingFixture[];
  featured?: UpcomingFixture | null;
}) {
  if (!featured && fixtures.length === 0) return null;

  const now = new Date();

  return (
    <section className="border-t border-white/5 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-sky-400">
              Big games
            </p>
            <h2 className="font-display text-4xl tracking-wide text-white sm:text-5xl">
              Upcoming fixtures
            </h2>
            <p className="mt-3 max-w-xl text-sm text-zinc-400 sm:text-base">
              Tests, derbies, and race weekends — then find a venue screening
              them.
            </p>
          </div>
          <Link
            href="/events"
            className="inline-flex min-h-10 items-center gap-1.5 text-sm font-medium text-zinc-300 transition-colors hover:text-white"
          >
            All events
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        {featured ? (
          <div className="mb-6">
            <FeaturedFixtureHero fixture={featured} now={now} />
          </div>
        ) : null}

        {fixtures.length === 0 ? null : (
          <ul className="divide-y divide-white/8 overflow-hidden rounded-3xl border border-white/8 bg-[#141814]">
            {fixtures.map((fixture) => {
              const when = formatFixtureWhen(fixture.startsAt, now);
              const venueCount = fixture.venues.length;
              return (
                <li key={fixture.slug}>
                  <Link
                    href={fixtureWatchHref(fixture)}
                    className="flex flex-col gap-2 px-5 py-5 transition-colors hover:bg-white/4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6"
                  >
                    <div className="min-w-0">
                      <div className="mb-1.5 flex flex-wrap items-center gap-2">
                        {fixture.sportSlug ? (
                          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-400">
                            {fixture.sportSlug.replace(/-/g, " ")}
                          </span>
                        ) : null}
                        {when ? (
                          <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-500">
                            {when}
                          </span>
                        ) : null}
                      </div>
                      <p className="truncate text-base font-medium text-white sm:text-lg">
                        {fixture.title}
                      </p>
                      <p className="mt-1 text-sm text-zinc-500">
                        {venueCount > 0
                          ? `${venueCount} venue${venueCount === 1 ? "" : "s"} screening`
                          : "On the calendar"}
                      </p>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-zinc-400">
                      {venueCount > 0 ? "Where to watch" : "View"}
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
