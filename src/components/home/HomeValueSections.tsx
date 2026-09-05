import { HomeScorecardPreview } from "@/components/home/HomeScorecardPreview";
import { venueDirectoryHref } from "@/lib/search/venueSearch";
import { MapPin, Trophy, Tv } from "lucide-react";
import Link from "next/link";

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

export function HomeValueSections() {
  return (
    <>
      <section className="relative border-t border-white/5 bg-[#0c0f0c] py-16 sm:py-24">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/4 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-sky-500/10 blur-3xl" />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="order-2 space-y-4 lg:order-1">
              <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#141814]">
                <div className="border-b border-white/8 px-5 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-400">
                    Tonight
                  </p>
                  <p className="mt-1 font-display text-2xl tracking-wide text-white">
                    Where to watch
                  </p>
                </div>
                <ul className="divide-y divide-white/8">
                  {[
                    {
                      sport: "Soccer",
                      title: "Kaizer Chiefs vs Orlando Pirates",
                      where: "12 venues",
                    },
                    {
                      sport: "Rugby",
                      title: "Stormers vs Bulls",
                      where: "8 venues",
                    },
                    {
                      sport: "F1",
                      title: "Race weekend screenings",
                      where: "6 venues",
                    },
                  ].map((row) => (
                    <li
                      key={row.title}
                      className="flex items-start justify-between gap-4 px-5 py-4"
                    >
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-400">
                          {row.sport}
                        </p>
                        <p className="mt-1 text-sm font-medium text-white">
                          {row.title}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs text-zinc-500">
                        {row.where}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="order-1 space-y-6 lg:order-2">
              <div className="inline-flex items-center gap-2 text-sm text-zinc-300">
                <Tv className="h-4 w-4 text-sky-400" aria-hidden />
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-400">
                  Watch
                </span>
              </div>
              <h2 className="font-display text-4xl tracking-wide text-white sm:text-5xl">
                Find a screen for the big game
              </h2>
              <p className="max-w-xl text-base leading-relaxed text-zinc-400 sm:text-lg">
                Browse pubs and sports bars screening soccer, rugby, cricket,
                and motorsport across Cape Town, Johannesburg, Durban, and
                Pretoria.
              </p>
              <ul className="space-y-3 text-zinc-300">
                <li className="flex items-start gap-3">
                  {CHECK}
                  <span>Fixture-first discovery by sport and city</span>
                </li>
                <li className="flex items-start gap-3">
                  {CHECK}
                  <span>Venue pages with screens, vibes, and directions</span>
                </li>
                <li className="flex items-start gap-3">
                  {CHECK}
                  <span>
                    Follow venues so upcoming games surface on your hub
                  </span>
                </li>
              </ul>
              <Link
                href="/watch"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/12 px-6 text-sm font-medium text-white transition-colors hover:bg-white hover:text-zinc-950"
              >
                Browse watch venues
              </Link>
            </div>
          </div>
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
                href="/play"
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
                  { label: "Play venues near me", href: "/play" },
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
