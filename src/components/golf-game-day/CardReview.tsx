"use client";

import Link from "next/link";
import { Check, ChevronLeft } from "lucide-react";
import { looksRightPill, scoreMark } from "@/lib/golf-game-day/scoring-ui";
import { DesktopReview } from "./DesktopReview";
import { useGameDayAction } from "./GameDayChrome";
import { PrimaryButton } from "./ui";

export type ReviewPlayer = {
  slot: number;
  name: string;
  handicap: string | null;
  holes: Array<{ number: number; strokes: number | null; par?: number }>;
  gross: number | null;
  toPar: string;
  net?: number | null;
  points?: number | null;
  scorer?: boolean;
  looksRight?: boolean;
  you?: boolean;
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
  onEditHole?: (holeNumber: number) => void;
  onLooksRight?: (slot: number) => void;
  canUnlock?: boolean;
  unlocking?: boolean;
  onUnlock?: () => void;
  notice?: string | null;
  sample?: boolean;
};

function sumStrokes(holes: ReviewPlayer["holes"]): number | null {
  if (holes.some((hole) => hole.strokes == null)) return null;
  return holes.reduce((total, hole) => total + (hole.strokes ?? 0), 0);
}

function ScoreCell({
  strokes,
  par,
  onEdit,
}: {
  strokes: number | null;
  par: number | undefined;
  onEdit?: () => void;
}) {
  const mark = strokes != null && par != null ? scoreMark(strokes, par) : "plain";
  const className =
    mark === "birdie"
      ? "inline-flex h-6 w-6 items-center justify-center rounded-full border border-zinc-950 text-sm font-bold tabular-nums text-zinc-950"
      : mark === "double"
        ? "inline-flex h-6 w-6 items-center justify-center bg-zinc-200 text-sm font-bold tabular-nums text-zinc-950"
        : "inline-flex h-6 w-6 items-center justify-center text-sm font-bold tabular-nums text-zinc-950";
  const label = strokes == null ? "–" : String(strokes);
  if (!onEdit) return <span className={className}>{label}</span>;
  return (
    <button type="button" onClick={onEdit} className={className} aria-label={`Edit hole score ${label}`}>
      {label}
    </button>
  );
}

function NineTable({
  title,
  totalLabel,
  players,
  onEditHole,
}: {
  title: string;
  totalLabel: string;
  players: ReviewPlayer[];
  onEditHole?: (holeNumber: number) => void;
}) {
  const holes = players[0]?.holes ?? [];
  const parTotal = holes.every((hole) => hole.par != null)
    ? holes.reduce((total, hole) => total + (hole.par ?? 0), 0)
    : null;
  return (
    <section className="mt-5" aria-label={title}>
      <table className="w-full border-collapse text-center">
        <thead>
          <tr className="bg-zinc-100 text-[10px] font-bold tracking-[0.08em] text-zinc-800">
            <th className="bg-zinc-100 py-1.5 pr-1 text-left font-bold normal-case">{title}</th>
            {holes.map((hole) => (
              <th key={hole.number} className="bg-zinc-100 px-0.5 py-1.5 font-bold">
                {hole.number}
              </th>
            ))}
            <th className="bg-zinc-100 py-1.5 pl-1 font-bold normal-case">{totalLabel}</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-zinc-200 bg-zinc-100">
            <th className="bg-zinc-100 py-1 pr-1 text-left text-xs font-bold text-zinc-950">Par</th>
            {holes.map((hole) => (
              <td key={hole.number} className="bg-zinc-100 px-0.5 py-1 text-xs font-bold tabular-nums text-zinc-950">
                {hole.par ?? "–"}
              </td>
            ))}
            <td className="bg-zinc-100 py-1 pl-1 text-xs font-bold tabular-nums text-zinc-950">{parTotal ?? "–"}</td>
          </tr>
          {players.map((player) => (
            <tr key={player.slot} className="border-b border-zinc-100">
              <th className="py-1 pr-1 text-left text-sm font-bold text-zinc-950">{player.name}</th>
              {player.holes.map((hole) => (
                <td key={hole.number} className="px-0.5 py-1">
                  <ScoreCell
                    strokes={hole.strokes}
                    par={hole.par}
                    onEdit={onEditHole ? () => onEditHole(hole.number) : undefined}
                  />
                </td>
              ))}
              <td className="bg-zinc-100 py-1 pl-1 text-sm font-bold tabular-nums text-zinc-950">
                {sumStrokes(player.holes) ?? "–"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export function CardReview({
  cardNumber,
  players,
  canConfirm,
  confirming,
  blockedReason,
  scoreHref,
  boardHref,
  onConfirm,
  onEditHole,
  onLooksRight,
  canUnlock = false,
  unlocking = false,
  onUnlock,
  notice = null,
  sample = false,
}: CardReviewProps) {
  useGameDayAction("Board", boardHref);
  const front = players.map((player) => ({
    ...player,
    holes: player.holes.filter((hole) => hole.number <= 9),
  }));
  const back = players.map((player) => ({
    ...player,
    holes: player.holes.filter((hole) => hole.number >= 10),
  }));
  const lastHole = players[0]?.holes.at(-1)?.number ?? 18;

  return (
    <>
    <div className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-[420px] flex-col pb-[6.75rem] lg:hidden">
      <div className="gd-phone">
      <div className="flex-1 px-4 pt-4">
        <div className="flex h-10 items-center justify-between">
          <Link href={scoreHref} className="inline-flex items-center gap-0.5 text-sm font-semibold text-zinc-950">
            <ChevronLeft className="h-4 w-4" aria-hidden />
            Hole {lastHole}
          </Link>
          <span className="text-sm font-semibold text-zinc-950">Review card</span>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#006045]">
            Card {cardNumber} · all 18 holes in
          </p>
          <span className="shrink-0 rounded-full bg-[#3dff8a] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-950">
            New
          </span>
        </div>
        <h1 className="mt-2 font-display text-[42px] leading-none tracking-wide text-zinc-950">Check your card</h1>
        <p className="mt-2 text-sm text-zinc-600">Tap any score to fix it before you confirm.</p>

        <NineTable title="Front" totalLabel="Out" players={front} onEditHole={onEditHole} />
        <NineTable title="Back" totalLabel="In" players={back} onEditHole={onEditHole} />

        <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-zinc-600">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-zinc-950" aria-hidden />
            Birdie or better
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-flex h-5 w-5 items-center justify-center bg-zinc-200" aria-hidden />
            Double bogey+
          </span>
        </p>

        <ul className="mt-6 overflow-hidden rounded-2xl border border-zinc-300">
          {players.map((player) => {
            const pill = looksRightPill({
              looksRight: player.looksRight === true,
              you: player.you === true,
            });
            const summary =
              player.gross == null
                ? "Score incomplete"
                : player.handicap
                  ? `${player.gross} gross · ${player.net ?? "–"} net · ${player.points ?? "–"} pts`
                  : `${player.gross} gross · no hcp · ${player.points ?? "–"} pts`;
            const pillClass = pill?.filled
              ? "inline-flex h-10 shrink-0 items-center gap-1 rounded-full border border-zinc-950 bg-[#3dff8a] px-3 text-sm font-semibold text-zinc-950"
              : "inline-flex h-10 shrink-0 items-center gap-1 rounded-full border border-zinc-300 bg-white px-3 text-sm font-semibold text-zinc-950";
            return (
              <li key={player.slot} className="flex items-center justify-between gap-3 border-b border-zinc-200 px-3 py-3 last:border-b-0">
                <div className="min-w-0">
                  <p className="font-bold text-zinc-950">{player.name}</p>
                  <p className="mt-0.5 text-sm font-semibold text-zinc-800">{summary}</p>
                </div>
                {pill?.interactive ? (
                  <button type="button" onClick={() => onLooksRight?.(player.slot)} className={pillClass}>
                    <Check className="h-3.5 w-3.5" aria-hidden />
                    {pill.label}
                  </button>
                ) : pill ? (
                  <span className={pillClass}>
                    <Check className="h-3.5 w-3.5" aria-hidden />
                    {pill.label}
                  </span>
                ) : null}
              </li>
            );
          })}
        </ul>
        <p className="mt-2 text-xs text-zinc-500">
          Players can tick &quot;Looks right&quot; on their own phone. Optional.
        </p>
        {notice ? (
          <p role="status" className="mt-4 text-xs font-medium text-zinc-600">
            {notice}
          </p>
        ) : null}
        {blockedReason ? (
          <p role="alert" className="mt-4 text-sm text-zinc-600">
            {blockedReason}
          </p>
        ) : null}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30">
        <div className="mx-auto w-full max-w-[420px] border-t border-zinc-200 bg-white px-4 py-3">
          {canUnlock ? (
            <PrimaryButton type="button" disabled={unlocking} onClick={onUnlock} className="!text-lg">
              {unlocking ? "Unlocking…" : "Unlock"}
            </PrimaryButton>
          ) : (
            <PrimaryButton type="button" disabled={!canConfirm || confirming} onClick={onConfirm} className="!text-lg">
              {confirming ? "Confirming…" : `✓ Confirm Card ${cardNumber}`}
            </PrimaryButton>
          )}
        </div>
      </div>
      </div>
    </div>
    <DesktopReview
      cardNumber={cardNumber}
      players={players}
      canConfirm={canConfirm}
      confirming={confirming}
      canUnlock={canUnlock}
      unlocking={unlocking}
      sample={sample}
      scoreHref={scoreHref}
      onConfirm={onConfirm}
      onUnlock={onUnlock}
      onEditHole={onEditHole}
      onLooksRight={onLooksRight}
    />
    </>
  );
}
