"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  adjacentClub,
  clubIndex,
  GOLF_CLUBS,
  recommendClub,
  type GolfClub,
} from "@/lib/golf/clubs";
import {
  buildHoleLayout,
  mapDistanceMeters,
  type Point,
} from "@/lib/golf/hole-layout";
import { HoleMap } from "@/components/golf/HoleMap";
import type { GolfCourseHole } from "@/types/golf-round";

type ShotSimulatorProps = {
  hole: GolfCourseHole;
};

export function ShotSimulator({ hole }: ShotSimulatorProps) {
  const layout = useMemo(
    () =>
      buildHoleLayout({
        holeNumber: hole.number,
        par: hole.par,
        meters: hole.meters,
      }),
    [hole.number, hole.par, hole.meters],
  );

  const [target, setTarget] = useState<Point>(layout.defaultTarget);
  const [clubOverride, setClubOverride] = useState<GolfClub | null>(null);

  useEffect(() => {
    setTarget(layout.defaultTarget);
    setClubOverride(null);
  }, [layout]);

  const shotMeters = mapDistanceMeters(layout, layout.tee, target);
  const remainingMeters = mapDistanceMeters(layout, target, layout.green);
  const suggested = recommendClub(shotMeters);
  const club = clubOverride ?? suggested;
  const clubPos = clubIndex(club.id) + 1;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="relative min-h-[min(62vh,560px)] flex-1 overflow-hidden rounded-2xl border border-white/8 bg-[#0a120c]">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(61,255,138,0.12), transparent 55%), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(30,90,50,0.35), transparent 50%)",
          }}
        />
        <HoleMap
          layout={layout}
          target={target}
          onTargetChange={setTarget}
          shotMeters={shotMeters}
          remainingMeters={remainingMeters}
          holeNumber={hole.number}
          par={hole.par}
          strokeIndex={hole.strokeIndex}
        />
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-[#141814]/95 px-3 py-3 shadow-[0_-8px_40px_rgba(0,0,0,0.35)] backdrop-blur-sm">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setClubOverride(adjacentClub(club.id, -1))}
            disabled={clubPos <= 1}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10 text-emerald-300 disabled:opacity-30"
            aria-label="Previous club"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>

          <div className="min-w-0 flex-1 text-center">
            <p className="font-display text-3xl tracking-wide text-white tabular-nums">
              {club.shortName}{" "}
              <span className="text-emerald-300">
                {Math.round(shotMeters)}m
              </span>
            </p>
            <p className="mt-0.5 text-sm text-zinc-400">
              → {Math.round(remainingMeters)}m to green ←
            </p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-zinc-600">
              {clubPos}/{GOLF_CLUBS.length} clubs
              {clubOverride && club.id !== suggested.id
                ? ` · suggest ${suggested.shortName}`
                : ""}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setClubOverride(adjacentClub(club.id, 1))}
            disabled={clubPos >= GOLF_CLUBS.length}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10 text-emerald-300 disabled:opacity-30"
            aria-label="Next club"
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
        </div>
      </div>

      <p className="mt-3 text-center text-xs text-zinc-500">
        Tap the map to place your landing spot
      </p>
    </div>
  );
}
