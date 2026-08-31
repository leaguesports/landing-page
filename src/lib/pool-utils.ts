import type {
  PoolScoringRule,
  PoolUiState,
  PoolView,
  PredictionFormState,
  PredictionType,
  PredictionView,
} from "@/types/pool";

export function getPoolUiState(pool: PoolView): PoolUiState {
  if (pool.fixture.status === "FINISHED") {
    return "results";
  }
  if (pool.predictionsOpen) {
    return "open";
  }
  return "locked";
}

function getSiteBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "https://leaguesports.co.za";
}

export function getShareUrl(inviteCode: string): string {
  return `${getSiteBaseUrl()}/pools/join/${inviteCode}`;
}

export function getWhatsAppShareUrl(inviteCode: string): string {
  const shareUrl = getShareUrl(inviteCode);
  const text = `Join my prediction pool: ${shareUrl}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function formatMatchDateTime(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const PREDICTION_TYPE_LABELS: Record<PredictionType, string> = {
  EXACT_SCORE: "Exact score",
  TOTAL_SCORE: "Total points",
  MARGIN: "Win by margin",
};

export function getPredictionTypeLabel(type: PredictionType): string {
  return PREDICTION_TYPE_LABELS[type];
}

export const SCORING_RULES: Record<
  PoolScoringRule,
  { label: string; description: string }
> = {
  EXACT_SCORE_THREE_CORRECT_RESULT_ONE: {
    label: "Standard (3 pts exact + 1 pt result)",
    description:
      "Exact score: 3 pts for exact home + away, 1 pt for correct winner/draw. Total score: 3 pts for exact total, 1 pt within 6 points. Margin: 3 pts for correct winner + exact margin, 1 pt for correct winner only.",
  },
  CORRECT_RESULT_ONLY: {
    label: "Correct result only (1 pt)",
    description:
      "1 point for correct outcome (exact total, or correct winner/margin side). 0 otherwise.",
  },
};

export function findCurrentMember(
  pool: PoolView,
  memberId: string | null,
): PoolView["members"][number] | null {
  if (!memberId) {
    return null;
  }
  return pool.members.find((m) => m.id === memberId) ?? null;
}

export function parseNonNegativeInt(value: string): number | null {
  if (value.trim() === "") {
    return null;
  }
  const num = Number(value);
  if (!Number.isInteger(num) || num < 0) {
    return null;
  }
  return num;
}

export function formatPredictionDisplay(
  prediction: PredictionView | null,
  options?: { hidden?: boolean },
): string {
  if (!prediction) {
    return "No prediction";
  }
  if (options?.hidden || prediction.summary === null) {
    return "🔒 Prediction hidden";
  }
  return prediction.summary;
}

export function predictionToFormState(
  prediction: PredictionView,
): PredictionFormState | null {
  switch (prediction.predictionType) {
    case "EXACT_SCORE":
      if (
        prediction.predictedHomeScore === null ||
        prediction.predictedAwayScore === null
      ) {
        return null;
      }
      return {
        type: "EXACT_SCORE",
        home: prediction.predictedHomeScore,
        away: prediction.predictedAwayScore,
      };
    case "TOTAL_SCORE":
      if (prediction.predictedTotalScore === null) {
        return null;
      }
      return {
        type: "TOTAL_SCORE",
        total: prediction.predictedTotalScore,
      };
    case "MARGIN":
      if (!prediction.predictedWinnerSide) {
        return null;
      }
      return {
        type: "MARGIN",
        side: prediction.predictedWinnerSide,
        margin:
          prediction.predictedWinnerSide === "DRAW"
            ? undefined
            : (prediction.predictedMargin ?? 0),
      };
  }
}
