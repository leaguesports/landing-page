"use client";

import { useMemo, useState } from "react";
import {
  formatGolfHandicapIndex,
  golfGrossOnlyBanner,
  golfGrossOnlyReasons,
  parseGolfHandicapIndex,
  teeRatingsAreComplete,
  type GolfTeeRatings,
} from "@/lib/golf/handicap";

type GolfPreRoundHandicapProps = {
  profileHi: number | null;
  signedIn: boolean;
  ratings: GolfTeeRatings;
  roundHi: number | null;
  onRoundHiChange: (value: number | null) => void;
};

export function GolfPreRoundHandicap({
  profileHi,
  signedIn,
  ratings,
  roundHi,
  onRoundHiChange,
}: GolfPreRoundHandicapProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(() => formatGolfHandicapIndex(roundHi));
  const parsed = parseGolfHandicapIndex(draft);
  const ratingsReady = teeRatingsAreComplete(ratings);
  const banner = useMemo(
    () =>
      golfGrossOnlyBanner(
        golfGrossOnlyReasons({
          signedIn,
          isGuest: !signedIn,
          handicapIndex: roundHi,
          ratings,
        }),
      ),
    [signedIn, roundHi, ratings],
  );

  function applyDraft() {
    if (!parsed.ok) return;
    onRoundHiChange(parsed.value);
    setEditing(false);
  }

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-zinc-200">Handicap</h2>
      {!signedIn ? (
        <p className="rounded-2xl border border-white/8 bg-[#141814] px-4 py-3 text-sm text-zinc-400">
          Sign in and add a handicap index to snapshot a course handicap.
          Guests stay gross-only.
        </p>
      ) : (
        <div className="rounded-2xl border border-white/8 bg-[#141814] px-4 py-3">
          <p className="text-sm text-white">
            Your HI{" "}
            <span className="font-display text-xl tabular-nums">
              {roundHi == null ? "—" : formatGolfHandicapIndex(roundHi)}
            </span>
            {profileHi != null && roundHi !== profileHi ? (
              <span className="ml-2 text-xs text-amber-200">
                Changed for this round
              </span>
            ) : null}
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            Snapshotted when the round starts. Changing your profile later
            will not recalculate this card.
          </p>
          {editing ? (
            <div className="mt-3 space-y-2">
              <label className="block">
                <span className="mb-1 block text-xs text-zinc-500">
                  Handicap for this round
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="e.g. 12.4"
                  className="min-h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-emerald-400/40"
                />
              </label>
              {!parsed.ok ? (
                <p className="text-xs text-amber-200">{parsed.error}</p>
              ) : null}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={!parsed.ok}
                  onClick={applyDraft}
                  className="inline-flex min-h-10 items-center rounded-full bg-emerald-400 px-4 text-sm font-semibold text-zinc-950 disabled:opacity-40"
                >
                  Use for this round
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onRoundHiChange(profileHi);
                    setDraft(formatGolfHandicapIndex(profileHi));
                    setEditing(false);
                  }}
                  className="inline-flex min-h-10 items-center rounded-full border border-white/15 px-4 text-sm text-zinc-300"
                >
                  Reset
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setDraft(formatGolfHandicapIndex(roundHi));
                setEditing(true);
              }}
              className="mt-3 text-sm font-medium text-emerald-300 hover:text-emerald-200"
            >
              Change for this round
            </button>
          )}
        </div>
      )}
      {ratingsReady ? (
        <p className="text-xs text-zinc-500">
          Tee ratings ready: CR {ratings.courseRating} · Slope{" "}
          {ratings.slopeRating}
          {ratings.teePar != null ? ` · Par ${ratings.teePar}` : ""}.
        </p>
      ) : null}
      {banner ? (
        <p
          role="status"
          className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100"
        >
          {banner}
        </p>
      ) : null}
    </section>
  );
}
