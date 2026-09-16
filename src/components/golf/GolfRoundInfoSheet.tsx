"use client";

import { X } from "lucide-react";
import { useEffect } from "react";
import { GolfHandicapDisclaimer } from "@/components/golf/GolfHandicapBanners";
import {
  formatHoleProgress,
  formatRoundInfoPlayerHcp,
  formatRoundInfoRatings,
} from "@/lib/golf/live-hole-ui";
import { golfLayoutLabel } from "@/lib/golf/locked-scorecard";
import type {
  GolfPlayer,
  GolfRound,
  ScorecardTeeDistance,
} from "@/types/golf-round";

function teeSwatchClass(colorOrName: string | null): string {
  const key = (colorOrName ?? "").trim().toLowerCase();
  if (key === "yellow" || key === "gold") return "bg-yellow-400";
  if (key === "white") return "bg-white";
  if (key === "blue") return "bg-sky-400";
  if (key === "red") return "bg-red-500";
  if (key === "black") return "bg-zinc-950 ring-1 ring-white/40";
  if (key === "green") return "bg-emerald-500";
  return "bg-zinc-500";
}

function HoleTeeDistances({ tees }: { tees: ScorecardTeeDistance[] }) {
  if (tees.length === 0) return null;
  return (
    <ul
      className="mt-2 flex flex-wrap items-center gap-1"
      aria-label="Tee distances"
    >
      {tees.map((tee) => (
        <li
          key={tee.teeName}
          aria-current={tee.selected ? "true" : undefined}
          className={[
            "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] tabular-nums",
            tee.selected
              ? "border-emerald-400/50 bg-emerald-400/15 text-emerald-100"
              : "border-white/10 bg-white/5 text-zinc-400",
          ].join(" ")}
        >
          <span
            className={[
              "h-1.5 w-1.5 shrink-0 rounded-full",
              teeSwatchClass(tee.color ?? tee.teeName),
            ].join(" ")}
            aria-hidden
          />
          <span className="font-medium">{tee.teeName}</span>
          <span>{tee.meters} m</span>
        </li>
      ))}
    </ul>
  );
}

export function GolfRoundInfoSheet({
  open,
  onClose,
  round,
  players,
  tees,
  currentHoleIndex,
  holeCount,
}: {
  open: boolean;
  onClose: () => void;
  round: Pick<
    GolfRound,
    | "venue"
    | "course"
    | "teeName"
    | "holesPlayed"
    | "startingHole"
    | "courseRating"
    | "slopeRating"
    | "teePar"
    | "handicapDisclaimer"
  >;
  players: readonly GolfPlayer[];
  tees: ScorecardTeeDistance[];
  currentHoleIndex: number;
  holeCount: number;
}) {
  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const title = "Round info";
  const place = round.venue?.name || round.course.name || null;
  const ratings = formatRoundInfoRatings({
    courseRating: round.courseRating,
    slopeRating: round.slopeRating,
    teePar: round.teePar,
  });
  const playerHcp = players
    .map((player) => ({
      player,
      label: formatRoundInfoPlayerHcp(player),
    }))
    .filter((row) => row.label);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Dismiss round info"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="golf-round-info-title"
        className="relative w-full max-w-md rounded-t-3xl border border-white/10 bg-[#101410] p-6 shadow-2xl sm:rounded-3xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-zinc-400 hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
        <h2
          id="golf-round-info-title"
          className="pr-12 text-lg font-semibold text-white"
        >
          {title}
        </h2>
        <dl className="mt-4 space-y-3 text-sm">
          {place ? (
            <div>
              <dt className="text-[11px] uppercase tracking-[0.14em] text-zinc-500">
                Course
              </dt>
              <dd className="mt-0.5 text-zinc-200">{place}</dd>
            </div>
          ) : null}
          <div>
            <dt className="text-[11px] uppercase tracking-[0.14em] text-zinc-500">
              Layout
            </dt>
            <dd className="mt-0.5 text-zinc-200">{golfLayoutLabel(round)}</dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-[0.14em] text-zinc-500">
              Tee
            </dt>
            <dd className="mt-0.5 text-zinc-200">
              {round.teeName || "Set at round start"}
            </dd>
            <dd className="mt-1 text-[11px] text-zinc-500">
              Tee is chosen at the start of the round.
            </dd>
            <HoleTeeDistances tees={tees} />
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-[0.14em] text-zinc-500">
              Progress
            </dt>
            <dd className="mt-0.5 text-zinc-200">
              {formatHoleProgress(currentHoleIndex, holeCount)}
            </dd>
          </div>
          {ratings ? (
            <div>
              <dt className="text-[11px] uppercase tracking-[0.14em] text-zinc-500">
                Ratings
              </dt>
              <dd className="mt-0.5 tabular-nums text-zinc-200">{ratings}</dd>
            </div>
          ) : null}
          {playerHcp.length > 0 ? (
            <div>
              <dt className="text-[11px] uppercase tracking-[0.14em] text-zinc-500">
                Handicap
              </dt>
              <dd className="mt-1 space-y-1">
                {playerHcp.map(({ player, label }) => (
                  <p key={player.slot} className="text-zinc-300">
                    {players.length > 1 ? (
                      <span className="text-zinc-400">{player.displayName} · </span>
                    ) : null}
                    {label}
                  </p>
                ))}
              </dd>
            </div>
          ) : null}
        </dl>
        <div className="mt-5">
          <GolfHandicapDisclaimer apiDisclaimer={round.handicapDisclaimer} />
        </div>
      </div>
    </div>
  );
}
