"use client";

import Link from "next/link";
import { useGameDayAction } from "./GameDayChrome";
import { Eyebrow, GameDayColumn, PrimaryButton } from "./ui";

export type ReviewPlayer = {
  slot: number;
  name: string;
  handicap: string | null;
  holes: Array<{ number: number; strokes: number | null }>;
  gross: number | null;
  toPar: string;
};

type CardReviewProps = {
  headline: string;
  cardNumber: number;
  overallSyncLabel: string;
  players: ReviewPlayer[];
  canConfirm: boolean;
  confirming: boolean;
  blockedReason: string | null;
  scoreHref: string;
  boardHref: string;
  onConfirm: () => void;
};

export function CardReview({
  headline,
  cardNumber,
  overallSyncLabel,
  players,
  canConfirm,
  confirming,
  blockedReason,
  scoreHref,
  boardHref,
  onConfirm,
}: CardReviewProps) {
  useGameDayAction("Board", boardHref);
  const saved = overallSyncLabel === "Saved";
  return (
    <GameDayColumn>
      <Eyebrow>{headline}</Eyebrow>
      <h1 className="mt-2 font-display text-5xl tracking-wide text-zinc-950">Card {cardNumber}</h1>
      <p className={`mt-3 text-sm font-semibold ${saved ? "text-green-800" : "text-zinc-600"}`}>
        {saved ? "✓ Saved on this phone" : overallSyncLabel}
      </p>
      <p className="mt-2 text-sm text-zinc-500">Check the card, then confirm.</p>

      <div className="mt-8 space-y-8">
        {players.map((player) => (
          <section key={player.slot} aria-label={player.name}>
            <h2 className="text-base font-semibold text-zinc-950">
              {player.name}
              {player.handicap ? <span className="ml-2 text-sm font-medium text-zinc-500">{player.handicap}</span> : null}
            </h2>
            <ol className="mt-3 grid grid-cols-9 gap-y-3">
              {player.holes.map((hole) => (
                <li key={hole.number} className="text-center">
                  <div className="text-[10px] font-semibold uppercase text-zinc-400">{hole.number}</div>
                  <div className="font-display text-2xl leading-none text-zinc-950">{hole.strokes ?? "–"}</div>
                </li>
              ))}
            </ol>
            <p className="mt-4 flex items-baseline justify-between text-zinc-950">
              <span className="text-sm font-semibold">Gross {player.gross ?? "–"}</span>
              <span className="font-display text-4xl leading-none">{player.toPar}</span>
            </p>
          </section>
        ))}
      </div>

      {blockedReason ? (
        <p role="alert" className="mt-6 text-sm text-zinc-600">
          {blockedReason}
        </p>
      ) : null}

      <div className="mt-8">
        <PrimaryButton type="button" disabled={!canConfirm || confirming} onClick={onConfirm}>
          {confirming ? "Confirming…" : "Confirm card"}
        </PrimaryButton>
        <Link href={scoreHref} className="mt-4 block text-center text-sm font-semibold text-zinc-950">
          Back to scoring
        </Link>
      </div>
    </GameDayColumn>
  );
}
