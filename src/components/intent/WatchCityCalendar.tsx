import type { WatchCalendarRow, WatchGuideLink } from "@/lib/intent/watch-screenings";
import {
  formatWatchCalendarStamp,
  watchScreeningEmptyBody,
  watchScreeningEmptyCopy,
} from "@/lib/intent/watch-screenings";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

/**
 * Sport-scoped calendar for `/watch/{sport}/{city}`.
 * Filled: compact rows only. Empty: honest copy plus secondary links.
 * Never invents fixtures and never lists another sport.
 */
export function WatchCityCalendar({
  sportName,
  cityTitle,
  venueCount,
  rows,
  eventsHref,
  relatedGuide,
  crossSportGuide,
}: {
  sportName: string;
  cityTitle: string;
  venueCount: number;
  rows: WatchCalendarRow[];
  eventsHref: string;
  relatedGuide: WatchGuideLink | null;
  crossSportGuide: WatchGuideLink | null;
}) {
  if (rows.length > 0) {
    return (
      <section
        aria-labelledby="watch-city-calendar"
        className="border-t border-white/5 px-4 py-8 sm:px-6 sm:py-10 lg:px-8"
        data-watch-calendar="fixtures"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
            <h2
              id="watch-city-calendar"
              className="scroll-mt-28 border-l-[3px] border-sky-400 pl-4 font-display text-3xl tracking-wide text-white sm:text-4xl"
            >
              On the calendar
            </h2>
            <Link
              href={eventsHref}
              className="inline-flex min-h-10 items-center gap-1.5 text-sm font-medium text-sky-300 hover:text-sky-200"
            >
              See all events
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {rows.map((row) => {
              const stamp = formatWatchCalendarStamp(row.startsAt);
              const meta = [row.venueName, stamp].filter(Boolean).join(" · ");
              const titleClass =
                "font-display text-base leading-tight tracking-wide text-white group-hover:text-sky-300 sm:text-lg";
              return (
                <li key={`${row.venueSlug}-${row.startsAt}-${row.title}`}>
                  <div className="rounded-xl border border-white/8 bg-[#141814] px-3.5 py-2">
                    {row.href ? (
                      <Link href={row.href} className="group block min-h-11">
                        <span className={titleClass}>{row.title}</span>
                        {meta ? (
                          <span className="mt-0.5 block truncate text-xs text-zinc-500">
                            {meta}
                          </span>
                        ) : null}
                      </Link>
                    ) : (
                      <div className="min-h-11">
                        <p className="font-display text-base leading-tight tracking-wide text-white sm:text-lg">
                          {row.title}
                        </p>
                        {meta ? (
                          <p className="mt-0.5 truncate text-xs text-zinc-500">{meta}</p>
                        ) : null}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    );
  }

  const title = watchScreeningEmptyCopy(sportName);
  const body = watchScreeningEmptyBody(sportName, cityTitle, venueCount);

  return (
    <section
      aria-labelledby="watch-city-calendar"
      className="border-t border-white/5 px-4 py-8 sm:px-6 sm:py-10 lg:px-8"
      data-watch-calendar="empty"
    >
      <div className="mx-auto max-w-7xl">
        <h2
          id="watch-city-calendar"
          className="max-w-3xl font-display text-2xl tracking-wide text-white sm:text-3xl"
        >
          {title}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
          {body}
        </p>
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm font-medium">
          <Link href={eventsHref} className="text-sky-300 hover:text-white">
            Browse Events
          </Link>
          {relatedGuide ? (
            <Link href={relatedGuide.href} className="text-sky-300 hover:text-white">
              {relatedGuide.label}
            </Link>
          ) : null}
          {crossSportGuide ? (
            <Link
              href={crossSportGuide.href}
              className="text-sky-300 hover:text-white"
            >
              {crossSportGuide.label}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
