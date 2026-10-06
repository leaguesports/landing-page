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
  const paired = Boolean(card.home && card.away);
  const clock = card.clock ? (
    <span className="block text-center font-display text-5xl leading-none tracking-wide text-white">
      {card.clock}
    </span>
  ) : null;
  const body = (
    <>
      {paired && card.home && card.away ? (
        <span className="grid grid-cols-[3.5rem_minmax(0,1fr)_3.5rem] items-center gap-3">
          <Initials side={card.home} />
          {clock ?? (
            <span className="text-center text-base font-semibold leading-snug text-white">
              {card.title}
            </span>
          )}
          <Initials side={card.away} />
        </span>
      ) : (
        clock ?? (
          <span className="block text-center text-base font-semibold leading-snug text-white">
            {card.title}
          </span>
        )
      )}
      {clock ? (
        <span className="mt-3 block text-center text-sm font-semibold text-white">
          {card.title}
        </span>
      ) : null}
      {card.cues.length > 0 ? (
        <span className="mt-3 flex flex-wrap items-center justify-center gap-2">
          {card.cues.map((cue) => (
            <span
              key={cue}
              className="inline-flex items-center rounded-full bg-emerald-400/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-300"
            >
              {cue}
            </span>
          ))}
        </span>
      ) : null}
    </>
  );
  const className =
    "block rounded-2xl border border-white/10 bg-[#141a17] px-5 py-6 transition-colors hover:border-white/20";
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
    <section id="week" className="scroll-mt-28" aria-labelledby="venue-this-week">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand)]">
          This week
        </p>
        <h2
          id="venue-this-week"
          className="mt-2 font-display text-3xl uppercase tracking-wide text-white sm:text-4xl"
        >
          What&apos;s on
        </h2>
        <p className="mt-2 text-sm text-zinc-500">Screenings at this venue</p>
      </header>

      {days.length === 0 ? (
        <p className="text-sm text-zinc-300">{VENUE_WEEK_EMPTY}</p>
      ) : (
        <>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Days with a screening">
            {days.map((day) => {
              const selected = day.id === dayId;
              return (
                <button
                  key={day.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setDayId(day.id)}
                  className={`inline-flex min-h-11 shrink-0 items-center justify-center rounded-full px-5 text-sm font-semibold ${
                    selected
                      ? "bg-[var(--color-brand)] text-zinc-950"
                      : "border border-white/12 text-zinc-300 hover:border-white hover:text-white"
                  }`}
                >
                  {day.chip}
                </button>
              );
            })}
          </div>
          <div className="mt-4 space-y-4">
            {visible.map((card) => (
              <FixtureCard key={card.id} card={card} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
