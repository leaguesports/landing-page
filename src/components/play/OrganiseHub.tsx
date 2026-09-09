"use client";

import { PlaySportModal } from "@/components/home/PlaySportModal";
import type { SportDefinition } from "@/lib/sports/catalog";
import {
  HUB_ORGANISE_HUB_SUBTITLE,
  HUB_ORGANISE_HUB_TITLE,
  HUB_ORGANISE_ROWS,
  hubOrganiseRowBadge,
  hubPlayModalSportOptions,
  type HubOrganiseBadgeCounts,
} from "@/lib/sports/hub-ia";
import { ArrowUpRight, Calendar, Flag, Medal, Trophy, Users } from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";

type OrganiseHubProps = {
  sports: readonly SportDefinition[];
  badges?: HubOrganiseBadgeCounts;
};

function RowIcon({ id }: { id: (typeof HUB_ORGANISE_ROWS)[number]["id"] }) {
  if (id === "lobby") return <Users className="h-4 w-4" aria-hidden />;
  if (id === "team-matches") return <Trophy className="h-4 w-4" aria-hidden />;
  if (id === "tournaments") return <Medal className="h-4 w-4" aria-hidden />;
  if (id === "golf-tours") return <Flag className="h-4 w-4" aria-hidden />;
  return <Calendar className="h-4 w-4" aria-hidden />;
}

export function OrganiseHub({ sports, badges = {} }: OrganiseHubProps) {
  const [pickSport, setPickSport] = useState(false);
  const options = hubPlayModalSportOptions(sports, "organise");
  const closeModal = useCallback(() => setPickSport(false), []);

  return (
    <section className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
        Play
      </p>
      <h1 className="font-display text-5xl tracking-wide text-white sm:text-6xl">
        {HUB_ORGANISE_HUB_TITLE}
      </h1>
      <p className="mt-4 max-w-xl text-base leading-relaxed text-zinc-400">
        {HUB_ORGANISE_HUB_SUBTITLE}
      </p>

      <ul className="mt-8 divide-y divide-white/8 overflow-hidden rounded-3xl border border-white/8 bg-[#141814]">
        {HUB_ORGANISE_ROWS.map((row) => {
          const badge = hubOrganiseRowBadge(row.id, badges);
          const inner = (
            <>
              <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/8 bg-white/4 text-emerald-200">
                <RowIcon id={row.id} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="block text-sm font-medium text-white">
                    {row.title}
                  </span>
                  {badge ? (
                    <span className="inline-flex items-center rounded-full bg-emerald-400/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-200 tabular-nums">
                      {badge}
                    </span>
                  ) : null}
                </span>
                <span className="mt-1 block text-sm leading-relaxed text-zinc-500">
                  {row.description}
                </span>
              </span>
              <ArrowUpRight
                className="mt-1 h-4 w-4 shrink-0 text-zinc-600"
                aria-hidden
              />
            </>
          );
          const className =
            "flex w-full items-start gap-3 px-4 py-4 text-left transition-colors hover:bg-white/3 sm:px-5";

          return (
            <li key={row.id}>
              {row.href ? (
                <Link href={row.href} className={className}>
                  {inner}
                </Link>
              ) : (
                <button
                  type="button"
                  aria-haspopup="dialog"
                  aria-expanded={pickSport}
                  onClick={() => setPickSport(true)}
                  className={className}
                >
                  {inner}
                </button>
              )}
            </li>
          );
        })}
      </ul>

      {pickSport ? (
        <PlaySportModal
          verb="organise"
          options={options}
          onClose={closeModal}
        />
      ) : null}
    </section>
  );
}
