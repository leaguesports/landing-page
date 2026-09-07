"use client";

import {
  TEAM_LIST_SPORT_ALL,
  TEAM_SPORTS,
  filterTeamsByListSport,
  formatMemberCount,
  formatTeamRole,
  formatTeamSport,
  teamsListEmptyCopy,
  teamProfileHref,
  type PublicTeamSummary,
  type TeamListSportFilter,
} from "@/lib/teams/teams";
import Link from "next/link";
import { useMemo, useState } from "react";

type TeamListProps = {
  teams: PublicTeamSummary[];
  pendingInvites?: PublicTeamSummary[];
};

export function TeamList({ teams, pendingInvites = [] }: TeamListProps) {
  const [sport, setSport] = useState<TeamListSportFilter>(TEAM_LIST_SPORT_ALL);
  const visible = useMemo(
    () => filterTeamsByListSport(teams, sport),
    [sport, teams],
  );
  const visiblePending = useMemo(
    () => filterTeamsByListSport(pendingInvites, sport),
    [pendingInvites, sport],
  );

  const chips: { id: TeamListSportFilter; label: string }[] = [
    { id: TEAM_LIST_SPORT_ALL, label: "All" },
    ...TEAM_SPORTS.map((item) => ({
      id: item,
      label: formatTeamSport(item),
    })),
  ];

  return (
    <div>
      <div
        className="mb-5 flex flex-wrap gap-2"
        role="tablist"
        aria-label="Filter teams by sport"
      >
        {chips.map((chip) => {
          const selected = sport === chip.id;
          return (
            <button
              key={chip.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setSport(chip.id)}
              className={[
                "inline-flex min-h-9 items-center rounded-full border px-3 text-xs font-semibold uppercase tracking-[0.14em] transition-colors",
                selected
                  ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-200"
                  : "border-white/10 bg-[#101410] text-zinc-400 hover:border-white/20 hover:text-white",
              ].join(" ")}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      {visiblePending.length > 0 ? (
        <div className="mb-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Invites
          </p>
          <ul className="space-y-2">
            {visiblePending.map((invite) => (
              <li key={invite.id}>
                <Link
                  href={teamProfileHref(invite.id)}
                  className="flex items-start justify-between gap-4 rounded-3xl border border-emerald-400/20 bg-emerald-400/5 px-5 py-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">
                      {invite.name}
                    </p>
                    <p className="mt-1 truncate text-sm text-zinc-500">
                      {formatTeamSport(invite.sport)} · invited
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-medium text-emerald-300">
                    View
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {visible.length === 0 ? (
        <div className="rounded-3xl border border-white/8 bg-[#141814] px-5 py-8 sm:px-8">
          <p className="max-w-md text-sm leading-relaxed text-zinc-400">
            {teamsListEmptyCopy(teams.length, sport)}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {visible.map((team) => (
            <li key={team.id}>
              <Link
                href={teamProfileHref(team.id)}
                className="flex items-start justify-between gap-4 rounded-3xl border border-white/8 bg-[#141814] px-5 py-4 transition-colors hover:border-white/16"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">
                    {team.name}
                  </p>
                  <p className="mt-1 truncate text-sm text-zinc-500">
                    {formatTeamSport(team.sport)} · {formatTeamRole(team.myRole)}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-medium text-emerald-300 tabular-nums">
                  {formatMemberCount(team.memberCount)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
