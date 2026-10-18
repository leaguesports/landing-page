import Link from "next/link";
import { Eyebrow, GameDayColumn, PrimaryButton, SyncText } from "./ui";

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
  onConfirm,
}: CardReviewProps) {
  return (
    <GameDayColumn>
      <div className="flex items-start justify-between gap-4">
        <div>
          <Eyebrow>{headline}</Eyebrow>
          <h1 className="mt-2 font-display text-5xl tracking-wide text-zinc-950">
            Card {cardNumber}
          </h1>
        </div>
        <SyncText label={overallSyncLabel} />
      </div>
      <p className="mt-3 text-sm text-zinc-500">Check the card, then confirm.</p>

      <div className="mt-8 space-y-8">
        {players.map((player) => (
          <section key={player.slot} aria-label={player.name}>
            <h2 className="text-sm font-semibold text-zinc-950">
              {player.name}
              {player.handicap ? ` · ${player.handicap}` : ""}
            </h2>
            <ol className="mt-3 grid grid-cols-6 gap-y-3">
              {player.holes.map((hole) => (
                <li key={hole.number} className="text-center">
                  <div className="text-[11px] text-zinc-500">{hole.number}</div>
                  <div className="font-display text-2xl leading-none text-zinc-950">
                    {hole.strokes ?? "–"}
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-3 text-sm text-zinc-600">
              Gross {player.gross ?? "–"} · To par {player.toPar}
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
