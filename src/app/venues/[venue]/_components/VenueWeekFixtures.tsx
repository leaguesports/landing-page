"use client";

import {
  WATCH_FIXTURE_SLATE,
  normaliseWatchTeamColour,
  watchFixtureInk,
} from "@/lib/intent/watch-fixture-card";
import {
  VENUE_WEEK_EMPTY,
  watchFixtureDetailLine,
  type WatchVenueFixtureCard,
  type WatchVenueSide,
} from "@/lib/venues/watch-week";
import Link from "next/link";
import { useState } from "react";

function Initials({ side }: { side: WatchVenueSide }) {
  const fill = normaliseWatchTeamColour(side.colour) ?? WATCH_FIXTURE_SLATE;
  return (
    <span
      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl font-display text-2xl tracking-[0.08em]"
      style={{ backgroundColor: fill, color: watchFixtureInk(fill) }}
    >
      {side.code}
    </span>
  );
}

function FixtureCard({ card }: { card: WatchVenueFixtureCard }) {
  const detail = watchFixtureDetailLine(card.clock, card.cues);
  const paired = Boolean(card.home && card.away);
  const body = (
    <>
      {paired && card.home && card.away ? (
        <span className="grid grid-cols-[3.5rem_minmax(0,1fr)_3.5rem] items-center gap-3">
          <Initials side={card.home} />
          <span className="text-center text-base font-semibold leading-snug text-white">
            {card.title}
          </span>
          <Initials side={card.away} />
        </span>
      ) : (
        <span className="block text-center text-base font-semibold leading-snug text-white">
          {card.title}
        </span>
      )}
      {detail ? (
        <span className="mt-3 block text-center text-sm text-zinc-400">
          {detail}
        </span>
      ) : null}
    </>
  );
  const className =
    "block rounded-3xl border border-white/10 bg-[#141814] px-4 py-4 transition-colors hover:border-white/20";

  if (!card.href) {
    return (
      <article className={className} data-fixture-clock={card.clock}>
        {body}
      </article>
    );
  }

  return (
    <Link
      href={card.href}
      className={className}
      data-fixture-clock={card.clock}
      aria-label={`${card.title}, ${detail}`}
    >
      {body}
    </Link>
  );
}

export function VenueWeekFixtures({
  days,
  cards,
}: {
  days: { id: string; chip: string }[];
  cards: WatchVenueFixtureCard[];
}) {
  const [dayId, setDayId] = useState(days[0]?.id ?? "");
  const visible = cards.filter((card) => card.dayId === dayId);

  return (
    <section aria-labelledby="venue-this-week">
      <h2
        id="venue-this-week"
        className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500"
      >
        This week
      </h2>

      {days.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-300">{VENUE_WEEK_EMPTY}</p>
      ) : (
        <>
          <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Days with a screening">
            {days.map((day) => {
              const selected = day.id === dayId;
              return (
                <button
                  key={day.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setDayId(day.id)}
                  className={`min-h-10 rounded-full px-4 text-sm font-semibold ${
                    selected
                      ? "bg-white text-zinc-950"
                      : "border border-white/15 text-zinc-300 hover:border-white/30 hover:text-white"
                  }`}
                >
                  {day.chip}
                </button>
              );
            })}
          </div>
          <div className="mt-4 space-y-3">
            {visible.map((card) => (
              <FixtureCard key={card.id} card={card} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
