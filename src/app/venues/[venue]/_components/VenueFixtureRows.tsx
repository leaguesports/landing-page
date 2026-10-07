"use client";

import {
  parseWatchFixtureTitle,
  watchFixtureFill,
  watchFixtureInk,
} from "@/lib/intent/watch-fixture-card";
import { VENUE_WEEK_EMPTY, type WatchVenueFixtureCard, type WatchVenueSide } from "@/lib/venues/watch-week";
import { ChevronRight, Monitor, Volume2 } from "lucide-react";
import Link from "next/link";
import { useState, type ReactNode } from "react";

function TeamBadge({ side, role }: { side: WatchVenueSide; role: "home" | "away" }) {
  const fill = watchFixtureFill(side.colour, role);
  const ink = watchFixtureInk(fill);
  return (
    <span
      className="inline-flex h-7 w-11 shrink-0 items-center justify-center rounded-md text-[11px] font-bold tracking-wide"
      style={{ backgroundColor: fill, color: ink }}
    >
      {side.code}
    </span>
  );
}

function Cue({ label }: { label: string }) {
  const Icon = /sound/i.test(label) ? Volume2 : /screen/i.test(label) ? Monitor : null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600">
      {Icon ? <Icon className="h-3 w-3" aria-hidden /> : null}
      {label}
    </span>
  );
}

function FixtureRow({ card }: { card: WatchVenueFixtureCard }) {
  const cues = card.cues.filter((cue) => cue.trim());
  const names = card.home && card.away ? parseWatchFixtureTitle(card.title) : null;
  const paired = Boolean(card.home && card.away && names);

  let matchup: ReactNode;
  if (paired && card.home && card.away && names) {
    matchup = (
      <span className="flex min-w-0 items-center gap-2.5">
        <span className="flex min-w-0 items-center gap-2">
          <TeamBadge side={card.home} role="home" />
          <span className="truncate text-sm font-semibold text-zinc-950">{names.home}</span>
        </span>
        <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
          vs
        </span>
        <span className="flex min-w-0 items-center gap-2">
          <TeamBadge side={card.away} role="away" />
          <span className="truncate text-sm font-semibold text-zinc-950">{names.away}</span>
        </span>
      </span>
    );
  } else {
    matchup = (
      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-zinc-950">{card.title}</span>
    );
  }

  const className =
    "group block w-full min-w-0 rounded-2xl border border-zinc-200 bg-white px-4 py-4";
  const body = (
    <>
      <span className="flex items-center justify-between gap-3">
        <span className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1.5">
          <span className="text-base font-semibold tabular-nums text-zinc-950">{card.clock || "–"}</span>
          {cues.map((cue) => (
            <Cue key={cue} label={cue} />
          ))}
        </span>
        {card.href ? (
          <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-zinc-950">
            See details
            <ChevronRight
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </span>
        ) : null}
      </span>
      <span className="mt-3 block">{matchup}</span>
    </>
  );

  if (!card.href) {
    return (
      <div className={className} data-fixture-clock={card.clock}>
        {body}
      </div>
    );
  }

  return (
    <Link
      href={card.href}
      className={`${className} transition-colors hover:border-zinc-400 hover:bg-zinc-50`}
      data-fixture-clock={card.clock}
    >
      {body}
    </Link>
  );
}

export function VenueFixtureRows({
  days,
  cards,
}: {
  days: { id: string; chip: string }[];
  cards: WatchVenueFixtureCard[];
}) {
  const [dayId, setDayId] = useState(days[0]?.id ?? "");
  const visible = cards.filter((card) => card.dayId === dayId);

  if (days.length === 0) {
    return <p className="text-sm text-zinc-400">{VENUE_WEEK_EMPTY}</p>;
  }

  return (
    <div>
      {days.length > 1 ? (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Days with a screening">
          {days.map((day) => {
            const selected = day.id === dayId;
            return (
              <button
                key={day.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setDayId(day.id)}
                className={`min-h-9 rounded-full px-3 text-sm font-medium transition-colors ${
                  selected
                    ? "bg-zinc-950 text-white"
                    : "border border-zinc-300 bg-white text-zinc-700 hover:border-zinc-950 hover:text-zinc-950"
                }`}
              >
                {day.chip}
              </button>
            );
          })}
        </div>
      ) : null}
      <ul className={`flex min-w-0 flex-col gap-2 ${days.length > 1 ? "mt-3" : ""}`}>
        {visible.map((card) => (
          <li key={card.id} className="min-w-0">
            <FixtureRow card={card} />
          </li>
        ))}
      </ul>
    </div>
  );
}
