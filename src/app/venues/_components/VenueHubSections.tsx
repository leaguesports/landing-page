import { ConversionCtaLink } from "@/components/conversion/CtaPair";
import { formatFixtureWhen, type UpcomingFixture } from "@/lib/sports/events-feed";
import { fixtureWatchHref } from "@/lib/sports/events-path";
import { isScorecardSport, selectCtaMatrix } from "@/lib/conversion/cta-matrix";
import type { FollowedVenue } from "@/lib/venues/follow";
import {
  VENUE_HUB_FAVOURITES_EMPTY,
  type VenueHubDirectoryLink,
  type VenueHubOnNowCard,
} from "@/lib/venues/hub";
import type { VenueDetail } from "@/services/venues";
import { ArrowUpRight, CalendarDays, Heart, MapPin } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { VenueDirectoryCard } from "./VenueDirectoryCard";
import { VenueHubTrackedLink } from "./VenueHubTrackedLink";

function SectionFrame({
  id,
  label,
  title,
  description,
  action,
  children,
}: {
  id: string;
  label: string;
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-28 border-t border-white/5 px-4 py-10 sm:px-6 sm:py-12 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand)]">
              {label}
            </p>
            <h2 className="font-display text-3xl tracking-wide text-white sm:text-4xl">
              {title}
            </h2>
            {description ? (
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                {description}
              </p>
            ) : null}
          </div>
          {action}
        </div>
        {children}
      </div>
    </section>
  );
}

export function VenueHubOnNow({ cards }: { cards: VenueHubOnNowCard[] }) {
  if (cards.length === 0) return null;

  return (
    <SectionFrame
      id="on-now"
      label="On now"
      title="Venues with something on"
      description="Screenings in the next couple of days — venue plus what’s playing."
      action={
        <Link
          href="/events"
          className="inline-flex min-h-10 items-center gap-1.5 text-sm font-medium text-sky-300 hover:text-sky-200"
        >
          See all fixtures
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      }
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => {
          const when = formatFixtureWhen(card.startsAt);
          return (
            <article
              key={`${card.venueSlug}-${card.fixtureSlug}`}
              className="flex flex-col rounded-3xl border border-white/8 bg-[#141814] p-5"
            >
              <h3 className="text-lg font-medium text-white">{card.venueName}</h3>
              {card.city ? (
                <p className="mt-2 flex items-center gap-1.5 text-sm text-zinc-500">
                  <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  {card.city}
                </p>
              ) : null}
              <p className="mt-3 inline-flex items-start gap-1.5 text-sm text-sky-300">
                <CalendarDays className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                <span>
                  {card.fixtureTitle}
                  {when ? ` · ${when}` : ""}
                </span>
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <VenueHubTrackedLink
                  href={`/events/${card.fixtureSlug}`}
                  ctaId="find_screening"
                  sport={card.sportSlug}
                  city={card.city}
                  slug={card.fixtureSlug}
                  className="inline-flex min-h-10 items-center justify-center rounded-full bg-white px-4 text-sm font-semibold text-zinc-950 transition-colors hover:bg-sky-400 hover:text-white"
                >
                  Where to watch
                </VenueHubTrackedLink>
                <VenueHubTrackedLink
                  href={`/venues/${card.venueSlug}`}
                  ctaId="open_venue"
                  sport={card.sportSlug}
                  city={card.city}
                  slug={card.venueSlug}
                  className="inline-flex min-h-10 items-center justify-center rounded-full border border-white/12 px-4 text-sm font-medium text-white transition-colors hover:bg-white hover:text-zinc-950"
                >
                  Open venue
                </VenueHubTrackedLink>
              </div>
            </article>
          );
        })}
      </div>
    </SectionFrame>
  );
}

export function VenueHubEventTiles({
  fixtures,
  sportSlug,
}: {
  fixtures: UpcomingFixture[];
  sportSlug: string | null;
}) {
  if (fixtures.length === 0) return null;

  return (
    <SectionFrame
      id="fixtures"
      label="Fixtures"
      title={sportSlug ? `What’s on for ${sportSlug.replace(/-/g, " ")}` : "Upcoming fixtures"}
      description="Tap a fixture for detail and where to watch."
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {fixtures.map((item) => {
          const when = formatFixtureWhen(item.startsAt);
          const href = fixtureWatchHref(item);
          return (
            <VenueHubTrackedLink
              key={item.slug}
              href={href}
              ctaId="open_fixture"
              sport={item.sportSlug}
              slug={item.slug}
              className="group rounded-3xl border border-white/8 bg-[#141814] p-5 transition-colors hover:border-white/16"
            >
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-400">
                {item.sportSlug?.replace(/-/g, " ") ?? "Fixture"}
                {when ? ` · ${when}` : ""}
              </p>
              <h3 className="font-display text-2xl tracking-wide text-white transition-colors group-hover:text-[var(--color-brand)]">
                {item.title}
              </h3>
              <p className="mt-2 text-sm text-zinc-400">
                {item.venues.length > 0
                  ? `${item.venues.length} venue${item.venues.length === 1 ? "" : "s"} screening`
                  : "Find where to watch"}
              </p>
            </VenueHubTrackedLink>
          );
        })}
      </div>
    </SectionFrame>
  );
}

function RecommendedCardCta({ venue }: { venue: VenueDetail }) {
  const playSport = venue.sports.find((sport) => sport.slug)?.slug ?? null;
  const watchSport = venue.broadcasts.find((sport) => sport.slug)?.slug ?? null;
  const city = venue.address.city || venue.address.suburb || null;
  const sport = playSport ?? watchSport;
  if (!sport && !watchSport) return null;

  const playIntent = Boolean(playSport && isScorecardSport(playSport));
  const matrix = selectCtaMatrix({
    pageType: "venue",
    sport,
    city,
    venueSlug: venue.slug,
    hasScorecard: playIntent,
  });

  return (
    <div className="px-5 pb-5">
      <ConversionCtaLink
        cta={matrix.primary}
        matrix={matrix}
        slot="inline"
        tone={playIntent ? "play" : "watch"}
        variant="secondary"
        sport={sport}
        city={city}
        slug={venue.slug}
        className="inline-flex min-h-10 items-center justify-center rounded-full border border-white/12 px-4 text-sm font-medium text-white transition-colors hover:bg-white hover:text-zinc-950"
      />
    </div>
  );
}

export function VenueHubRecommended({
  venues,
  cityLabel,
}: {
  venues: VenueDetail[];
  cityLabel: string | null;
}) {
  if (venues.length === 0) return null;

  return (
    <SectionFrame
      id="recommended"
      label="Recommended"
      title={cityLabel ? `Popular in ${cityLabel}` : "Popular nationwide"}
      description={
        cityLabel
          ? "A short list from your city — not the full directory."
          : "Editorial / popular picks until we know your city."
      }
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {venues.map((venue) => (
          <div key={venue._id} className="overflow-hidden rounded-3xl">
            <VenueDirectoryCard venue={venue} intent={null} />
            <div className="-mt-px rounded-b-3xl border border-t-0 border-white/8 bg-[#141814]">
              <RecommendedCardCta venue={venue} />
            </div>
          </div>
        ))}
      </div>
    </SectionFrame>
  );
}

export function VenueHubFavourites({
  signedIn,
  venues,
}: {
  signedIn: boolean;
  venues: FollowedVenue[];
}) {
  if (!signedIn) return null;

  return (
    <SectionFrame
      id="favourites"
      label="Favourites"
      title="Venues you follow"
      description="Pinned from venue follow — the same list as your hub."
    >
      {venues.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/12 bg-[#141814] px-5 py-10 text-center">
          <Heart className="mx-auto mb-3 h-8 w-8 text-zinc-600" aria-hidden />
          <p className="text-sm text-zinc-400">{VENUE_HUB_FAVOURITES_EMPTY}</p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {venues.map((venue) => (
            <li key={venue.id}>
              <Link
                href={`/venues/${venue.slug}`}
                className="flex min-h-16 items-center justify-between gap-3 rounded-2xl border border-white/8 bg-[#141814] px-4 py-3 transition-colors hover:border-white/16"
              >
                <span className="text-sm font-medium text-white">{venue.name}</span>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-zinc-500" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </SectionFrame>
  );
}

export function VenueHubDirectories({
  links,
}: {
  links: VenueHubDirectoryLink[];
}) {
  const intent = links.filter((link) => link.group === "intent");
  const cities = links.filter((link) => link.group === "cities");
  const sports = links.filter((link) => link.group === "sports");

  return (
    <section
      id="directories"
      className="border-t border-white/5 px-4 py-12 sm:px-6 sm:py-16 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand)]">
          Browse directories
        </p>
        <h2 className="font-display text-3xl tracking-wide text-white sm:text-4xl">
          Watch, Play, cities, and sports
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-400">
          Jump into the existing SEO landings. This page does not list every
          venue.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          {intent.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-[var(--color-brand)]"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="mt-10">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Cities
          </h3>
          <ul className="flex flex-wrap gap-2">
            {cities.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex min-h-10 items-center rounded-full border border-white/10 bg-white/4 px-3.5 text-sm text-zinc-300 transition-colors hover:border-white/20 hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Sports
          </h3>
          <ul className="flex flex-wrap gap-2">
            {sports.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex min-h-10 items-center rounded-full border border-white/10 bg-white/4 px-3.5 text-sm text-zinc-300 transition-colors hover:border-white/20 hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
