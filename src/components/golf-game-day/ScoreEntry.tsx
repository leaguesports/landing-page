"use client";

import { Check, ChevronLeft, ChevronRight, Clock, Minus, MoreHorizontal, Plus, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  GAME_DAY_STEPPER_PX,
  holeStatusLines,
} from "@/lib/golf-game-day/scoring-ui";
import { useGameDayAction } from "./GameDayChrome";

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
  total: number | null;
  toPar: string;
  relation: string;
  shotChip: string | null;
};

type ScoreEntryProps = {
  headline: string;
  cardNumber: number;
  holeNumber: number;
  holesPlayed: number;
  par: number;
  strokeIndex: number;
  takeoverName: string | null;
  takeoverDetail?: string | null;
  holes: ScoreHoleChip[];
  players: ScorePlayerRow[];
  canScore: boolean;
  reviewHref: string;
  boardHref: string;
  onStep: (slot: number, delta: number) => void;
  onSelectHole: (holeNumber: number) => void;
  onNext: () => void;
};

function holeClass(hole: ScoreHoleChip, current: number): string {
  const base =
    "flex h-[22px] w-full items-center justify-center rounded-[5px] text-[8px] font-semibold leading-none";
  if (hole.number === current) return `${base} border border-green-700 bg-[#3dff8a] text-zinc-950`;
  if (hole.sync === "offline" || hole.sync === "saving") return `${base} border border-amber-600 bg-amber-400 text-zinc-950`;
  if (hole.sync === "saved") return `${base} border border-zinc-950 bg-zinc-950 text-white`;
  return `${base} border border-zinc-300 bg-white text-zinc-500`;
}

function overPar(relation: string): boolean {
  return relation === "BOGEY" || relation === "DOUBLE" || relation === "TRIPLE" || relation.startsWith("+");
}

export function ScoreEntry({
  cardNumber,
  holeNumber,
  holesPlayed,
  par,
  strokeIndex,
  takeoverName,
  takeoverDetail = null,
  holes,
  players,
  canScore,
  reviewHref,
  boardHref,
  onStep,
  onSelectHole,
  onNext,
}: ScoreEntryProps) {
  const hit = GAME_DAY_STEPPER_PX;
  const [menu, setMenu] = useState(false);
  const lines = holeStatusLines(holes);
  useGameDayAction("Board", boardHref);
  const last = holeNumber >= holesPlayed;
  const savedLine = lines.find((line) => line.includes("synced"));
  const waitingLine = lines.find((line) => line.includes("waiting"));

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-[420px] flex-col overflow-x-hidden">
      <div className="flex h-12 items-center gap-1 px-2">
        <Link
          href={boardHref}
          aria-label="Close"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center text-zinc-950"
        >
          <X className="h-5 w-5" aria-hidden />
        </Link>
        <p className="min-w-0 flex-1 truncate text-left text-sm font-bold text-zinc-950">
          Card {cardNumber}
          {canScore ? " · You're scoring" : ""}
        </p>
        <button
          type="button"
          aria-label="Card menu"
          aria-expanded={menu}
          onClick={() => setMenu((open) => !open)}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-zinc-300 text-zinc-950"
        >
          <MoreHorizontal className="h-5 w-5" aria-hidden />
        </button>
      </div>
      {menu ? (
        <div className="border-b border-zinc-200 bg-white px-4 py-3">
          <Link href={reviewHref} className="block py-2 text-sm font-semibold">
            Review card
          </Link>
          <Link href={boardHref} className="block py-2 text-sm font-semibold">
            Leaderboard
          </Link>
        </div>
      ) : null}

      {takeoverName ? (
        <div className="mx-4 mt-2 flex items-center gap-3 rounded-2xl bg-zinc-950 px-4 py-2.5 text-white">
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#3dff8a] text-zinc-950">
            <Check className="h-4 w-4" aria-hidden />
          </span>
          <p className="min-w-0 flex-1">
            <span className="block text-sm font-bold">
              {takeoverName} is now scoring Card {cardNumber}
            </span>
            {takeoverDetail ? <span className="mt-0.5 block text-sm text-zinc-400">{takeoverDetail}</span> : null}
          </p>
        </div>
      ) : null}

      <div className="px-4 pb-0 pt-5">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            aria-label="Previous hole"
            disabled={holeNumber <= 1}
            onClick={() => onSelectHole(holeNumber - 1)}
            className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-zinc-950 text-zinc-950 disabled:opacity-30"
          >
            <ChevronLeft className="h-6 w-6" aria-hidden />
          </button>
          <h1 className="font-display text-[68px] leading-none tracking-wide text-zinc-950">HOLE {holeNumber}</h1>
          <button
            type="button"
            aria-label="Next hole"
            disabled={holeNumber >= holesPlayed}
            onClick={() => onSelectHole(holeNumber + 1)}
            className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-zinc-300 text-zinc-950 disabled:opacity-30"
          >
            <ChevronRight className="h-6 w-6" aria-hidden />
          </button>
        </div>
        <div className="mt-0 flex items-center justify-center gap-2">
          <span className="rounded-full border border-zinc-300 px-4 py-2 text-sm text-zinc-950">
            Par <span className="font-bold">{par}</span>
          </span>
          <span className="rounded-full border border-zinc-300 px-4 py-2 text-sm text-zinc-950">
            Stroke index <span className="font-bold">{strokeIndex}</span>
          </span>
        </div>

        <div className="mt-2 rounded-xl bg-zinc-100 px-2 py-2.5">
          <div className="grid grid-cols-[repeat(18,minmax(0,1fr))] gap-[2px]">
            {holes.map((hole) => (
              <button
                key={hole.number}
                type="button"
                aria-label={`Hole ${hole.number}, ${hole.sync}`}
                aria-current={hole.number === holeNumber ? "true" : undefined}
                onClick={() => onSelectHole(hole.number)}
                className="min-w-0"
              >
                <span className={holeClass(hole, holeNumber)}>{hole.number}</span>
              </button>
            ))}
          </div>
          {savedLine || waitingLine ? (
            <div className="mt-2 flex items-center justify-between gap-2 text-xs font-semibold">
              {savedLine ? (
                <span className="inline-flex min-w-0 items-center gap-1 text-zinc-950">
                  <Check className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  {savedLine}
                </span>
              ) : (
                <span />
              )}
              {waitingLine ? (
                <span className="inline-flex min-w-0 items-center justify-end gap-1 text-right text-amber-900">
                  <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  {waitingLine}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="mt-2">
          {players.map((player) => (
            <div key={player.slot} className="flex min-h-[100px] items-center justify-between gap-2 border-b border-zinc-200 py-3 last:border-b-0">
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2">
                  <span className="text-lg font-extrabold text-zinc-950">{player.name}</span>
                  {player.shotChip ? (
                    <span className="inline-flex rounded-full bg-zinc-950 px-2 py-0.5 text-xs font-semibold text-[#3dff8a]">
                      {player.shotChip}
                    </span>
                  ) : null}
                </p>
                <p className="mt-0.5 text-sm font-bold text-zinc-800">
                  Total {player.total ?? "–"} · {player.toPar}
                </p>
              </div>
              <div
                role="group"
                aria-label={`Gross score for ${player.name}`}
                className="flex shrink-0 items-center gap-1.5"
              >
                <button
                  type="button"
                  disabled={!canScore || player.strokes <= 1}
                  onClick={() => onStep(player.slot, -1)}
                  style={{ width: hit, height: hit }}
                  className="inline-flex items-center justify-center rounded-2xl bg-zinc-950 text-white disabled:opacity-30"
                  aria-label={`Fewer strokes for ${player.name}`}
                >
                  <Minus className="h-6 w-6" aria-hidden />
                </button>
                <span className="flex w-14 flex-col items-center">
                  <span className="font-display text-5xl leading-none text-zinc-950 tabular-nums">
                    {player.strokes}
                  </span>
                  {overPar(player.relation) ? (
                    <span className="mt-1 h-1 w-8 rounded-full bg-[#3dff8a]" aria-hidden />
                  ) : (
                    <span className="mt-1 h-1 w-8" aria-hidden />
                  )}
                  <span className="text-[11px] font-semibold tracking-[0.12em] text-zinc-950">
                    {player.relation}
                  </span>
                </span>
                <button
                  type="button"
                  disabled={!canScore || player.strokes >= 15}
                  onClick={() => onStep(player.slot, 1)}
                  style={{ width: hit, height: hit }}
                  className="inline-flex items-center justify-center rounded-2xl bg-zinc-950 text-white disabled:opacity-30"
                  aria-label={`More strokes for ${player.name}`}
                >
                  <Plus className="h-6 w-6" aria-hidden />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="sticky bottom-0 border-t border-zinc-200 bg-white px-4 py-3">
        <button
          type="button"
          disabled={!canScore}
          onClick={onNext}
          className="inline-flex min-h-16 w-full items-center justify-center gap-1 rounded-full bg-zinc-950 px-5 text-base font-semibold text-white disabled:opacity-40"
        >
          {last ? `Save hole ${holeNumber} · review` : `Save hole ${holeNumber} · next`}
          {last ? null : <ChevronRight className="h-5 w-5" aria-hidden />}
        </button>
      </div>
    </div>
  );
}
