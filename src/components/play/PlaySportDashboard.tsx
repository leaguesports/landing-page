import { GolfHandicapIndexField } from "@/components/golf/GolfHandicapIndexField";
import { OrganisedGamesStrip } from "@/components/play/OrganisedGamesStrip";
import type { SportDefinition } from "@/lib/sports/catalog";
import type { OrganisedGamesSnapshot } from "@/lib/organised-games/organised-games";
import {
  HUB_CHANGE_SPORT_LABEL,
  hubChangeSportHref,
  type HubPlayDashboardAction,
} from "@/lib/sports/hub-ia";
import {
  playDashboardMoreActions,
  playDashboardPlayActions,
  playDashboardPlaceChips,
  playDashboardReminder,
  playDashboardShortcuts,
  type PlayDashboardClub,
  type PlayDashboardGuide,
  type PlayDashboardShortcut,
} from "@/lib/play/play-dashboard";
import {
  Bell,
  BookOpen,
  Calendar,
  ClipboardList,
  Flag,
  MapPin,
  Medal,
  Star,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

const SHORTCUT_TONE: Record<
  PlayDashboardShortcut["tone"],
  string
> = {
  emerald: "bg-emerald-400/15 text-emerald-200 ring-emerald-400/20",
  amber: "bg-amber-400/15 text-amber-200 ring-amber-400/20",
  sky: "bg-sky-400/15 text-sky-200 ring-sky-400/20",
  lime: "bg-lime-400/15 text-lime-200 ring-lime-400/20",
};

function ShortcutIcon({ id }: { id: PlayDashboardShortcut["id"] }) {
  if (id === "book") return <Calendar className="h-5 w-5" aria-hidden />;
  if (id === "learn") return <BookOpen className="h-5 w-5" aria-hidden />;
  if (id === "compete") return <Medal className="h-5 w-5" aria-hidden />;
  return <Users className="h-5 w-5" aria-hidden />;
}

function ActionIcon({ id }: { id: HubPlayDashboardAction["id"] }) {
  if (id === "capture") return <ClipboardList className="h-4 w-4" aria-hidden />;
  if (id === "organise") return <Calendar className="h-4 w-4" aria-hidden />;
  if (id === "lobby") return <Users className="h-4 w-4" aria-hidden />;
  if (id === "team-matches") return <Trophy className="h-4 w-4" aria-hidden />;
  if (id === "tournaments") return <Medal className="h-4 w-4" aria-hidden />;
  if (id === "golf-tours" || id === "handicap") {
    return <Flag className="h-4 w-4" aria-hidden />;
  }
  return <Zap className="h-4 w-4" aria-hidden />;
}

function SectionHeading({
  id,
  title,
  action,
}: {
  id?: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <h2 id={id} className="font-display text-2xl tracking-wide text-white">
        {title}
      </h2>
      {action}
    </div>
  );
}

function PlayClubCard({ club }: { club: PlayDashboardClub }) {
  return (
    <Link
      href={club.href}
      className="group flex flex-col overflow-hidden rounded-3xl border border-white/8 bg-[#141814] transition-colors hover:border-white/16"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-zinc-800">
        {club.imageSrc.startsWith("https://") ? (
          <Image
            src={club.imageSrc}
            alt=""
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
        ) : (
          // Same-origin SVG placeholder — next/image does not optimize SVG.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={club.imageSrc}
            alt=""
            className="h-full w-full object-cover"
          />
        )}
      </div>
      <div className="px-4 py-3.5 sm:px-5">
        <h3 className="text-[15px] font-medium leading-snug text-white group-hover:text-[var(--color-brand)]">
          {club.name}
        </h3>
        {club.place ? (
          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-zinc-500">
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span>{club.place}</span>
          </p>
        ) : null}
        {typeof club.rating === "number" ? (
          <p className="mt-1.5 inline-flex items-center gap-1 text-sm font-medium text-amber-300">
            <Star className="h-3.5 w-3.5 fill-amber-300" aria-hidden />
            {club.rating.toFixed(1)}
          </p>
        ) : null}
      </div>
    </Link>
  );
}

type PlaySportDashboardProps = {
  sport: SportDefinition;
  clubs: readonly PlayDashboardClub[];
  clubsExploreHref: string;
  guides: readonly PlayDashboardGuide[];
  organisedGames: OrganisedGamesSnapshot;
  nowIso: string;
};

export function PlaySportDashboard({
  sport,
  clubs,
  clubsExploreHref,
  guides,
  organisedGames,
  nowIso,
}: PlaySportDashboardProps) {
  const shortcuts = playDashboardShortcuts(sport);
  const playActions = playDashboardPlayActions(sport.slug);
  const moreActions = playDashboardMoreActions(sport.slug);
  const places = playDashboardPlaceChips(sport.slug);
  const reminder = playDashboardReminder(organisedGames, sport, nowIso);
  const showHandicap = sport.slug === "golf";
  const start = playActions.find((action) => action.id === "start");
  const restPlay = playActions.filter((action) => action.id !== "start");

  return (
    <section className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-10 lg:max-w-4xl">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
            Play
          </p>
          <h1 className="font-display text-5xl tracking-wide text-white sm:text-6xl">
            {sport.name}
          </h1>
        </div>
        <Link
          href={hubChangeSportHref()}
          className="inline-flex min-h-10 w-fit shrink-0 items-center justify-center rounded-full border border-white/15 px-4 text-sm font-semibold text-white transition-colors hover:bg-white/5"
        >
          {HUB_CHANGE_SPORT_LABEL}
        </Link>
      </header>

      <Link
        href={reminder.href}
        className="mt-6 flex items-start gap-3 rounded-2xl border border-white/8 bg-[#141814] px-4 py-3.5 transition-colors hover:border-emerald-400/25 hover:bg-white/3 sm:px-5"
      >
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-200">
          <Bell className="h-4 w-4" aria-hidden />
        </span>
        <span className="min-w-0">
          <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
            {reminder.title}
          </span>
          <span className="mt-1 block text-sm leading-relaxed text-zinc-200">
            {reminder.description}
          </span>
        </span>
      </Link>

      {start ? (
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <Link
            href={start.href}
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-emerald-400 px-5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-emerald-300"
          >
            {start.title}
          </Link>
          {restPlay[0] ? (
            <Link
              href={restPlay[0].href}
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 px-5 text-sm font-semibold text-white transition-colors hover:bg-white/5"
            >
              {restPlay[0].title}
            </Link>
          ) : null}
        </div>
      ) : null}

      <nav aria-label={`${sport.name} shortcuts`} className="mt-8">
        <ul className="grid grid-cols-4 gap-2 sm:gap-4">
          {shortcuts.map((shortcut) => (
            <li key={shortcut.id}>
              <Link
                href={shortcut.href}
                className="flex flex-col items-center gap-2 rounded-2xl px-1 py-2 text-center transition-colors hover:bg-white/3"
              >
                <span
                  className={`flex h-14 w-14 items-center justify-center rounded-full ring-1 sm:h-16 sm:w-16 ${SHORTCUT_TONE[shortcut.tone]}`}
                >
                  <ShortcutIcon id={shortcut.id} />
                </span>
                <span className="text-[11px] font-medium leading-tight text-zinc-200 sm:text-sm">
                  {shortcut.title}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <section className="mt-10" aria-labelledby="play-clubs-heading">
        <SectionHeading
          id="play-clubs-heading"
          title="Clubs"
          action={
            <Link
              href={clubsExploreHref}
              className="text-sm font-medium text-emerald-300 transition-colors hover:text-emerald-200"
            >
              Explore more
            </Link>
          }
        />
        {clubs.length > 0 ? (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
            {clubs.map((club) => (
              <li key={club.id}>
                <PlayClubCard club={club} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-3xl border border-white/8 bg-[#141814] px-5 py-8 text-sm leading-relaxed text-zinc-400">
            No {sport.name.toLowerCase()} clubs listed yet.{" "}
            <Link
              href={clubsExploreHref}
              className="font-medium text-emerald-300 hover:text-emerald-200"
            >
              Browse venues
            </Link>{" "}
            or pick a city below.
          </p>
        )}
      </section>

      {places.length > 0 ? (
        <section className="mt-8" aria-labelledby="play-near-heading">
          <SectionHeading id="play-near-heading" title="Play near you" />
          <ul className="flex flex-wrap gap-2">
            {places.map((place) => (
              <li key={place.slug}>
                <Link
                  href={place.href}
                  className="inline-flex rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-sm text-zinc-300 transition-colors hover:border-white/20 hover:text-white"
                >
                  {place.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <OrganisedGamesStrip snapshot={organisedGames} nowIso={nowIso} />

      {guides.length > 0 ? (
        <section className="mt-8" aria-labelledby="play-learn-heading">
          <SectionHeading
            id="play-learn-heading"
            title="Learn"
            action={
              <Link
                href="/guides"
                className="text-sm font-medium text-emerald-300 transition-colors hover:text-emerald-200"
              >
                All guides
              </Link>
            }
          />
          <ul className="grid gap-3 sm:grid-cols-2">
            {guides.map((guide) => (
              <li key={guide.slug}>
                <Link
                  href={guide.href}
                  className="block rounded-3xl border border-white/8 bg-[#141814] px-5 py-4 transition-colors hover:border-white/16"
                >
                  <h3 className="text-[15px] font-medium leading-snug text-white">
                    {guide.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">
                    {guide.description}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {restPlay.length > 1 || moreActions.length > 0 ? (
        <section className="mt-8" aria-labelledby="play-more-heading">
          <SectionHeading id="play-more-heading" title="More ways to play" />
          <ul className="grid gap-2 sm:grid-cols-2">
            {[...restPlay.slice(1), ...moreActions].map((action) => (
              <li key={action.id}>
                <Link
                  href={action.href}
                  className="flex items-start gap-3 rounded-2xl border border-white/8 bg-[#141814] px-4 py-3.5 transition-colors hover:border-emerald-400/25 hover:bg-white/3"
                >
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/8 bg-white/4 text-emerald-200">
                    <ActionIcon id={action.id} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-white">
                      {action.title}
                    </span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-zinc-500">
                      {action.description}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {showHandicap ? (
        <section className="mt-8">
          <SectionHeading title="Handicap" />
          <GolfHandicapIndexField
            heading="Handicap index"
            description="Profile handicap index for net scoring. Same HI used when you start or capture a round."
          />
        </section>
      ) : null}
    </section>
  );
}
