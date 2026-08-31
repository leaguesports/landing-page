import type {
  HistoryPairings,
  HistoryPlayer,
  PadelHistoryItem,
} from "../../types/padel-match.ts";

function firstName(player: HistoryPlayer): string {
  return player.displayName.split(" ")[0] || player.displayName;
}

function playerNames(players: HistoryPlayer[]): string {
  return players.map(firstName).filter(Boolean).join(" / ");
}

function isHistoryPairings(
  value: HistoryPlayer[] | HistoryPairings,
): value is HistoryPairings {
  return !Array.isArray(value) && Array.isArray(value.teamA) && Array.isArray(value.teamB);
}

/** Player list: the other pair. Venue list: both teams. */
export function formatHistoryOpponents(
  opponents: HistoryPlayer[] | HistoryPairings,
): string {
  if (isHistoryPairings(opponents)) {
    const a = playerNames(opponents.teamA);
    const b = playerNames(opponents.teamB);
    if (a && b) return `${a} vs ${b}`;
    return a || b || "—";
  }
  return playerNames(opponents) || "—";
}

export function formatHistoryScore(
  score: PadelHistoryItem["score"],
): string {
  if (!score?.sets.length) return "—";
  return score.sets
    .map((set) => {
      const games = `${set.gamesA}–${set.gamesB}`;
      if (set.tieBreak) {
        return `${games} (${set.tieBreak.pointsA}–${set.tieBreak.pointsB})`;
      }
      return games;
    })
    .join(", ");
}

export function formatHistoryDate(startsAt: string): string {
  if (!startsAt) return "—";
  const parsed = new Date(startsAt);
  if (Number.isNaN(parsed.getTime())) return startsAt;
  return parsed.toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function playerHistoryPath(playerUserId: string): string {
  return `/padel/history?playerUserId=${encodeURIComponent(playerUserId.trim())}`;
}
