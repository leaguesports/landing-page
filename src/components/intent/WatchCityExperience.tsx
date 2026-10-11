"use client";

import { CoverageNotify } from "@/components/conversion/CoverageNotify";
import { WatchFixtureCard } from "@/components/intent/WatchFixtureCard";
import { VenueListCard } from "@/components/venues/VenueListCard";
import { distanceKm, useGeolocation } from "@/hooks/useGeolocation";
import type { CtaMatrix } from "@/lib/conversion/cta-matrix";
import {
  groupWatchFixturesByDay,
  watchAllFixturesHref,
  watchCarouselFixtures,
  watchFixtureSelectionDetail,
  watchSportMicroLabel,
  watchStripCompetition,
} from "@/lib/intent/watch-fixture-card";
import {
  filterWatchHubCards,
  sortWatchHubCards,
  watchPlaceLine,
  watchShowingLabel,
  type WatchHubCardModel,
  type WatchHubFixtureRow,
} from "@/lib/intent/watch-hub";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";

const chipOn =
  "border-transparent bg-emerald-400 font-semibold text-zinc-950";
const chipOff =
  "border-white/10 bg-white/5 text-zinc-200 hover:border-white/20 hover:text-white";

export type WatchCityExperienceProps = {
  mode: "sport" | "city";
  heading: string;
  introParagraphs?: string[];
  promise: string;
  livingCount: string;
  sportName: string | null;
  venueHeading: string;
  cityTitle: string;
  /** Metro name used in “from {City} centre”. */
  distanceCityTitle: string;
  citySlug: string;
  cityHubHref: string | null;
  suburbChips: string[];
  sportChips: { slug: string; name: string; href: string }[];
  fixtureRows: WatchHubFixtureRow[];
  /** `?view=fixtures` — date-grouped fat cards instead of the carousel. */
  fixturesView: boolean;
  cards: WatchHubCardModel[];
  todayYmd: string | null;
  centroid: { latitude: number; longitude: number } | null;
  initialFixtureKey: string | null;
  empty: {
    title: string;
    body: string;
    eventsHref: string;
    guide: { href: string; label: string } | null;
    sibling: { href: string; label: string } | null;
  };
  usedCityFallback: boolean;
  fallbackSuburb: string | null;
  fallbackCity: string | null;
  matrix: CtaMatrix;
  sportSlug: string | null;
  sourcePage: string;
};

export function WatchCityExperience({
  mode,
  heading,
  introParagraphs = [],
  promise,
  livingCount,
  sportName,
  venueHeading,
  cityTitle,
  distanceCityTitle,
  citySlug,
  cityHubHref,
  suburbChips,
  sportChips,
  fixtureRows,
  fixturesView,
  cards,
  todayYmd,
  centroid,
  initialFixtureKey,
  empty,
  usedCityFallback,
  fallbackSuburb,
  fallbackCity,
  matrix,
  sportSlug,
  sourcePage,
}: WatchCityExperienceProps) {
  const venuesRef = useRef<HTMLElement | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [suburb, setSuburb] = useState<string | null>(null);
  const [fixtureKey, setFixtureKey] = useState<string | null>(initialFixtureKey);
  const geo = useGeolocation();
  const hasCoords = cards.some(
    (card) => card.latitude != null && card.longitude != null,
  );

  const selected = fixtureRows.find((row) => row.key === fixtureKey) ?? null;
  const originKind = geo.coords ? "user" : centroid ? "centre" : null;
  const originCoords = geo.coords ?? centroid;

  const visible = useMemo(() => {
    const filtered = filterWatchHubCards(cards, {
      suburb,
      fixtureVenueSlugs: selected ? selected.venueSlugs : null,
    });
    const decorated = filtered.map((card) => {
      const distance =
        originCoords && card.latitude != null && card.longitude != null
          ? distanceKm(originCoords, {
              latitude: card.latitude,
              longitude: card.longitude,
            })
          : null;
      return {
        card,
        distanceKm: distance,
        hasUpcoming: card.screenings.length > 0,
        name: card.name,
        suburb: card.suburb,
      };
    });
    return sortWatchHubCards(decorated, {
      fixtureSelected: Boolean(selected),
      hasAnyDistance: decorated.some((item) => item.distanceKm != null),
    });
  }, [cards, suburb, selected, originCoords]);

  const filtering = Boolean(suburb || selected);
  const upcomingLabel = sportName?.trim()
    ? `Upcoming ${sportName.trim().toLowerCase()}`
    : "Upcoming sport";
  const carouselRows = watchCarouselFixtures(fixtureRows);
  const dayGroups = groupWatchFixturesByDay(fixtureRows);
  const stripCompetition = watchStripCompetition(carouselRows);
  const sportCount = new Set(
    fixtureRows.map((row) => row.sportSlug).filter((slug): slug is string => Boolean(slug)),
  ).size;
  const showSportMicro = mode === "city" && sportCount > 1;
  const allFixturesHref = watchAllFixturesHref(sourcePage);
  const selectionDetail = selected
    ? watchFixtureSelectionDetail({
        count: visible.length,
        title: selected.title,
        homeCode: selected.face.home?.shortCode,
        awayCode: selected.face.away?.shortCode,
      })
    : null;

  function sportLabelFor(row: WatchHubFixtureRow): string | null {
    if (!showSportMicro) return null;
    return watchSportMicroLabel(row.sportName);
  }

  function scrollCarousel(direction: -1 | 1) {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-watch-fixture-card]");
    const delta = (card?.offsetWidth ?? 280) + 12;
    el.scrollBy({ left: direction * delta, behavior: "smooth" });
  }

  function onFixture(key: string) {
    const next = fixtureKey === key ? null : key;
    setFixtureKey(next);
    if (next) {
      venuesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function clearFixture() {
    setFixtureKey(null);
  }

  return (
    <div data-watch-hub={mode}>
      <header className="border-b border-white/5 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="font-display max-w-4xl text-4xl tracking-wide text-white sm:text-5xl">
            {heading}
          </h1>
          {introParagraphs.length > 0 ? (
            <div className="mt-3 max-w-2xl space-y-3 text-sm leading-relaxed text-zinc-400 sm:text-base">
              {introParagraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 48)}>{paragraph}</p>
              ))}
            </div>
          ) : null}
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
            {promise}
          </p>
          <p className="mt-3 text-sm font-medium text-emerald-300" data-watch-count="">
            {livingCount}
          </p>
          {mode === "sport" && cityHubHref ? (
            <p className="mt-2">
              <Link
                href={cityHubHref}
                className="text-sm font-medium text-emerald-300 hover:text-white"
              >
                All sports in {distanceCityTitle}
              </Link>
            </p>
          ) : null}

          {mode === "city" && sportChips.length > 0 ? (
            <div className="mt-5" data-watch-sport-chips="">
              <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Sports">
                <span
                  className={`inline-flex shrink-0 items-center rounded-full border px-3 py-1.5 text-sm ${chipOn}`}
                  aria-current="page"
                >
                  All
                </span>
                {sportChips.map((chip) => (
                  <Link
                    key={chip.slug}
                    href={chip.href}
                    data-watch-sport-chip={chip.slug}
                    className={`inline-flex shrink-0 items-center rounded-full border px-3 py-1.5 text-sm ${chipOff}`}
                  >
                    {chip.name}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          {suburbChips.length > 0 ? (
            <div
              className="mt-4 flex gap-2 overflow-x-auto pb-1"
              aria-label="Suburbs"
              data-watch-suburb-chips=""
            >
              <button
                type="button"
                aria-pressed={suburb == null}
                onClick={() => setSuburb(null)}
                className={`inline-flex shrink-0 items-center rounded-full border px-3 py-1.5 text-sm ${
                  suburb == null ? chipOn : chipOff
                }`}
              >
                All
              </button>
              {suburbChips.map((chip) => {
                const on = suburb?.toLowerCase() === chip.toLowerCase();
                return (
                  <button
                    key={chip}
                    type="button"
                    aria-pressed={on}
                    data-watch-suburb={chip}
                    onClick={() => setSuburb(on ? null : chip)}
                    className={`inline-flex shrink-0 items-center rounded-full border px-3 py-1.5 text-sm ${
                      on ? chipOn : chipOff
                    }`}
                  >
                    {chip}
                  </button>
                );
              })}
            </div>
          ) : null}
          {hasCoords ? (
            <div className="mt-2">
              <button
                type="button"
                onClick={() => geo.request()}
                className={`inline-flex items-center rounded-full border px-3 py-1.5 text-sm ${
                  geo.status === "ready" ? chipOn : chipOff
                }`}
                aria-pressed={geo.status === "ready"}
              >
                {geo.status === "loading" ? "Locating…" : "Near me"}
              </button>
            </div>
          ) : null}
          {geo.status === "error" ? (
            <p className="mt-2 text-xs text-zinc-500">
              {centroid
                ? `Location unavailable. Distances stay from ${distanceCityTitle} centre.`
                : "Location unavailable. Showing suburb only."}
            </p>
          ) : null}
        </div>
      </header>

      <section
        aria-labelledby="watch-fixtures"
        className="border-b border-white/5 px-4 py-6 sm:px-6 lg:px-8"
        data-watch-calendar={fixtureRows.length > 0 ? "fixtures" : "empty"}
      >
        <div className="mx-auto max-w-7xl">
          {fixtureRows.length > 0 ? (
            <>
              <div className="flex items-end justify-between gap-3">
                <div className="min-w-0">
                  <h2
                    id="watch-fixtures"
                    className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400"
                  >
                    {upcomingLabel}
                  </h2>
                  {!fixturesView && stripCompetition ? (
                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                      {stripCompetition}
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {!fixturesView && carouselRows.length > 1 ? (
                    <div className="hidden items-center gap-1 md:flex">
                      <button
                        type="button"
                        aria-label="Previous fixtures"
                        onClick={() => scrollCarousel(-1)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-white hover:bg-white hover:text-zinc-950"
                      >
                        <ChevronLeft className="h-4 w-4" aria-hidden />
                      </button>
                      <button
                        type="button"
                        aria-label="Next fixtures"
                        onClick={() => scrollCarousel(1)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-white hover:bg-white hover:text-zinc-950"
                      >
                        <ChevronRight className="h-4 w-4" aria-hidden />
                      </button>
                    </div>
                  ) : null}
                  {fixturesView ? (
                    <Link
                      href={sourcePage}
                      className="text-sm font-semibold text-emerald-300 hover:text-white"
                    >
                      Show less
                    </Link>
                  ) : (
                    <Link
                      href={allFixturesHref}
                      data-watch-view-all=""
                      className="text-sm font-semibold text-emerald-300 hover:text-white"
                    >
                      View all →
                    </Link>
                  )}
                </div>
              </div>

              {fixturesView ? (
                <div className="mt-4 max-w-xl space-y-6" data-watch-fixture-strip="all">
                  {dayGroups.map((group) => (
                    <div key={group.id} data-watch-fixture-day={group.id}>
                      <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">
                        {group.label}
                      </h3>
                      <div className="mt-2 space-y-3">
                        {group.rows.map((row) => (
                          <div key={row.key}>
                            {row.competition ? (
                              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                                {row.competition}
                              </p>
                            ) : null}
                            <WatchFixtureCard
                              fixtureKey={row.key}
                              title={row.title}
                              face={row.face}
                              sportLabel={sportLabelFor(row)}
                              pressed={row.key === fixtureKey}
                              onSelect={() => onFixture(row.key)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  ref={scrollerRef}
                  className="mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                  data-watch-fixture-strip="carousel"
                >
                  {carouselRows.map((row) => (
                    <div
                      key={row.key}
                      data-watch-fixture-card=""
                      className="w-[82%] shrink-0 snap-start md:w-[calc((100%-1.5rem)/3)]"
                    >
                      <WatchFixtureCard
                        fixtureKey={row.key}
                        title={row.title}
                        face={row.face}
                        sportLabel={sportLabelFor(row)}
                        pressed={row.key === fixtureKey}
                        onSelect={() => onFixture(row.key)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <h2
                id="watch-fixtures"
                className="max-w-3xl font-display text-2xl tracking-wide text-white sm:text-3xl"
              >
                {empty.title}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
                {empty.body}
              </p>
              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm font-medium">
                <Link href={empty.eventsHref} className="text-emerald-300 hover:text-white">
                  Browse Events
                </Link>
                {empty.guide ? (
                  <Link href={empty.guide.href} className="text-emerald-300 hover:text-white">
                    {empty.guide.label}
                  </Link>
                ) : null}
                {empty.sibling ? (
                  <Link
                    href={empty.sibling.href}
                    className="text-emerald-300 hover:text-white"
                  >
                    {empty.sibling.label}
                  </Link>
                ) : null}
              </div>
            </>
          )}
        </div>
      </section>

      {selected ? (
        <div className="sticky top-28 z-30 border-b border-emerald-400/30 bg-[#0c0f0c]/95 px-4 py-2 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
            <p className="min-w-0 truncate text-sm text-white">
              <span className="text-emerald-300">Showing</span> {selectionDetail}
            </p>
            <button
              type="button"
              onClick={clearFixture}
              data-watch-clear=""
              className="shrink-0 rounded-full border border-white/15 px-3 py-1.5 text-sm font-medium text-white hover:bg-white hover:text-zinc-950"
            >
              Clear
            </button>
          </div>
        </div>
      ) : null}

      <section
        id="venues"
        ref={venuesRef}
        className="scroll-mt-32 px-4 py-8 sm:px-6 lg:px-8"
        data-watch-venue-list=""
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <h2 className="font-display text-3xl tracking-wide text-white sm:text-4xl">
              {venueHeading}
            </h2>
            <p className="text-sm text-zinc-400">
              {selected && selectionDetail
                ? `Showing ${selectionDetail}`
                : filtering
                  ? `Showing ${visible.length} of ${cards.length}`
                  : `${cards.length} ${cards.length === 1 ? "venue" : "venues"}`}
              {selected ? (
                <>
                  {" · "}
                  <button
                    type="button"
                    onClick={clearFixture}
                    className="font-medium text-emerald-300 hover:text-white"
                  >
                    Clear
                  </button>
                </>
              ) : null}
            </p>
          </div>

          {usedCityFallback && cards.length > 0 ? (
            <p className="mb-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm leading-relaxed text-zinc-200">
              No venues found directly in{" "}
              <span className="font-medium text-white">
                {fallbackSuburb ?? "this suburb"}
              </span>{" "}
              yet. Showing top matches in nearby{" "}
              <span className="font-medium text-white">
                {fallbackCity ?? cityTitle}
              </span>
              .
            </p>
          ) : null}

          {visible.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {visible.map(({ card, distanceKm: km }) => (
                <VenueListCard
                  key={card.slug}
                  variant="watch-hub"
                  quietSelected={Boolean(selected)}
                  name={card.name}
                  suburb={card.suburb}
                  slug={card.slug}
                  initial={card.initial}
                  photoSrc={card.photoSrc}
                  placeLine={watchPlaceLine({
                    suburb: card.suburb,
                    distanceKm: km,
                    origin: km == null ? null : originKind,
                    cityTitle: distanceCityTitle,
                  })}
                  showing={watchShowingLabel({
                    screenings: card.screenings,
                    selectedTitle: selected ? selected.title : null,
                    todayYmd,
                  })}
                  cues={card.cues}
                  hook={card.hook}
                  matrix={matrix}
                  sport={sportSlug || card.analyticsSport}
                  city={citySlug}
                  pageSlug={card.slug || sourcePage}
                  pageType="watch_city_sport"
                />
              ))}
            </div>
          ) : cards.length === 0 ? (
            <div className="space-y-4">
              <div className="rounded-3xl border border-white/8 bg-[#141814] px-6 py-12 text-center">
                <p className="text-sm text-zinc-400">
                  No watch venues in {cityTitle} yet.
                </p>
              </div>
              <CoverageNotify
                sport={sportSlug}
                sportName={sportName}
                city={citySlug}
                cityName={cityTitle}
                sourcePage={sourcePage}
                pageType="watch_city_sport"
                trackFallbackOnView
              />
            </div>
          ) : (
            <div className="rounded-2xl border border-white/8 bg-[#141814] px-5 py-8">
              <p className="text-sm text-zinc-300">
                {selected && suburb
                  ? `No ${suburb} venues showing ${selected.title}.`
                  : selected
                    ? `No venues showing ${selected.title}.`
                    : suburb
                      ? `No venues in ${suburb}.`
                      : "No venues match."}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSuburb(null);
                  setFixtureKey(null);
                }}
                className="mt-3 text-sm font-medium text-emerald-300 hover:text-white"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
