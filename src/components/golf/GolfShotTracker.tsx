"use client";

import { Crosshair, Loader2, Plus, Undo2 } from "lucide-react";
import { useState } from "react";
import {
  appendShot,
  formatShotMeters,
  measuredShotCount,
  playerShots,
  remainingHoleMeters,
  removeLastShot,
  requestHighAccuracyPosition,
  shotFromGpsMark,
  shotFromManualMeters,
  totalShotMeters,
} from "@/lib/golf/shots";
import type {
  GolfLiveShots,
  GolfPlayerSlot,
  GolfShot,
} from "@/types/golf-round";

type GolfShotTrackerProps = {
  playerName: string;
  slot: GolfPlayerSlot;
  holeNumber: number;
  holeMeters: number | null;
  locked: boolean;
  shots: GolfLiveShots;
  onChange: (next: GolfLiveShots) => void;
};

function shotLabel(shot: GolfShot, index: number): string {
  if (shot.meters == null) {
    return index === 0 ? "Tee / start" : "GPS mark";
  }
  return formatShotMeters(shot.meters);
}

function shotKindLabel(shot: GolfShot): string {
  if (shot.kind === "gps") {
    if (typeof shot.accuracyMeters === "number" && shot.accuracyMeters >= 25) {
      return `GPS ±${shot.accuracyMeters} m`;
    }
    return "GPS";
  }
  return "Typed";
}

export function GolfShotTracker({
  playerName,
  slot,
  holeNumber,
  holeMeters,
  locked,
  shots,
  onChange,
}: GolfShotTrackerProps) {
  const list = playerShots(shots, holeNumber, slot);
  const [gpsBusy, setGpsBusy] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [manualValue, setManualValue] = useState("");

  const carries = measuredShotCount(list);
  const total = totalShotMeters(list);
  const remaining = remainingHoleMeters(holeMeters, list);

  async function markLie() {
    if (locked) return;
    setGpsBusy(true);
    setGpsError(null);
    try {
      const coords = await requestHighAccuracyPosition();
      const previous = list[list.length - 1] ?? null;
      onChange(
        appendShot(
          shots,
          holeNumber,
          slot,
          shotFromGpsMark(previous, coords),
        ),
      );
    } catch (err) {
      setGpsError(
        err instanceof Error ? err.message : "Could not read GPS",
      );
    } finally {
      setGpsBusy(false);
    }
  }

  function addManual() {
    if (locked) return;
    const parsed = Number(manualValue);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setGpsError("Enter a distance in metres");
      return;
    }
    onChange(
      appendShot(shots, holeNumber, slot, shotFromManualMeters(parsed)),
    );
    setManualValue("");
    setAdding(false);
    setGpsError(null);
  }

  function undoLast() {
    if (locked) return;
    onChange(removeLastShot(shots, holeNumber, slot));
    setGpsError(null);
  }

  return (
    <div className="mt-3 border-t border-white/8 pt-3">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
          Shots
        </p>
        <p className="text-[11px] tabular-nums text-zinc-500">
          {list.length === 0
            ? "Optional"
            : carries > 0
              ? `${carries} ${carries === 1 ? "carry" : "carries"} · ${formatShotMeters(total)}`
              : "Start marked"}
        </p>
      </div>

      {list.length > 0 ? (
        <ol className="mt-2 space-y-1">
          {list.map((shot, index) => (
            <li
              key={shot.id}
              className="flex items-center justify-between gap-2 text-xs text-zinc-300"
            >
              <span className="tabular-nums text-zinc-500">{shot.sequence}.</span>
              <span className="min-w-0 flex-1 truncate">{shotLabel(shot, index)}</span>
              <span className="shrink-0 text-[11px] text-zinc-500">
                {shotKindLabel(shot)}
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-1.5 text-[11px] leading-relaxed text-zinc-600">
          Mark each lie to log carry. Phone GPS is approximate — skip putts or
          type metres.
        </p>
      )}

      {remaining != null && list.length > 0 ? (
        <p className="mt-2 text-[11px] tabular-nums text-zinc-400">
          {remaining >= 0
            ? `About ${remaining} m remaining of ${holeMeters} m`
            : `${Math.abs(remaining)} m past the ${holeMeters} m hole`}
        </p>
      ) : null}

      {gpsError ? (
        <p className="mt-2 text-[11px] text-red-400">{gpsError}</p>
      ) : null}

      {locked ? null : (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={gpsBusy}
            onClick={() => void markLie()}
            className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 text-[12px] font-medium text-white disabled:opacity-50"
            aria-label={`Mark GPS lie for ${playerName}`}
          >
            {gpsBusy ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
            ) : (
              <Crosshair className="h-3.5 w-3.5" aria-hidden />
            )}
            {gpsBusy ? "Locating…" : list.length === 0 ? "Mark tee" : "Mark lie"}
          </button>
          {adding ? (
            <form
              className="flex min-h-9 items-center gap-1.5"
              onSubmit={(event) => {
                event.preventDefault();
                addManual();
              }}
            >
              <label className="sr-only" htmlFor={`shot-m-${holeNumber}-${slot}`}>
                Distance in metres for {playerName}
              </label>
              <input
                id={`shot-m-${holeNumber}-${slot}`}
                type="number"
                inputMode="numeric"
                min={1}
                max={600}
                value={manualValue}
                onChange={(event) => setManualValue(event.target.value)}
                placeholder="m"
                className="h-9 w-16 rounded-full border border-white/15 bg-[#0c0e0c] px-3 text-center text-xs tabular-nums text-white outline-none placeholder:text-zinc-600 focus:border-emerald-400/60"
              />
              <button
                type="submit"
                className="inline-flex h-9 items-center rounded-full bg-emerald-400 px-3 text-[12px] font-semibold text-zinc-950"
              >
                Add
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => {
                setAdding(true);
                setGpsError(null);
              }}
              className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 text-[12px] font-medium text-white"
              aria-label={`Type shot distance for ${playerName}`}
            >
              <Plus className="h-3.5 w-3.5" aria-hidden />
              Add metres
            </button>
          )}
          {list.length > 0 ? (
            <button
              type="button"
              onClick={undoLast}
              className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-full px-2 text-[12px] font-medium text-zinc-400 hover:text-white"
              aria-label={`Undo last shot for ${playerName}`}
            >
              <Undo2 className="h-3.5 w-3.5" aria-hidden />
              Undo
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}
