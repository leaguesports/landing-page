import {
  formatOrganisedGameSport,
  formatOrganisedGameStatus,
  type OrganisedGame,
  type OrganisedGamesSnapshot,
} from "@/lib/organised-games/organised-games";
import { formatHubWhen } from "@/lib/sports/hub-feed";
import {
  HUB_ORGANISED_PREVIEW_LIMIT,
  hubOrganisedGameHref,
  takeHubPreview,
} from "@/lib/sports/hub-ia";
import { ArrowUpRight, Calendar } from "lucide-react";
import Link from "next/link";

type OrganisedGamesStripProps = {
  snapshot: OrganisedGamesSnapshot;
  nowIso: string;
};

function GameRow({
  game,
  role,
  now,
}: {
  game: OrganisedGame;
  role: "Hosting" | "Invited";
  now: Date;
}) {
  const when = formatHubWhen(game.startsAt, now);
  const rsvp =
    role === "Invited" && game.viewer.rsvp
      ? ` · ${game.viewer.rsvp === "accepted" ? "In" : game.viewer.rsvp === "declined" ? "Out" : "Pending"}`
      : "";

  return (
    <li>
      <Link
        href={hubOrganisedGameHref(game.id)}
        className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-white/3 sm:px-5"
      >
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/8 bg-white/4 text-emerald-200">
          <Calendar className="h-4 w-4" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
            {role} · {formatOrganisedGameSport(game.sport)} ·{" "}
            {formatOrganisedGameStatus(game.status)}
            {rsvp}
          </span>
          <span className="mt-1 block text-sm font-medium text-white">
            {when ?? "Time TBC"}
          </span>
        </span>
        <ArrowUpRight
          className="mt-1 h-4 w-4 shrink-0 text-zinc-600"
          aria-hidden
        />
      </Link>
    </li>
  );
}

export function OrganisedGamesStrip({
  snapshot,
  nowIso,
}: OrganisedGamesStripProps) {
  const now = new Date(nowIso);
  const hosted = takeHubPreview(snapshot.hosted, HUB_ORGANISED_PREVIEW_LIMIT);
  const invited = takeHubPreview(snapshot.invited, HUB_ORGANISED_PREVIEW_LIMIT);
  if (hosted.length === 0 && invited.length === 0) return null;

  return (
    <section aria-labelledby="hub-organised" className="mt-8">
      <div className="mb-3">
        <h3
          id="hub-organised"
          className="font-display text-xl tracking-wide text-white"
        >
          Organised
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-zinc-500">
          Games you&apos;re hosting or invited to.
        </p>
      </div>
      <ul className="divide-y divide-white/8 overflow-hidden rounded-3xl border border-white/8 bg-[#141814]">
        {hosted.map((game) => (
          <GameRow key={`host-${game.id}`} game={game} role="Hosting" now={now} />
        ))}
        {invited.map((game) => (
          <GameRow
            key={`invited-${game.id}`}
            game={game}
            role="Invited"
            now={now}
          />
        ))}
      </ul>
    </section>
  );
}
