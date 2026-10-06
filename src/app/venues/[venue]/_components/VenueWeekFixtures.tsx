"use client";

import {
  WATCH_FIXTURE_SLATE,
  normaliseWatchTeamColour,
  watchFixtureInk,
} from "@/lib/intent/watch-fixture-card";
import {
  VENUE_WEEK_EMPTY,
  type WatchVenueFixtureCard,
  type WatchVenueSide,
} from "@/lib/venues/watch-week";
import Link from "next/link";
import { useState } from "react";

const NEON = "#C6FF00";

function Initials({ side }: { side: WatchVenueSide }) {
  const fill = normaliseWatchTeamColour(side.colour) ?? WATCH_FIXTURE_SLATE;
  return (
    <span
      className="flex h-16 w-16 shrink-0 items-center justify-center border-2 border-[#333] font-display text-3xl tracking-[0.08em]"
      style={{ backgroundColor: fill, color: watchFixtureInk(fill) }}
    >
      {side.code}
    </span>
  );
}

function FixtureCard({ card }: { card: WatchVenueFixtureCard }) {
  const paired = Boolean(card.home && card.away);
  const showClock = Boolean(card.clock);
  const cues = card.cues.filter((cue) => cue.trim());
  const columns =
    showClock && cues.length > 0
      ? "md:grid-cols-[auto_minmax(0,1fr)_auto]"
      : showClock
        ? "md:grid-cols-[auto_minmax(0,1fr)]"
        : cues.length > 0
          ? "md:grid-cols-[minmax(0,1fr)_auto]"
          : "";
  const body = (
    <span className={`grid ${columns}`}>
      {showClock ? (
        <span className="flex flex-col items-center justify-center border-b-2 border-[#333] px-5 py-4 md:border-b-0 md:border-r-2">
          <span className="font-display text-sm uppercase tracking-[0.22em] text-[#C6FF00]">
            Kick-off
          </span>
          <span
            className="mt-1 font-display text-6xl leading-none tracking-wide sm:text-7xl"
            style={{ color: NEON, textShadow: `0 0 14px ${NEON}` }}
          >
            {card.clock}
          </span>
          <span className="mt-2 h-0.5 w-16 bg-[#C6FF00]" />
        </span>
      ) : null}
      <span className="flex flex-col items-center justify-center gap-3 px-4 py-5">
        {paired && card.home && card.away ? (
          <span className="flex items-center gap-4">
            <Initials side={card.home} />
            <span className="font-display text-2xl text-[#666]">VS</span>
            <Initials side={card.away} />
          </span>
        ) : null}
        <span className="text-center font-display text-xl uppercase tracking-wide text-white">
          {card.title}
        </span>
      </span>
      {cues.length > 0 ? (
        <span className="flex flex-wrap items-center justify-center gap-2 border-t-2 border-[#333] px-4 py-4 md:border-t-0 md:border-l-2">
          {cues.map((cue) => (
            <span
              key={cue}
              className="inline-flex bg-[#C6FF00] px-2 py-1 font-display text-sm uppercase tracking-wide text-black"
            >
              {cue}
            </span>
          ))}
        </span>
      ) : null}
    </span>
  );
  const className = "block border-2 border-[#333] bg-black text-white";
  const label = [card.title, card.clock, ...card.cues].filter(Boolean).join(", ");

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
      aria-label={label}
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
    <section id="week" aria-labelledby="venue-this-week">
      <p
        id="venue-this-week"
        className="font-display text-3xl uppercase tracking-[0.18em] text-[#C6FF00]"
      >
        This week
      </p>

      {days.length === 0 ? (
        <p className="mt-4 border-2 border-[#333] px-4 py-6 text-sm text-[#C8C8C8]">
          {VENUE_WEEK_EMPTY}
        </p>
      ) : (
        <>
          <div
            className="mt-4 flex flex-wrap"
            role="group"
            aria-label="Days with a screening"
          >
            {days.map((day) => {
              const selected = day.id === dayId;
              return (
                <button
                  key={day.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setDayId(day.id)}
                  className={`min-h-11 border-2 px-4 font-display text-xl uppercase tracking-wide ${
                    selected
                      ? "border-[#C6FF00] bg-[#C6FF00] text-black"
                      : "border-[#333] bg-black text-white hover:border-[#C6FF00]"
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
