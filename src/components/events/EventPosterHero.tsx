import { FixtureFollowButton } from "@/components/events/FixtureFollowButton";
import { SplitPoster } from "@/components/events/SplitPosterArt";
import { EVENTS_LIST_HREF, eventDetailListHref } from "@/lib/events/scope";
import { buildSplitPoster, fixtureCalendarUrl, type SplitPosterInput } from "@/lib/events/split-poster";
import { Calendar, MapPin, MessageCircle } from "lucide-react";
import Link from "next/link";

const PILL =
  "inline-flex h-11 items-center gap-2 rounded-full border border-[#d5d6da] bg-white px-5 text-sm font-medium text-[#1d2024] transition-colors hover:border-[#0B0B0B]";
const PRIMARY =
  "inline-flex h-11 items-center gap-2 rounded-full border border-[#0B0B0B] bg-[#0B0B0B] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#1d2024]";

export function EventPosterHero({
  heading,
  poster,
  sportSlug,
  findVenueHref,
  calendarHref,
  shareHref,
  followSlug,
  pageUrl,
}: {
  /** Production fixture heading from `fixtureSeoTitle`. The only h1. */
  heading: string;
  poster: SplitPosterInput;
  sportSlug: string | null;
  findVenueHref: string;
  /** Absolute page URL used when `calendarHref` is omitted. */
  pageUrl: string;
  calendarHref?: string;
  shareHref: string;
  followSlug: string;
}) {
  const model = buildSplitPoster(poster);
  const calendar =
    calendarHref ??
    fixtureCalendarUrl({
      title: poster.title,
      startsAt: poster.startsAt,
      detailsUrl: pageUrl,
    });
  const sportHref = eventDetailListHref(sportSlug);

  return (
    <section className="bg-white text-[#0B0B0B]">
      <div className="mx-auto max-w-7xl px-4 pt-8 pb-8 sm:px-6 lg:px-8 lg:pt-[34px] lg:pb-10">
        <nav aria-label="Breadcrumb" className="text-sm text-[#5B5F66]">
          <ol className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <li>
              <Link href="/" className="transition-colors hover:text-[#0B0B0B]">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href={EVENTS_LIST_HREF} className="transition-colors hover:text-[#0B0B0B]">
                Events
              </Link>
            </li>
            {model.sportLabel ? (
              <>
                <li aria-hidden="true">/</li>
                <li>
                  <Link href={sportHref} className="transition-colors hover:text-[#0B0B0B]">
                    {model.sportLabel}
                  </Link>
                </li>
              </>
            ) : null}
            <li aria-hidden="true">/</li>
            <li className="text-[#0B0B0B]">{model.breadcrumb}</li>
          </ol>
        </nav>

        <p className="mt-[22px] text-xs font-semibold uppercase tracking-[0.18em] text-[#0F6B45]">
          {model.eyebrow}
        </p>

        <h1 className="mt-2.5 max-w-4xl font-display text-4xl leading-none text-[#0B0B0B] sm:text-5xl lg:text-6xl">
          {heading}
        </h1>

        <div className="mt-3.5 flex flex-wrap items-center gap-2.5 text-[15px] font-medium text-[#2b2f33]">
          {model.metaDate ? <span>{model.metaDate}</span> : null}
          {model.metaDate && model.metaClock ? (
            <span className="h-1 w-1 rounded-full bg-[#a1a5a0]" aria-hidden="true" />
          ) : null}
          {model.metaClock ? <span>{model.metaClock}</span> : null}
          {model.sportLabel ? <Chip>{model.sportLabel}</Chip> : null}
          <Chip tone="watch">Watch</Chip>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2.5">
          <a href={findVenueHref} className={PRIMARY}>
            <MapPin className="h-4 w-4" aria-hidden="true" />
            Find a venue showing it
          </a>
          <a href={calendar} className={PILL} target="_blank" rel="noopener noreferrer">
            <Calendar className="h-4 w-4" aria-hidden="true" />
            Add to calendar
          </a>
          <a href={shareHref} className={PILL} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            Share on WhatsApp
          </a>
          <FixtureFollowButton slug={followSlug} variant="poster" />
        </div>

        <div className="mt-7">
          <SplitPoster model={model} />
        </div>
      </div>
    </section>
  );
}

function Chip({
  children,
  tone = "plain",
}: {
  children: string;
  tone?: "plain" | "watch";
}) {
  const toneClass =
    tone === "watch"
      ? "border-[#0B0B0B] bg-[#0B0B0B] text-[#3DFF8A]"
      : "border-[#E4E4E7] bg-white text-[#0B0B0B]";
  return (
    <span
      className={`inline-flex h-[26px] items-center rounded-full border px-2.5 text-[11px] font-bold uppercase tracking-[0.12em] ${toneClass}`}
    >
      {children}
    </span>
  );
}
