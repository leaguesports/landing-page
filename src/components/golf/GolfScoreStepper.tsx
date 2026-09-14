import { Minus, Plus } from "lucide-react";
import { GolfStrokeDots } from "@/components/golf/GolfHandicapBanners";
import { GOLF_SCORE_STEPPER_HIT_PX } from "@/lib/golf/live-hole-ui";

type GolfScoreStepperProps = {
  value: number;
  playerName: string;
  disabled?: boolean;
  min?: number;
  max?: number;
  strokesReceived?: number;
  onDecrease: () => void;
  onIncrease: () => void;
};

function stepperButtonClass(kind: "minus" | "plus"): string {
  const base =
    "inline-flex shrink-0 touch-manipulation items-center justify-center rounded-full disabled:opacity-30";
  if (kind === "plus") return `${base} bg-emerald-400 text-zinc-950`;
  return `${base} border border-white/15 bg-white/5 text-white`;
}

export function GolfScoreStepper({
  value,
  playerName,
  disabled = false,
  min = 1,
  max = 15,
  strokesReceived = 0,
  onDecrease,
  onIncrease,
}: GolfScoreStepperProps) {
  const hit = GOLF_SCORE_STEPPER_HIT_PX;
  return (
    <div
      role="group"
      aria-label={`Gross score for ${playerName}`}
      className="flex select-none items-center justify-center gap-3"
    >
      <button
        type="button"
        disabled={disabled || value <= min}
        onClick={onDecrease}
        style={{ minHeight: hit, minWidth: hit }}
        className={stepperButtonClass("minus")}
        aria-label={`Fewer strokes for ${playerName}`}
      >
        <Minus className="h-5 w-5" aria-hidden />
      </button>
      <span className="flex min-w-[3.25rem] flex-col items-center">
        <span
          aria-live="polite"
          className="text-center font-display text-5xl leading-none tabular-nums text-white"
        >
          {value}
        </span>
        <GolfStrokeDots count={strokesReceived} />
      </span>
      <button
        type="button"
        disabled={disabled || value >= max}
        onClick={onIncrease}
        style={{ minHeight: hit, minWidth: hit }}
        className={stepperButtonClass("plus")}
        aria-label={`More strokes for ${playerName}`}
      >
        <Plus className="h-5 w-5" aria-hidden />
      </button>
    </div>
  );
}
