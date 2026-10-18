import { ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react";
import Link from "next/link";
import { GAME_DAY_STEPPER_PX } from "@/lib/golf-game-day/scoring-ui";
import { Eyebrow, GameDayColumn, primaryLinkClass, SyncText } from "./ui";

export type ScoreHoleChip = {
  number: number;
  sync: "saved" | "saving" | "offline" | "open";
};

export type ScorePlayerRow = {
  slot: number;
  name: string;
  handicap: string | null;
  strokes: number;
  dots: number;
};

type ScoreEntryProps = {
  headline: string;
  cardNumber: number;
  holeNumber: number;
  holesPlayed: number;
  par: number;
  holeSyncLabel: string;
  overallSyncLabel: string;
  holes: ScoreHoleChip[];
  players: ScorePlayerRow[];
  canScore: boolean;
  reviewHref: string;
  boardHref: string;
  onStep: (slot: number, delta: number) => void;
  onSelectHole: (holeNumber: number) => void;
  onPrevious: () => void;
  onNext: () => void;
};

function chipClass(hole: ScoreHoleChip, current: number): string {
  const base = "inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold";
  if (hole.number === current) return `${base} bg-zinc-950 text-white`;
  if (hole.sync === "offline") return `${base} border border-amber-700 text-amber-800`;
  if (hole.sync === "saving") return `${base} border border-zinc-400 text-zinc-700`;
  if (hole.sync === "saved") return `${base} border border-zinc-950 text-zinc-950`;
  return `${base} border border-zinc-300 text-zinc-500`;
}

export function ScoreEntry({
  headline,
  cardNumber,
  holeNumber,
  holesPlayed,
  par,
  holeSyncLabel,
  overallSyncLabel,
  holes,
  players,
  canScore,
  reviewHref,
  boardHref,
  onStep,
  onSelectHole,
  onPrevious,
  onNext,
}: ScoreEntryProps) {
  const hit = GAME_DAY_STEPPER_PX;
  return (
    <GameDayColumn>
      <div className="flex items-start justify-between gap-4">
        <div>
          <Eyebrow>{headline}</Eyebrow>
          <h1 className="mt-2 font-display text-4xl tracking-wide text-zinc-950">
            Card {cardNumber}
          </h1>
        </div>
        <SyncText label={overallSyncLabel} />
      </div>

      <div className="mt-8 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onPrevious}
          aria-label="Previous hole"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-zinc-300 bg-white text-zinc-950"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden />
        </button>
        <div className="text-center">
          <h2 className="font-display text-4xl tracking-wide text-zinc-950">
            Hole {holeNumber} of {holesPlayed}
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Par {par} · {holeSyncLabel}
          </p>
        </div>
        <button
          type="button"
          onClick={onNext}
          aria-label="Next hole"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-zinc-300 bg-white text-zinc-950"
        >
          <ChevronRight className="h-5 w-5" aria-hidden />
        </button>
      </div>

      <div className="mt-4 flex gap-1 overflow-x-auto pb-1">
        {holes.map((hole) => (
          <button
            key={hole.number}
            type="button"
            aria-label={`Hole ${hole.number}, ${hole.sync}`}
            aria-current={hole.number === holeNumber ? "true" : undefined}
            onClick={() => onSelectHole(hole.number)}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center"
          >
            <span className={chipClass(hole, holeNumber)}>{hole.number}</span>
          </button>
        ))}
      </div>

      <div className="mt-8 space-y-8">
        {players.map((player) => (
          <div key={player.slot} className="text-center">
            <p className="text-sm text-zinc-500">
              {player.name}
              {player.handicap ? ` · ${player.handicap}` : ""}
            </p>
            <div
              role="group"
              aria-label={`Gross score for ${player.name}`}
              className="mt-3 flex items-center justify-center gap-4"
            >
              <button
                type="button"
                disabled={!canScore || player.strokes <= 1}
                onClick={() => onStep(player.slot, -1)}
                style={{ width: hit, height: hit }}
                className="inline-flex items-center justify-center rounded-full border border-zinc-300 bg-white text-zinc-950 disabled:opacity-30"
                aria-label={`Fewer strokes for ${player.name}`}
              >
                <Minus className="h-6 w-6" aria-hidden />
              </button>
              <span className="flex min-w-16 flex-col items-center">
                <span className="font-display text-7xl leading-none text-zinc-950 tabular-nums">
                  {player.strokes}
                </span>
                {player.dots > 0 ? (
                  <span
                    className="mt-2 flex gap-1"
                    aria-label={`${player.dots} stroke${player.dots === 1 ? "" : "s"} received`}
                  >
                    {Array.from({ length: Math.min(player.dots, 6) }, (_, index) => (
                      <span
                        key={index}
                        className="h-1.5 w-1.5 rounded-full bg-green-800"
                        aria-hidden
                      />
                    ))}
                  </span>
                ) : null}
              </span>
              <button
                type="button"
                disabled={!canScore || player.strokes >= 15}
                onClick={() => onStep(player.slot, 1)}
                style={{ width: hit, height: hit }}
                className="inline-flex items-center justify-center rounded-full bg-zinc-950 text-white disabled:opacity-30"
                aria-label={`More strokes for ${player.name}`}
              >
                <Plus className="h-6 w-6" aria-hidden />
              </button>
            </div>
          </div>
        ))}
      </div>

      {!canScore ? (
        <p className="mt-8 text-center text-sm text-zinc-500">
          Take over scoring if you need to.
        </p>
      ) : null}

      <div className="mt-10">
        <Link href={reviewHref} className={primaryLinkClass}>
          Review card
        </Link>
        <Link
          href={boardHref}
          className="mt-4 block text-center text-sm font-semibold text-zinc-950"
        >
          Leaderboard
        </Link>
      </div>
    </GameDayColumn>
  );
}
