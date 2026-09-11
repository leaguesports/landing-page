import { GolfHandicapIndexField } from "@/components/golf/GolfHandicapIndexField";
import type { SportDefinition } from "@/lib/sports/catalog";
import {
  HUB_CHANGE_SPORT_LABEL,
  hubChangeSportHref,
  hubPlayDashboardActions,
  type HubPlayDashboardAction,
} from "@/lib/sports/hub-ia";
import {
  Calendar,
  ClipboardList,
  Flag,
  Medal,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

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

function ActionCard({ action }: { action: HubPlayDashboardAction }) {
  return (
    <Link
      href={action.href}
      className="flex h-full w-full flex-col items-start gap-5 rounded-3xl border border-white/8 bg-[#141814] px-5 py-6 text-left transition-colors hover:border-emerald-400/35 hover:bg-white/3 sm:px-6 lg:px-7 lg:py-7"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/8 bg-white/4 text-emerald-200">
        <ActionIcon id={action.id} />
      </span>
      <div>
        <h3 className="font-display text-3xl tracking-wide text-white">
          {action.title}
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">
          {action.description}
        </p>
      </div>
    </Link>
  );
}

function ActionGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-8">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
        {title}
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2 lg:gap-4">{children}</ul>
    </section>
  );
}

type PlaySportDashboardProps = {
  sport: SportDefinition;
};

export function PlaySportDashboard({ sport }: PlaySportDashboardProps) {
  const actions = hubPlayDashboardActions(sport.slug);
  const play = actions.filter((action) => action.group === "play");
  const withOthers = actions.filter((action) => action.group === "with-others");
  const golf = actions.filter((action) => action.group === "golf");
  const golfTours = golf.find((action) => action.id === "golf-tours");
  const showHandicap = sport.slug === "golf";

  return (
    <section className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14 lg:max-w-4xl">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
        Play
      </p>
      <h1 className="font-display text-5xl tracking-wide text-white sm:text-6xl">
        {sport.name}
      </h1>
      <p className="mt-4 max-w-xl text-base leading-relaxed text-zinc-400">
        Start, capture, or play {sport.name.toLowerCase()} with others.
      </p>

      <Link
        href={hubChangeSportHref()}
        className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 px-5 text-sm font-semibold text-white transition-colors hover:bg-white/5"
      >
        {HUB_CHANGE_SPORT_LABEL}
      </Link>

      {play.length > 0 ? (
        <ActionGroup title="Play">
          {play.map((action) => (
            <li key={action.id}>
              <ActionCard action={action} />
            </li>
          ))}
        </ActionGroup>
      ) : null}

      {withOthers.length > 0 ? (
        <ActionGroup title="With others">
          {withOthers.map((action) => (
            <li key={action.id}>
              <ActionCard action={action} />
            </li>
          ))}
        </ActionGroup>
      ) : null}

      {golfTours || showHandicap ? (
        <ActionGroup title="Golf">
          {golfTours ? (
            <li>
              <ActionCard action={golfTours} />
            </li>
          ) : null}
          {showHandicap ? (
            <li>
              <div className="h-full">
                <GolfHandicapIndexField
                  heading="Handicap"
                  description="Profile handicap index for net scoring. Same HI used when you start or capture a round."
                />
              </div>
            </li>
          ) : null}
        </ActionGroup>
      ) : null}
    </section>
  );
}
