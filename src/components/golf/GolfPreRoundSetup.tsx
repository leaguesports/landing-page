"use client";

import {
  formatHoleRangeLabel,
  isValidTeeName,
  teeOptionsFromGolfCourse,
} from "@/lib/golf/pre-round";
import type { GolfCourseCms, GolfHolesPlayed } from "@/types/golf-round";

type GolfPreRoundSetupProps = {
  golfCourse?: GolfCourseCms | null;
  teeName: string;
  onTeeNameChange: (value: string) => void;
  startingHole: number;
  onStartingHoleChange: (value: number) => void;
  holesPlayed: GolfHolesPlayed;
  onHolesPlayedChange: (value: GolfHolesPlayed) => void;
};

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

function chipClass(active: boolean): string {
  return [
    "min-h-12 rounded-2xl border text-sm font-medium transition-colors",
    active
      ? "border-emerald-400/50 bg-emerald-400/15 text-emerald-200"
      : "border-white/10 bg-white/5 text-zinc-300 hover:border-white/20",
  ].join(" ");
}

export function GolfPreRoundSetup({
  golfCourse = null,
  teeName,
  onTeeNameChange,
  startingHole,
  onStartingHoleChange,
  holesPlayed,
  onHolesPlayedChange,
}: GolfPreRoundSetupProps) {
  const tees = teeOptionsFromGolfCourse(golfCourse);
  const holeRange = formatHoleRangeLabel(holesPlayed, startingHole);
  const teeReady = isValidTeeName(teeName);

  return (
    <>
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-zinc-200">Tee</h2>
        {tees.length > 0 ? (
          <div className="flex flex-wrap gap-2" role="group" aria-label="Tee">
            {tees.map((tee) => {
              const active = teeName === tee.name;
              return (
                <button
                  key={tee.name}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onTeeNameChange(tee.name)}
                  className={[
                    "inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors",
                    active
                      ? "border-emerald-400/50 bg-emerald-400/15 text-emerald-200"
                      : "border-white/10 bg-white/5 text-zinc-300 hover:border-white/20",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "h-2.5 w-2.5 shrink-0 rounded-full",
                      teeSwatchClass(tee.color ?? tee.name),
                    ].join(" ")}
                    aria-hidden
                  />
                  {tee.name}
                </button>
              );
            })}
          </div>
        ) : (
          <label className="block">
            <span className="sr-only">Tee name</span>
            <input
              type="text"
              value={teeName}
              maxLength={40}
              onChange={(event) => onTeeNameChange(event.target.value)}
              placeholder="e.g. White"
              required
              className="min-h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-emerald-400/40"
            />
          </label>
        )}
        <p className="text-xs text-zinc-500">
          {teeReady
            ? tees.length > 0
              ? `Playing from the ${teeName} tees.`
              : "Required. 1–40 characters."
            : tees.length > 0
              ? "Required. Pick a tee to start."
              : "Required. This course has no listed tees — type a name."}
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-zinc-200">Holes played</h2>
        <div className="grid grid-cols-2 gap-2">
          {([9, 18] as const).map((count) => {
            const active = holesPlayed === count;
            return (
              <button
                key={count}
                type="button"
                aria-pressed={active}
                onClick={() => onHolesPlayedChange(count)}
                className={chipClass(active)}
              >
                {count} holes
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-zinc-200">Starting hole</h2>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              { hole: 1, label: "1 · Front" },
              { hole: 10, label: "10 · Back" },
            ] as const
          ).map((option) => {
            const active = startingHole === option.hole;
            return (
              <button
                key={option.hole}
                type="button"
                aria-pressed={active}
                onClick={() => onStartingHoleChange(option.hole)}
                className={chipClass(active)}
              >
                {option.label}
              </button>
            );
          })}
        </div>
        <label className="block">
          <span className="mb-1 block text-xs text-zinc-500">
            Any hole 1–18
          </span>
          <select
            value={startingHole}
            onChange={(event) =>
              onStartingHoleChange(Number.parseInt(event.target.value, 10))
            }
            className="min-h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none [color-scheme:dark] focus:border-emerald-400/40"
          >
            {Array.from({ length: 18 }, (_, index) => index + 1).map((hole) => (
              <option key={hole} value={hole}>
                Hole {hole}
              </option>
            ))}
          </select>
        </label>
        {holeRange ? (
          <p className="text-xs text-zinc-500">{holeRange}</p>
        ) : null}
      </section>
    </>
  );
}
