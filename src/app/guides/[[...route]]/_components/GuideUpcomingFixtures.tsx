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
    <section aria-labelledby={id} className="mt-12" data-guide-upcoming="">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
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
        <p className="mb-5 max-w-3xl text-base leading-relaxed text-zinc-300">{intro}</p>
      ) : null}
      {fixtures.length > 0 ? (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {fixtures.map((fixture) => (
            <li key={fixture.href}>
              <Link
                href={fixture.href}
                className="group block rounded-3xl border border-white/8 bg-[#141814] px-5 py-4 transition-colors hover:border-white/16"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-400">
                  Fixture
                </p>
                <p className="mt-2 font-display text-2xl tracking-wide text-white group-hover:text-sky-300">
                  {fixture.title}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
