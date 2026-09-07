"use client";

import {
  emptyTeamsSnapshot,
  formatMemberCount,
  formatTeamRole,
  formatTeamSport,
  teamProfileHref,
  teamsVisibleOnHubPeople,
  type TeamsSnapshot,
} from "@/lib/teams/teams";
import { HUB_TEAMS_HREF, HUB_TEAMS_NEW_HREF } from "@/lib/sports/hub-ia";
import { Plus, Trophy } from "lucide-react";
import Link from "next/link";

type TeamsPanelProps = {
  initial?: TeamsSnapshot;
  className?: string;
  compact?: boolean;
  previewLimit?: number;
  /**
   * Hub sport from Home/Play. Must not hide other-sport teams on People.
   * Accepted so callers cannot accidentally filter in the panel.
   */
  hubSport?: string | null;
};

export function TeamsPanel({
  initial = emptyTeamsSnapshot(),
  className = "mt-8",
  compact = false,
  previewLimit = 5,
  hubSport = null,
}: TeamsPanelProps) {
  const teams = teamsVisibleOnHubPeople(initial.teams, hubSport);
  const pending = teamsVisibleOnHubPeople(initial.pendingInvites, hubSport);
  const visible = compact ? teams.slice(0, previewLimit) : teams;
  const hiddenCount = teams.length - visible.length;

  return (
    <section className={className} aria-labelledby="hub-your-teams">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Trophy className="h-3.5 w-3.5 text-emerald-300" aria-hidden />
          <h3
            id="hub-your-teams"
            className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500"
          >
            Your teams
          </h3>
        </div>
        <Link
          href={teams.length > 0 ? HUB_TEAMS_HREF : HUB_TEAMS_NEW_HREF}
          className="inline-flex items-center gap-1 text-sm font-medium text-emerald-300 hover:text-emerald-200"
        >
          {compact && teams.length > 0 ? (
            "See all"
          ) : (
            <>
              <Plus className="h-3.5 w-3.5" aria-hidden />
              Create
            </>
          )}
        </Link>
      </div>

      {pending.length > 0 ? (
        <ul className="mb-3 space-y-2">
          {pending.map((invite) => (
            <li key={invite.id}>
              <Link
                href={teamProfileHref(invite.id)}
                className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 px-4 py-3"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-white">
                    {invite.name}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-zinc-500">
                    {formatTeamSport(invite.sport)} · invited
                  </span>
                </span>
                <span className="shrink-0 text-xs font-medium text-emerald-300/90">
                  View
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}

      {teams.length === 0 && pending.length === 0 ? (
        <div className="rounded-3xl border border-white/8 bg-[#141814] px-5 py-6">
          <p className="text-sm leading-relaxed text-zinc-400">
            No teams yet. Create a squad for padel, golf, or darts — invite
            friends or share a join link.
          </p>
          <Link
            href={HUB_TEAMS_NEW_HREF}
            className="mt-4 inline-flex text-sm font-medium text-emerald-300 hover:text-emerald-200"
          >
            Create a team
          </Link>
        </div>
      ) : compact ? (
        <ul className="space-y-2">
          {visible.map((team) => (
            <li key={team.id}>
              <Link
                href={teamProfileHref(team.id)}
                className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-[#141814] px-4 py-3 transition-colors hover:border-white/16"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-white">
                    {team.name}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-zinc-500">
                    {formatTeamSport(team.sport)} · {formatTeamRole(team.myRole)}
                  </span>
                </span>
                <span className="shrink-0 text-xs font-medium text-emerald-300/90">
                  {formatMemberCount(team.memberCount)}
                </span>
              </Link>
            </li>
          ))}
          {hiddenCount > 0 ? (
            <li>
              <Link
                href={HUB_TEAMS_HREF}
                className="inline-flex text-sm font-medium text-emerald-300 hover:text-emerald-200"
              >
                See all {teams.length} teams
              </Link>
            </li>
          ) : null}
        </ul>
      ) : (
        <ul className="space-y-2">
          {teams.map((team) => (
            <li key={team.id}>
              <Link
                href={teamProfileHref(team.id)}
                className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-[#141814] px-4 py-3 transition-colors hover:border-white/16"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-white">
                    {team.name}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-zinc-500">
                    {formatTeamSport(team.sport)} · {formatTeamRole(team.myRole)}
                  </span>
                </span>
                <span className="shrink-0 text-xs font-medium text-emerald-300/90">
                  {formatMemberCount(team.memberCount)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
