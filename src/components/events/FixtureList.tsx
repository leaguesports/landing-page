import { FixtureLiveChip } from "@/components/events/FixtureLiveChip";
import { venuePlacesLabel } from "@/lib/events/scope";
import { ensureFixtureFeed } from "@/lib/fixtures/feed-store";
import { fixtureWatchHref } from "@/lib/sports/events-path";
import {
  formatFixtureWhen,
  type UpcomingFixture,
} from "@/lib/sports/events-feed";
import { ArrowUpRight, MapPin, Tv } from "lucide-react";
import Link from "next/link";

function sportLabel(slug: string | null): string | null {
  if (!slug) return null;
  return slug.replace(/-/g, " ");
}

export function FixtureRow({
  fixture,
  now,
  compact = false,
}: {
  fixture: UpcomingFixture;
  now?: Date;
  compact?: boolean;
}) {
  const when = formatFixtureWhen(fixture.startsAt, now);
  const href = fixtureWatchHref(fixture);
  const sport = sportLabel(fixture.sportSlug);
  const venueCount = fixture.venues.length;
  const places = venuePlacesLabel(venueCount);
  const feedHref = `/events/${fixture.slug}`;
  const board =
    href.startsWith("/events/")
      ? ensureFixtureFeed({
          slug: fixture.slug,
          title: fixture.title,
          sportSlug: fixture.sportSlug,
          venueCount,
        }).board
      : null;

  return (
    <div className={compact ? "py-3 first:pt-3 last:pb-3" : "border-t border-white/8 py-5 first:border-t-0 first:pt-0"}>
      <Link
        href={href}
        className="group flex items-start justify-between gap-4"
      >
        <div className="min-w-0">
          <p className="flex flex-wrap items-baseline gap-x-2 text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-500">
            {sport ? (
              <span className="font-semibold tracking-[0.14em] text-sky-400">
                {sport}
              </span>
            ) : null}
            {sport && when ? <span aria-hidden>·</span> : null}
            {when ? <span>{when}</span> : null}
          </p>
          <h3
            className={`mt-1 font-display tracking-wide text-white transition-colors group-hover:text-[var(--color-brand)] ${
              compact ? "text-lg sm:text-xl" : "text-2xl sm:text-3xl"
            }`}
          >
            {fixture.title}
          </h3>
          {places ? (
            <p className="mt-1 text-xs text-zinc-500">{places}</p>
          ) : null}
        </div>
        {!compact ? (
          <span className="inline-flex min-h-10 shrink-0 items-center gap-1.5 text-sm font-medium text-zinc-300 transition-colors group-hover:text-white">
            {venueCount > 0 ? "Open feed" : "View event"}
            <ArrowUpRight className="h-4 w-4" />
          </span>
        ) : null}
      </Link>
      {board && !compact ? <FixtureLiveChip href={feedHref} board={board} /> : null}
    </div>
  );
}

export function FixtureVenueList({ fixture }: { fixture: UpcomingFixture }) {
  if (fixture.venues.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-white/12 bg-white/3 px-5 py-8 text-center">
        <Tv className="mx-auto mb-3 h-8 w-8 text-zinc-600" aria-hidden />
        <p className="text-sm leading-relaxed text-zinc-400">
          No venues have listed this screening yet. Browse Watch to find bars
          and fan zones for {sportLabel(fixture.sportSlug) ?? "this sport"}.
        </p>
        <Link
          href={
            fixture.sportSlug
              ? `/watch/${encodeURIComponent(fixture.sportSlug)}`
              : "/watch"
          }
          className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-sky-400 hover:text-white"
        >
          Browse Watch
        </Link>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-white/8 overflow-hidden rounded-3xl border border-white/8 bg-[#141814]">
      {fixture.venues.map((venue) => (
        <li key={venue.slug}>
          <Link
            href={`/venues/${venue.slug}`}
            className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-white/4 sm:px-6"
          >
            <span className="flex min-w-0 items-center gap-3">
              <MapPin
                className="h-4 w-4 shrink-0 text-sky-400"
                aria-hidden
              />
              <span className="truncate text-sm font-medium text-white sm:text-base">
                {venue.name}
              </span>
            </span>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-zinc-500" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
