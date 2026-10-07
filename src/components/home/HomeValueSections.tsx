import {
  buildWatchFixtureFace,
  formatWatchFixtureDateStamp,
  watchFixtureFill,
  watchFixtureInk,
  type WatchFixtureSide,
} from "@/lib/intent/watch-fixture-card";
import { venueDirectoryHref } from "@/lib/search/venueSearch";
import { fixtureWatchHref } from "@/lib/sports/events-path";
import {
  sortUpcomingFixtures,
  type UpcomingFixture,
} from "@/lib/sports/events-feed";
import { hasSportIcon, SportIcon } from "@/components/icons/sports";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import Link from "next/link";

const TRENDING_LIMIT = 8;

/** Featured fixtures first, then the soonest on the calendar. */
function trendingFixtures(fixtures: UpcomingFixture[]): UpcomingFixture[] {
  const sorted = sortUpcomingFixtures(fixtures);
  const featured = sorted.filter((item) => item.featured);
  const rest = sorted.filter((item) => !item.featured);
  return [...featured, ...rest].slice(0, TRENDING_LIMIT);
}

const eventChipClassName =
  "inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-zinc-300";

function sportLabel(slug: string | null): string | null {
  if (!slug) return null;
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function TeamBadge({
  side,
  role,
}: {
  side: WatchFixtureSide;
  role: "home" | "away";
}) {
  const fill = watchFixtureFill(side.primaryColour, role);
  const ink = watchFixtureInk(fill);
  return (
    <span
      className="inline-flex h-7 w-11 shrink-0 items-center justify-center rounded-md text-[11px] font-bold tracking-wide"
      style={{ backgroundColor: fill, color: ink }}
    >
      {side.shortCode}
    </span>
  );
}

function fixtureFace(fixture: UpcomingFixture) {
  const venueNames: Record<string, string> = {};
  for (const venue of fixture.venues) venueNames[venue.slug] = venue.name;
  return buildWatchFixtureFace({
    title: fixture.title,
    startsAt: fixture.startsAt ?? "",
    teams: fixture.teams,
    venueSlugs: fixture.venues.map((venue) => venue.slug),
    venueNames,
  });
}

export function HomeValueSections({
  fixtures = [],
}: {
  fixtures?: UpcomingFixture[];
}) {
  const trending = trendingFixtures(fixtures);

  return (
    <>
      <section className="relative border-t border-white/5 bg-[#0c0f0c] py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-400">
                Watch
              </p>
              <h2 className="mt-2 font-display text-4xl tracking-wide text-white sm:text-5xl">
                Trending events
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400 sm:text-base">
                The next fixtures on the calendar. Open one to find a screen.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <Link
                href="/events"
                className="inline-flex min-h-10 items-center gap-1.5 text-sm font-medium text-zinc-300 transition-colors hover:text-white"
              >
                All events
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                href={venueDirectoryHref({ intent: "watch" })}
                className="inline-flex min-h-10 items-center text-sm font-medium text-sky-300 transition-colors hover:text-white"
              >
                Browse watch venues
              </Link>
            </div>
          </div>

          {trending.length > 0 ? (
            <ul className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {trending.map((fixture) => {
                const sport = sportLabel(fixture.sportSlug);
                const face = fixtureFace(fixture);
                const paired = Boolean(face.home && face.away);
                const date = fixture.startsAt
                  ? formatWatchFixtureDateStamp(fixture.startsAt)
                  : null;
                return (
                  <li
                    key={fixture.slug}
                    className="w-[82%] shrink-0 snap-start sm:w-[22rem] lg:w-[calc((100%-2rem)/3.15)]"
                  >
                    <Link
                      href={fixtureWatchHref(fixture)}
                      className="group flex h-full min-h-56 flex-col rounded-2xl border border-white/10 bg-[#141814] p-5 transition-colors hover:border-white/30"
                    >
                      <span className="flex items-center justify-between gap-3">
                        <span className="text-base font-semibold tabular-nums text-white">
                          {face.centre.label || "–"}
                        </span>
                        <span className="flex flex-wrap items-center justify-end gap-1.5">
                          {fixture.featured ? (
                            <span className={eventChipClassName}>Featured</span>
                          ) : null}
                          <span className={eventChipClassName}>
                            {hasSportIcon(fixture.sportSlug) ? (
                              <SportIcon
                                sportSlug={fixture.sportSlug}
                                size={14}
                                color="currentColor"
                              />
                            ) : null}
                            {sport ?? "Event"}
                          </span>
                        </span>
                      </span>

                      {paired && face.home && face.away ? (
                        <span className="mt-4 space-y-2">
                          <span className="flex min-w-0 items-center gap-2">
                            <TeamBadge side={face.home} role="home" />
                            <span className="truncate text-sm font-semibold text-white">
                              {face.home.name}
                            </span>
                          </span>
                          <span className="block pl-[3.25rem] text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                            vs
                          </span>
                          <span className="flex min-w-0 items-center gap-2">
                            <TeamBadge side={face.away} role="away" />
                            <span className="truncate text-sm font-semibold text-white">
                              {face.away.name}
                            </span>
                          </span>
                        </span>
                      ) : (
                        <span className="mt-4 line-clamp-3 font-display text-3xl leading-none tracking-wide text-white">
                          {fixture.title}
                        </span>
                      )}

                      {date ? (
                        <span className="mt-3 text-sm text-zinc-400">{date}</span>
                      ) : null}

                      <span className="mt-auto flex items-center justify-between gap-3 pt-6 text-sm text-zinc-300">
                        <span>{face.bottomPill ?? "On the calendar"}</span>
                        <ChevronRight
                          className="h-4 w-4 shrink-0 text-zinc-500 transition-transform group-hover:translate-x-0.5 group-hover:text-white"
                          aria-hidden
                        />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="mt-8 rounded-2xl border border-white/10 bg-[#141814] px-5 py-6">
              <p className="text-sm leading-relaxed text-zinc-400">
                Upcoming fixtures appear here once they are on the Events
                calendar.
              </p>
              <Link
                href="/events"
                className="mt-4 inline-flex min-h-10 items-center text-sm font-medium text-sky-300 hover:text-white"
              >
                See events
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
