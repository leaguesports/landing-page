import { HomeScorecardPreview } from "@/components/home/HomeScorecardPreview";
import { BADGE_CATALOG } from "@/lib/badges/catalog";
import {
  ATHLETE_INTEGRATION_COPY,
  ATHLETE_LIVE_HREFS,
  ATHLETES_LOGIN_HREF,
} from "@/lib/athletes/overview";
import {
  Cable,
  Dumbbell,
  Flag,
  Trophy,
  Users,
} from "lucide-react";
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

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:px-8">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
              Live today
            </p>
            <h1 className="font-display max-w-4xl text-5xl tracking-wide text-white sm:text-6xl lg:text-7xl">
              Track your game.{" "}
              <span className="text-emerald-400">Lock the result.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-zinc-400 sm:text-lg">
              Padel and golf scorecards, progress from locked matches, badges
              from real milestones, communities, padel training, and Import
              session — the athlete product that is already shipping.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href={ATHLETE_LIVE_HREFS.padelNew}
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-zinc-950 transition-transform hover:scale-[1.03]"
              >
                Start padel
              </Link>
              <Link
                href={ATHLETE_LIVE_HREFS.golfNew}
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-emerald-400 px-6 text-sm font-semibold text-zinc-950 transition-colors hover:bg-emerald-300"
              >
                Start golf
              </Link>
              <Link
                href={ATHLETES_LOGIN_HREF}
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/12 px-6 text-sm font-medium text-white transition-colors hover:bg-white hover:text-zinc-950"
              >
                Log in
              </Link>
            </div>
            <p className="mt-4 text-sm text-zinc-500">
              Sign in to keep locked results, badges, and friends on your hub.
            </p>
          </div>

          <HomeScorecardPreview className="mx-auto w-full max-w-md lg:mx-0" />
        </div>
      </section>

      <section className="relative border-t border-white/5 bg-[#0c0f0c] py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 text-sm text-zinc-300">
                <Trophy className="h-4 w-4 text-emerald-400" aria-hidden />
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
                  Digital Scorecards
                </span>
              </div>
              <h2 className="font-display text-4xl tracking-wide text-white sm:text-5xl">
                Never lose a padel or golf score
              </h2>
              <p className="max-w-xl text-base leading-relaxed text-zinc-400 sm:text-lg">
                Live scorecards on your phone — lock the result to your account
                and share it with the pairing. Darts and other sports stay off
                this page until they ship.
              </p>
              <ul className="space-y-3 text-zinc-300">
                <li className="flex items-start gap-3">
                  {CHECK}
                  <span>Start a padel match or a golf round now</span>
                </li>
                <li className="flex items-start gap-3">
                  {CHECK}
                  <span>Lock the card so it lands on your hub history</span>
                </li>
                <li className="flex items-start gap-3">
                  {CHECK}
                  <span>Share the live or locked scorecard</span>
                </li>
              </ul>
              <CtaRow
                primaryHref={ATHLETE_LIVE_HREFS.padelNew}
                primaryLabel="Start padel"
                secondaryHref={ATHLETE_LIVE_HREFS.golfNew}
                secondaryLabel="Start golf"
              />
            </div>
            <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#141814] p-6 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                Live paths
              </p>
              <ul className="mt-5 space-y-3">
                {[
                  { label: "New padel match", href: ATHLETE_LIVE_HREFS.padelNew },
                  { label: "New golf round", href: ATHLETE_LIVE_HREFS.golfNew },
                  { label: "Padel history", href: ATHLETE_LIVE_HREFS.padelHistory },
                  { label: "Golf history", href: ATHLETE_LIVE_HREFS.golfHistory },
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
          <div className="absolute left-1/4 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-3xl" />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#141814] px-6 py-8 sm:px-8">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                After you lock
              </p>
              <h3 className="mt-2 font-display text-2xl tracking-wide text-white">
                Your hub, not a demo profile
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                Signed-in home lists your locked padel and golf results, form,
                and friends. There is no fictional rating or game count on this
                page.
              </p>
              <Link
                href={ATHLETES_LOGIN_HREF}
                className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-emerald-400 px-6 text-sm font-semibold text-zinc-950 transition-colors hover:bg-emerald-300"
              >
                Log in to your hub
              </Link>
            </div>
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 text-sm text-zinc-300">
                <Flag className="h-4 w-4 text-emerald-400" aria-hidden />
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
                  Progress
                </span>
              </div>
              <h2 className="font-display text-4xl tracking-wide text-white sm:text-5xl">
                Watch form from matches you actually played
              </h2>
              <p className="max-w-xl text-base leading-relaxed text-zinc-400 sm:text-lg">
                Progress is derived from locked scorecards on your account —
                wins, form, and history. Sign in to see yours on the hub.
              </p>
              <ul className="space-y-3 text-zinc-300">
                <li className="flex items-start gap-3">
                  {CHECK}
                  <span>Locked padel matches feed hub progress</span>
                </li>
                <li className="flex items-start gap-3">
                  {CHECK}
                  <span>Golf rounds count on the same record</span>
                </li>
                <li className="flex items-start gap-3">
                  {CHECK}
                  <span>No invented charts or vanity ratings</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="relative border-t border-white/5 bg-[#0c0f0c] py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 text-sm text-zinc-300">
                <Trophy className="h-4 w-4 text-emerald-400" aria-hidden />
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
                  Achievement Badges
                </span>
              </div>
              <h2 className="font-display text-4xl tracking-wide text-white sm:text-5xl">
                Earn badges from real milestones
              </h2>
              <p className="max-w-xl text-base leading-relaxed text-zinc-400 sm:text-lg">
                {BADGE_CATALOG.length} badges in the catalog — first lock, first
                win, five matches, first golf round, a share, a friend, and hot
                form. Nothing unlocks until you do the work.
              </p>
              <CtaRow
                primaryHref={ATHLETE_LIVE_HREFS.padelNew}
                primaryLabel="Start a match"
                secondaryHref={ATHLETES_LOGIN_HREF}
                secondaryLabel="Log in"
              />
            </div>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {BADGE_CATALOG.map((badge) => (
                <li
                  key={badge.id}
                  className="rounded-3xl border border-white/8 bg-[#141814] px-4 py-4"
                >
                  <p className="text-sm font-semibold text-white">{badge.name}</p>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-400">
                    {badge.howToEarn}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="relative border-t border-white/5 bg-[#0c0f0c] py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#141814] px-6 py-8 sm:px-8">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                Curated padel plans
              </p>
              <ul className="mt-5 space-y-3 text-sm text-white">
                <li className="rounded-2xl border border-white/8 bg-white/3 px-4 py-3">
                  Accuracy Focus
                </li>
                <li className="rounded-2xl border border-white/8 bg-white/3 px-4 py-3">
                  Consistency Builder
                </li>
                <li className="rounded-2xl border border-white/8 bg-white/3 px-4 py-3">
                  Match Intensity
                </li>
              </ul>
              <Link
                href={ATHLETE_LIVE_HREFS.training}
                className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-zinc-950 transition-transform hover:scale-[1.03]"
              >
                Open training
              </Link>
            </div>
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 text-sm text-zinc-300">
                <Dumbbell className="h-4 w-4 text-emerald-400" aria-hidden />
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
                  Custom Training
                </span>
              </div>
              <h2 className="font-display text-4xl tracking-wide text-white sm:text-5xl">
                Train padel with a plan you can finish
              </h2>
              <p className="max-w-xl text-base leading-relaxed text-zinc-400 sm:text-lg">
                Start Accuracy Focus from the training page, mark drills done,
                and keep completed sessions on your account.
              </p>
              <ul className="space-y-3 text-zinc-300">
                <li className="flex items-start gap-3">
                  {CHECK}
                  <span>Three curated padel plans from the training API</span>
                </li>
                <li className="flex items-start gap-3">
                  {CHECK}
                  <span>History stays on your account after you finish</span>
                </li>
              </ul>
            </div>
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

      <section className="relative border-t border-white/5 bg-[#0c0f0c] py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#141814] px-6 py-8 sm:px-8">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                Connectable now
              </p>
              <div className="mt-5 rounded-2xl border border-white/8 bg-white/3 px-4 py-4">
                <p className="text-sm font-medium text-white">Import session</p>
                <p className="mt-1 text-xs text-zinc-500">
                  Connect, then sync a real session. Status is Connected or Not
                  connected — never a status we did not load from your account.
                </p>
              </div>
              <Link
                href={ATHLETE_LIVE_HREFS.integrations}
                className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-zinc-950 transition-transform hover:scale-[1.03]"
              >
                Open integrations
              </Link>
            </div>
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 text-sm text-zinc-300">
                <Cable className="h-4 w-4 text-emerald-400" aria-hidden />
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
                  {ATHLETE_INTEGRATION_COPY.eyebrow}
                </span>
              </div>
              <h2 className="font-display text-4xl tracking-wide text-white sm:text-5xl">
                {ATHLETE_INTEGRATION_COPY.title}
              </h2>
              <p className="max-w-xl text-base leading-relaxed text-zinc-400 sm:text-lg">
                {ATHLETE_INTEGRATION_COPY.body} Hardware that is not available
                stays off this page.
              </p>
              <ul className="space-y-3 text-zinc-300">
                <li className="flex items-start gap-3">
                  {CHECK}
                  <span>Only connectable providers are listed</span>
                </li>
                <li className="flex items-start gap-3">
                  {CHECK}
                  <span>Last sync and import counts come from your account</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-t border-white/5 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative mx-auto max-w-3xl text-center">
          <h2 className="font-display text-4xl tracking-wide text-white sm:text-5xl">
            Start a live path
          </h2>
          <p className="mt-4 text-base leading-relaxed text-zinc-400">
            Every button on this page opens padel, golf, login, communities,
            training, or integrations — nothing fictional.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href={ATHLETE_LIVE_HREFS.padelNew}
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-zinc-950 transition-transform hover:scale-[1.03]"
            >
              Start padel
            </Link>
            <Link
              href={ATHLETE_LIVE_HREFS.golfNew}
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-emerald-400 px-6 text-sm font-semibold text-zinc-950 transition-colors hover:bg-emerald-300"
            >
              Start golf
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
    </div>
  );
}
