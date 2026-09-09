import {
  GOLF_HANDICAP_UI_DISCLAIMER,
  anyPlayerHasPlayingHandicap,
  roundGrossOnlyBanner,
} from "@/lib/golf/handicap";
import type { GolfPlayer, GolfRound } from "@/types/golf-round";

export function GolfHandicapDisclaimer({
  apiDisclaimer,
}: {
  apiDisclaimer?: string | null;
}) {
  return (
    <p className="text-[11px] leading-relaxed text-zinc-500">
      {GOLF_HANDICAP_UI_DISCLAIMER}
      {apiDisclaimer && apiDisclaimer !== GOLF_HANDICAP_UI_DISCLAIMER
        ? `. ${apiDisclaimer}`
        : "."}
    </p>
  );
}

export function GolfRoundHandicapBanner({
  round,
  players,
}: {
  round: Pick<
    GolfRound,
    "courseRating" | "slopeRating" | "teePar" | "handicapDisclaimer"
  >;
  players: readonly GolfPlayer[];
}) {
  const hasPh = anyPlayerHasPlayingHandicap(players);
  const banner = roundGrossOnlyBanner({
    players,
    ratings: {
      courseRating: round.courseRating,
      slopeRating: round.slopeRating,
      teePar: round.teePar,
    },
  });

  return (
    <div className="space-y-2">
      {hasPh ? (
        <GolfHandicapDisclaimer apiDisclaimer={round.handicapDisclaimer} />
      ) : banner ? (
        <p
          role="status"
          className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100"
        >
          {banner}
        </p>
      ) : (
        <GolfHandicapDisclaimer apiDisclaimer={round.handicapDisclaimer} />
      )}
    </div>
  );
}

export function GolfStrokeDots({
  count,
  label,
}: {
  count: number;
  label?: string;
}) {
  if (count === 0) return null;
  const n = Math.min(6, Math.abs(count));
  const plus = count < 0;
  return (
    <span
      className="mt-0.5 flex items-center justify-center gap-0.5"
      aria-label={
        label ??
        (plus
          ? `${n} plus-handicap stroke${n === 1 ? "" : "s"}`
          : `${n} stroke${n === 1 ? "" : "s"} received`)
      }
    >
      {Array.from({ length: n }, (_, index) => (
        <span
          key={index}
          className={[
            "h-1.5 w-1.5 rounded-full",
            plus ? "bg-amber-300" : "bg-emerald-300",
          ].join(" ")}
          aria-hidden
        />
      ))}
    </span>
  );
}
