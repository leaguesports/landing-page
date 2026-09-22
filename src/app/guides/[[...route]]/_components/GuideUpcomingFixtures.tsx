import type { GuideUpcomingFixtureLink } from "@/lib/guides/venueCards";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

export function GuideUpcomingFixtures({
  id,
  title,
  intro,
  fixtures,
  seeAllHref,
  accentClass,
}: {
  id: string;
  title: string;
  intro: string | null;
  fixtures: GuideUpcomingFixtureLink[];
  seeAllHref: string;
  accentClass: string;
}) {
  return (
    <section aria-labelledby={id} className="mt-10" data-guide-upcoming="">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <h2
          id={id}
          className={`scroll-mt-28 border-l-[3px] ${accentClass} pl-4 font-display text-3xl tracking-wide text-white sm:text-4xl`}
        >
          {title}
        </h2>
        <Link
          href={seeAllHref}
          className="inline-flex min-h-10 items-center gap-1.5 text-sm font-medium text-sky-300 hover:text-sky-200"
        >
          See all events
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>
      {intro ? (
        <p className="mb-3 max-w-3xl text-sm leading-relaxed text-zinc-300 sm:text-base">
          {intro}
        </p>
      ) : null}
      {fixtures.length > 0 ? (
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {fixtures.map((fixture) => (
            <li key={fixture.href}>
              <Link
                href={fixture.href}
                className="group flex min-h-11 items-center justify-between gap-3 rounded-xl border border-white/8 bg-[#141814] px-3.5 py-2 transition-colors hover:border-white/16"
              >
                <span className="font-display text-base leading-tight tracking-wide text-white group-hover:text-sky-300 sm:text-lg">
                  {fixture.title}
                </span>
                <ArrowUpRight
                  className="h-3.5 w-3.5 shrink-0 text-sky-400/80"
                  aria-hidden
                />
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
