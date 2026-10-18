"use client";

import { Minus, Plus, X } from "lucide-react";
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
    "flex h-7 w-full items-center justify-center rounded-full text-[10px] font-semibold";
  if (hole.number === current) return `${base} bg-green-700 text-white`;
  if (hole.sync === "offline" || hole.sync === "saving") return `${base} bg-amber-500 text-zinc-950`;
  if (hole.sync === "saved") return `${base} bg-zinc-950 text-white`;
  return `${base} border border-zinc-300 bg-white text-zinc-500`;
}

export function ScoreEntry({
  cardNumber,
  holeNumber,
  holesPlayed,
  par,
  strokeIndex,
  takeoverName,
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
  const [banner, setBanner] = useState(takeoverName);
  const [menu, setMenu] = useState(false);
  const lines = holeStatusLines(holes);
  useGameDayAction("Board", boardHref);
  const last = holeNumber >= holesPlayed;

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-3.5rem)] w-full max-w-[420px] flex-col">
      {banner ? (
        <div className="flex items-center justify-between gap-3 bg-zinc-950 px-4 py-2.5 text-sm text-white">
          <p>{banner} is now scoring Card {cardNumber}</p>
          <button
            type="button"
            aria-label="Dismiss takeover"
            onClick={() => setBanner(null)}
            className="inline-flex h-8 w-8 items-center justify-center text-white"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
      ) : null}

      <div className="flex h-12 items-center justify-between border-b border-zinc-200 px-3">
        <Link
          href={boardHref}
          aria-label="Close"
          className="inline-flex h-10 w-10 items-center justify-center text-zinc-950"
        >
          <X className="h-5 w-5" aria-hidden />
        </Link>
        <p className="text-sm font-semibold text-zinc-950">
          Card {cardNumber}
          {canScore ? " · You're scoring" : ""}
        </p>
        <button
          type="button"
          aria-label="Card menu"
          aria-expanded={menu}
          onClick={() => setMenu((open) => !open)}
          className="inline-flex h-10 w-10 items-center justify-center text-lg tracking-widest text-zinc-950"
        >
          ···
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

      <div className="flex-1 px-5 pb-6 pt-6">
        <h1 className="text-center font-display text-4xl tracking-wide text-zinc-950">
          Hole {holeNumber} of {holesPlayed}
        </h1>
        <div className="mt-3 flex items-center justify-center gap-2">
          <span className="rounded-full border border-zinc-300 px-3 py-1 text-xs font-semibold text-zinc-950">
            Par {par}
          </span>
          <span className="rounded-full border border-zinc-300 px-3 py-1 text-xs font-semibold text-zinc-950">
            Stroke index {strokeIndex}
          </span>
        </div>

        <div className="mt-6">
          {players.map((player) => (
            <div key={player.slot} className="border-b border-zinc-200 py-4">
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-semibold text-zinc-950">{player.name}</p>
                <p className="text-sm text-zinc-500">
                  Total {player.total ?? "–"} · {player.toPar}
                </p>
              </div>
              {player.shotChip ? (
                <span className="mt-2 inline-flex rounded-full bg-green-800 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                  {player.shotChip}
                </span>
              ) : null}
              <div
                role="group"
                aria-label={`Gross score for ${player.name}`}
                className="mt-3 flex items-center justify-between gap-3"
              >
                <button
                  type="button"
                  disabled={!canScore || player.strokes <= 1}
                  onClick={() => onStep(player.slot, -1)}
                  style={{ width: hit, height: hit }}
                  className="inline-flex items-center justify-center bg-zinc-950 text-white disabled:opacity-30"
                  aria-label={`Fewer strokes for ${player.name}`}
                >
                  <Minus className="h-6 w-6" aria-hidden />
                </button>
                <span className="flex min-w-16 flex-col items-center">
                  <span className="font-display text-6xl leading-none text-zinc-950 tabular-nums">
                    {player.strokes}
                  </span>
                  <span className="mt-1 text-[11px] font-semibold tracking-[0.16em] text-zinc-950 underline">
                    {player.relation}
                  </span>
                </span>
                <button
                  type="button"
                  disabled={!canScore || player.strokes >= 15}
                  onClick={() => onStep(player.slot, 1)}
                  style={{ width: hit, height: hit }}
                  className="inline-flex items-center justify-center bg-zinc-950 text-white disabled:opacity-30"
                  aria-label={`More strokes for ${player.name}`}
                >
                  <Plus className="h-6 w-6" aria-hidden />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-[repeat(18,minmax(0,1fr))] gap-1">
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
        <ul className="mt-3 space-y-1">
          {lines.map((line) => (
            <li key={line} className="text-sm text-zinc-600">
              {line}
            </li>
          ))}
        </ul>
      </div>

      <div className="sticky bottom-0 border-t border-zinc-200 bg-white px-5 py-3">
        <button
          type="button"
          disabled={!canScore}
          onClick={onNext}
          className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-zinc-950 px-5 text-sm font-semibold text-white disabled:opacity-40"
        >
          {last ? `Save hole ${holeNumber} · review` : `Save hole ${holeNumber} · next`}
        </button>
      </div>
    </div>
  );
}
