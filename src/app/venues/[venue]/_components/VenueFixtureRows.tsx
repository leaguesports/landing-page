"use client";

import { VENUE_WEEK_EMPTY, type WatchVenueFixtureCard } from "@/lib/venues/watch-week";
import Link from "next/link";
import { useState } from "react";

function FixtureRow({ card }: { card: WatchVenueFixtureCard }) {
  const cues = card.cues.filter((cue) => cue.trim());
  const body = (
    <>
      <span className="w-14 shrink-0 pt-0.5 text-sm font-semibold tabular-nums text-zinc-950">
        {card.clock || "–"}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-zinc-950">{card.title}</span>
        {cues.length > 0 ? (
          <span className="mt-0.5 block text-xs text-zinc-500">{cues.join(" · ")}</span>
        ) : null}
      </span>
    </>
  );
  const className = "flex items-start gap-4 px-4 py-3.5";
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
      className={`${className} transition-colors hover:bg-zinc-50`}
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
      <ul className={`${days.length > 1 ? "mt-3" : ""} divide-y divide-zinc-200 overflow-hidden rounded-2xl border border-zinc-200 bg-white`}>
        {visible.map((card) => (
          <li key={card.id}>
            <FixtureRow card={card} />
          </li>
        ))}
      </ul>
    </div>
  );
}
