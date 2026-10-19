import {
  ATHLETE_LIVE_HREFS,
  ATHLETES_LOGIN_HREF,
} from "@/lib/athletes/overview";
import { Users } from "lucide-react";
import Link from "next/link";

function CtaRow({
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: {
  primaryHref: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
}) {
  return (
    <div className="flex flex-col gap-3 pt-2 sm:flex-row">
      <Link
        href={primaryHref}
        className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-zinc-950 transition-transform hover:scale-[1.03]"
      >
        {primaryLabel}
      </Link>
      <Link
        href={secondaryHref}
        className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/12 px-6 text-sm font-medium text-white transition-colors hover:bg-white hover:text-zinc-950"
      >
        {secondaryLabel}
      </Link>
    </div>
  );
}

export function AthletesMarketing() {
  return (
    <div className="min-h-screen bg-[#0c0f0c] text-white">
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-linear-to-br from-emerald-950/40 via-[#0c0f0c] to-[#0c0f0c]" />
        <div className="pointer-events-none absolute -right-20 top-10 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
            Athlete tools
          </p>
          <h1 className="font-display max-w-4xl text-5xl tracking-wide text-white sm:text-6xl lg:text-7xl">
            Your profile, friends, and communities.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-zinc-400 sm:text-lg">
            Sign in to keep your profile and the groups you play with. Find a
            court, course, or board from Play.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href={ATHLETE_LIVE_HREFS.play}
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-zinc-950 transition-transform hover:scale-[1.03]"
            >
              Find a place to play
            </Link>
            <Link
              href={ATHLETES_LOGIN_HREF}
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/12 px-6 text-sm font-medium text-white transition-colors hover:bg-white hover:text-zinc-950"
            >
              Log in
            </Link>
          </div>
        </div>
      </section>

      <section className="relative border-t border-white/5 bg-[#0c0f0c] py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 text-sm text-zinc-300">
                <Users className="h-4 w-4 text-emerald-400" aria-hidden />
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
                  Communities
                </span>
              </div>
              <h2 className="font-display text-4xl tracking-wide text-white sm:text-5xl">
                Find your people. Play more often.
              </h2>
              <p className="max-w-xl text-base leading-relaxed text-zinc-400 sm:text-lg">
                Open groups athletes create and join — city leagues, regular
                hit-arounds, and the crew you already play with. Member lists
                come from the communities page, not a mock club.
              </p>
              <CtaRow
                primaryHref={ATHLETE_LIVE_HREFS.communities}
                primaryLabel="Browse communities"
                secondaryHref={ATHLETES_LOGIN_HREF}
                secondaryLabel="Log in"
              />
            </div>
            <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#141814] px-6 py-8 sm:px-8">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                Live today
              </p>
              <p className="mt-2 font-display text-2xl tracking-wide text-white">
                Discover or start a group
              </p>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                Join an open community in your city, or create one. Friends also
                live on your signed-in hub.
              </p>
              <Link
                href={ATHLETE_LIVE_HREFS.communities}
                className="mt-6 inline-flex text-sm font-medium text-emerald-300 hover:text-emerald-200"
              >
                Go to communities
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
