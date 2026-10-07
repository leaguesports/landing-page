import { HomeScorecardPreview } from "@/components/home/HomeScorecardPreview";
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
import { ArrowUpRight, ChevronRight, MapPin, Trophy } from "lucide-react";
import Link from "next/link";

const TRENDING_LIMIT = 8;

/** Featured fixtures first, then the soonest on the calendar. */
function trendingFixtures(fixtures: UpcomingFixture[]): UpcomingFixture[] {
  const sorted = sortUpcomingFixtures(fixtures);
  const featured = sorted.filter((item) => item.featured);
  const rest = sorted.filter((item) => !item.featured);
  return [...featured, ...rest].slice(0, TRENDING_LIMIT);
}

function sportLabel(slug: string | null): string | null {
  if (!slug) return null;
  return slug.replace(/-/g, " ");
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

const CHECK = (
  <svg
    className="mt-1 h-5 w-5 shrink-0 text-emerald-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    aria-hidden
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 13l4 4L19 7"
    />
  </svg>
);

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
                        <span className="flex items-center gap-2">
                          {fixture.featured ? (
                            <span className="rounded-full bg-sky-400/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-200">
                              Featured
                            </span>
                          ) : null}
                          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-400">
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

      <section className="relative border-t border-white/5 bg-[#0c0f0c] py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 text-sm text-zinc-300">
                <MapPin className="h-4 w-4 text-emerald-400" aria-hidden />
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
                  Play
                </span>
              </div>
              <h2 className="font-display text-4xl tracking-wide text-white sm:text-5xl">
                Find a court, then keep the score
              </h2>
              <p className="max-w-xl text-base leading-relaxed text-zinc-400 sm:text-lg">
                Search play venues by suburb, city, or sport — padel, golf, and
                more. Start a scorecard when you arrive so the result lands on
                your history and the venue.
              </p>
              <ul className="space-y-3 text-zinc-300">
                <li className="flex items-start gap-3">
                  {CHECK}
                  <span>Play directories across South Africa&apos;s metros</span>
                </li>
                <li className="flex items-start gap-3">
                  {CHECK}
                  <span>City hubs for Cape Town, Joburg, Durban, and Pretoria</span>
                </li>
                <li className="flex items-start gap-3">
                  {CHECK}
                  <span>Quick-start scorecards from a venue page</span>
                </li>
              </ul>
              <Link
                href={venueDirectoryHref({ intent: "play" })}
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-emerald-400 px-6 text-sm font-semibold text-zinc-950 transition-colors hover:bg-emerald-300"
              >
                Find a court
              </Link>
            </div>
            <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#141814] p-6 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                Popular searches
              </p>
              <ul className="mt-5 space-y-3">
                {[
                  {
                    label: "Padel in Cape Town",
                    href: venueDirectoryHref({
                      intent: "play",
                      sport: "padel",
                      location: "cape-town",
                    }),
                  },
                  {
                    label: "Golf in Johannesburg",
                    href: venueDirectoryHref({
                      intent: "play",
                      sport: "golf",
                      location: "johannesburg",
                    }),
                  },
                  {
                    label: "Play venues near me",
                    href: venueDirectoryHref({ intent: "play" }),
                  },
                ].map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="flex min-h-12 items-center justify-between rounded-2xl border border-white/8 bg-white/3 px-4 text-sm font-medium text-white transition-colors hover:border-white/16 hover:bg-white/6"
                    >
                      {item.label}
                      <span className="text-emerald-300" aria-hidden>
                        →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="relative border-t border-white/5 bg-[#0c0f0c] py-16 sm:py-24">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute right-1/4 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-3xl" />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 text-sm text-zinc-300">
                <Trophy className="h-4 w-4 text-emerald-400" aria-hidden />
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
                  Scorecards
                </span>
              </div>
              <h2 className="font-display text-4xl tracking-wide text-white sm:text-5xl">
                Lock every match to your history
              </h2>
              <p className="max-w-xl text-base leading-relaxed text-zinc-400 sm:text-lg">
                Live scorecards for padel and golf — track the match on your
                phone, lock the result, and keep it on your athlete hub and the
                court.
              </p>
              <ul className="space-y-3 text-zinc-300">
                <li className="flex items-start gap-3">
                  {CHECK}
                  <span>Real-time scoring for padel and golf rounds</span>
                </li>
                <li className="flex items-start gap-3">
                  {CHECK}
                  <span>Locked results sync to your athlete hub</span>
                </li>
                <li className="flex items-start gap-3">
                  {CHECK}
                  <span>Share the scorecard with your pairing</span>
                </li>
              </ul>
              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <Link
                  href="/padel/new"
                  className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-zinc-950 transition-transform hover:scale-[1.03]"
                >
                  Start a scorecard
                </Link>
                <Link
                  href="/athletes"
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/12 px-6 text-sm font-medium text-white transition-colors hover:bg-white hover:text-zinc-950"
                >
                  See athlete tools
                </Link>
              </div>
            </div>
            <HomeScorecardPreview className="animate-rise mx-auto w-full max-w-md lg:mx-0" />
          </div>
        </div>
      </section>
    </>
  );
}
