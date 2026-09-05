import {
  fixtureWatchHref,
  formatFixtureWhen,
  type UpcomingFixture,
} from "@/lib/sports/events-feed";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

function sportLabel(slug: string | null): string | null {
  if (!slug) return null;
  return slug.replace(/-/g, " ");
}

export function FeaturedFixtureHero({
  fixture,
  now,
}: {
  fixture: UpcomingFixture;
  now?: Date;
}) {
  const when = formatFixtureWhen(fixture.startsAt, now);
  const href = fixtureWatchHref(fixture);
  const sport = sportLabel(fixture.sportSlug);
  const venueCount = fixture.venues.length;

  return (
    <article className="relative overflow-hidden rounded-3xl border border-sky-400/25 bg-linear-to-br from-sky-950/45 via-[#141814] to-[#141814] px-5 py-6 sm:px-8 sm:py-8">
      <div className="pointer-events-none absolute -right-16 top-0 h-48 w-48 rounded-full bg-sky-500/15 blur-3xl" />
      <div className="relative">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-sky-400">
          Featured fixture
        </p>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {sport ? (
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-300">
              {sport}
            </span>
          ) : null}
          {when ? (
            <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-400">
              {when}
            </span>
          ) : null}
        </div>
        <h2 className="font-display max-w-3xl text-3xl tracking-wide text-white sm:text-4xl lg:text-5xl">
          {fixture.title}
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-400 sm:text-base">
          {venueCount > 0
            ? `${venueCount} venue${venueCount === 1 ? "" : "s"} screening this one.`
            : "On the calendar — find a bar or fan zone when listings land."}
        </p>
        <Link
          href={href}
          className="mt-6 inline-flex min-h-11 items-center gap-1.5 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-sky-400 hover:text-white"
        >
          {venueCount > 0 ? "Where to watch" : "View event"}
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
