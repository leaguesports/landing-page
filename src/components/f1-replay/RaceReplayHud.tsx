"use client";

import {
  flagStateAt,
  standingsAt,
  type FlagKind,
} from "@/lib/openf1/race-control";
import { F1_REPLAY_SPEEDS, formatReplayClock, type ReplayBootstrap } from "@/lib/openf1/replay";
import { Pause, Play, RotateCcw } from "lucide-react";

const FLAG_CLASS: Record<FlagKind, string> = {
  red: "bg-red-600 text-white",
  sc: "bg-amber-400 text-zinc-950",
  vsc: "bg-amber-300 text-zinc-950",
  "double-yellow": "bg-yellow-300 text-zinc-950",
  yellow: "bg-yellow-400/90 text-zinc-950",
  chequered: "bg-white text-zinc-950",
  hidden: "hidden",
};

export function RaceReplayHud({
  bootstrap,
  playheadMs,
  playing,
  speed,
  follow,
  fill,
  started,
  primed,
  loading,
  error,
  onTogglePlay,
  onSpeed,
  onScrub,
  onFollow,
  onStart,
  onRestart,
}: {
  bootstrap: ReplayBootstrap | null;
  playheadMs: number;
  playing: boolean;
  speed: number;
  follow: number | null;
  fill: number;
  started: boolean;
  primed: boolean;
  loading: boolean;
  error: string | null;
  onTogglePlay: () => void;
  onSpeed: (speed: number) => void;
  onScrub: (ms: number) => void;
  onFollow: (driverNumber: number | null) => void;
  onStart: () => void;
  onRestart: () => void;
}) {
  const windowMs = bootstrap?.window;
  const duration = windowMs?.durationMs ?? 0;
  const startMs = windowMs?.startMs ?? 0;
  const elapsed = Math.max(0, playheadMs - startMs);
  const ratio = duration > 0 ? Math.min(1, elapsed / duration) : 0;
  const flag = bootstrap
    ? flagStateAt(bootstrap.raceControl, playheadMs)
    : { kind: "hidden" as const, label: "", sectors: [] };
  const standings = bootstrap
    ? standingsAt(bootstrap.positions, playheadMs, bootstrap.drivers)
    : [];

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-3 sm:p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="pointer-events-auto max-w-[min(100%,20rem)] rounded-2xl border border-white/10 bg-[#0c0f0c]/80 px-3 py-2.5 backdrop-blur-md sm:px-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-brand)]">
            Race replay
          </p>
          <p className="font-display text-xl tracking-wide text-white sm:text-2xl">
            {bootstrap?.config.title ?? "Loading"}
          </p>
          <p className="mt-0.5 font-mono text-xs text-zinc-400">
            {formatReplayClock(elapsed)}
            <span className="text-zinc-600"> / {formatReplayClock(duration)}</span>
          </p>
        </div>

        <ol className="pointer-events-auto hidden max-h-[46vh] w-52 overflow-y-auto rounded-2xl border border-white/10 bg-[#0c0f0c]/80 py-2 backdrop-blur-md sm:block">
          {standings.map((row) => {
            const active = follow === row.driverNumber;
            return (
              <li key={row.driverNumber}>
                <button
                  type="button"
                  onClick={() =>
                    onFollow(active ? null : row.driverNumber)
                  }
                  className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs transition-colors ${
                    active ? "bg-white/10 text-white" : "text-zinc-300 hover:bg-white/5"
                  }`}
                >
                  <span className="w-5 font-mono text-[11px] text-zinc-500">
                    {row.position}
                  </span>
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: row.teamColour }}
                    aria-hidden
                  />
                  <span className="font-semibold tracking-wide">{row.acronym}</span>
                  <span className="ml-auto font-mono text-[10px] text-zinc-500">
                    {row.driverNumber}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      {flag.kind !== "hidden" ? (
        <div className="pointer-events-none absolute left-1/2 top-4 z-20 -translate-x-1/2 sm:top-5">
          <div
            className={`rounded-full px-4 py-1.5 text-center text-[11px] font-semibold uppercase tracking-[0.16em] shadow-lg ${FLAG_CLASS[flag.kind]}`}
          >
            {flag.label}
          </div>
        </div>
      ) : null}

      <div className="pointer-events-auto rounded-2xl border border-white/10 bg-[#0c0f0c]/85 px-3 py-3 backdrop-blur-md sm:px-4">
        <div className="relative mb-3 h-2">
          <input
            type="range"
            min={0}
            max={1000}
            value={Math.round(ratio * 1000)}
            aria-label="Race timeline"
            disabled={!bootstrap}
            onChange={(event) => {
              const next = Number(event.target.value) / 1000;
              onScrub(startMs + next * duration);
            }}
            className="absolute inset-0 z-10 h-2 w-full cursor-pointer appearance-none bg-transparent"
          />
          <div className="absolute inset-y-0 left-0 right-0 top-1/2 h-1 -translate-y-1/2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full bg-[var(--color-brand)]"
              style={{ width: `${ratio * 100}%` }}
            />
          </div>
          {bootstrap?.scrubMarks.map((mark) => {
            const left =
              duration > 0
                ? ((mark.t - startMs) / duration) * 100
                : 0;
            const color =
              mark.kind === "red"
                ? "bg-red-500"
                : mark.kind === "sc" || mark.kind === "vsc"
                  ? "bg-amber-300"
                  : mark.kind === "chequered"
                    ? "bg-white"
                    : "bg-yellow-300";
            return (
              <span
                key={`${mark.kind}-${mark.t}`}
                className={`pointer-events-none absolute top-0 z-20 h-2 w-0.5 ${color}`}
                style={{ left: `${Math.min(100, Math.max(0, left))}%` }}
              />
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onTogglePlay}
            disabled={!started}
            className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[var(--color-brand)] px-4 text-sm font-semibold text-zinc-950 disabled:opacity-40"
          >
            {playing ? (
              <Pause className="h-4 w-4" aria-hidden />
            ) : (
              <Play className="h-4 w-4" aria-hidden />
            )}
            {playing ? "Pause" : "Play"}
          </button>
          <button
            type="button"
            onClick={onRestart}
            disabled={!started}
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/12 px-3 text-sm text-white hover:bg-white hover:text-zinc-950"
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            Restart
          </button>
          <div className="flex flex-wrap gap-1">
            {F1_REPLAY_SPEEDS.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => onSpeed(value)}
                className={`min-h-10 rounded-full px-2.5 text-xs font-semibold ${
                  speed === value
                    ? "bg-white text-zinc-950"
                    : "border border-white/12 text-zinc-300 hover:bg-white/10"
                }`}
              >
                {value}×
              </button>
            ))}
          </div>
          <p className="ml-auto text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-500">
            Buffer {Math.round(fill * 100)}%
          </p>
        </div>
      </div>

      {!started ? (
        <div className="pointer-events-auto absolute inset-0 flex items-center justify-center bg-[#0c0f0c]/70 backdrop-blur-sm">
          <div className="mx-4 max-w-md rounded-2xl border border-white/10 bg-[#141814] px-6 py-8 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-brand)]">
              Lights out
            </p>
            <h2 className="font-display mt-2 text-4xl tracking-wide text-white">
              {bootstrap?.config.title ?? "Race replay"}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">
              3D replay from session telemetry. Cars, flags, and order load
              through LeagueSports — not the OpenF1 client.
            </p>
            {error ? (
              <p className="mt-4 text-sm text-red-300">{error}</p>
            ) : null}
            <button
              type="button"
              onClick={onStart}
              disabled={loading || !primed || !bootstrap}
              className="mt-6 inline-flex min-h-11 min-w-40 items-center justify-center rounded-full bg-[var(--color-brand)] px-6 text-sm font-semibold text-zinc-950 disabled:opacity-40"
            >
              {loading || !primed ? "Loading session…" : "Start replay"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
