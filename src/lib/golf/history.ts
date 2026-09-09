import type {
  GolfHistoryItem,
  GolfPlayer,
} from "../../types/golf-round.ts";
import { formatToPar, playerGross, playerToPar, strokesFromScore } from "./scoring.ts";

function firstName(player: GolfPlayer): string {
  return player.displayName.split(" ")[0] || player.displayName;
}

export function formatGolfHistoryPlayers(players: GolfPlayer[]): string {
  return players.map(firstName).filter(Boolean).join(" · ") || "—";
}

export function formatGolfHistoryDate(startsAt: string): string {
  if (!startsAt) return "—";
  const parsed = new Date(startsAt);
  if (Number.isNaN(parsed.getTime())) return startsAt;
  return parsed.toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Compact gross / to-par for the first player (or lowest gross). */
export function formatGolfHistoryScore(item: GolfHistoryItem): string {
  if (!item.score?.holes.length || !item.players.length) return "—";
  const strokes = strokesFromScore(item.score);
  const holes = item.course.holes;
  const totals = item.players.map((player) => ({
    gross: playerGross(strokes, player.slot),
    toPar: playerToPar(strokes, player.slot, holes),
  }));
  const first = item.players[0];
  if (totals.length === 1) {
    if (typeof first?.netTotal === "number") {
      return `${first.grossTotal ?? totals[0].gross} / ${first.netTotal} (${formatToPar(totals[0].toPar)})`;
    }
    return `${totals[0].gross} (${formatToPar(totals[0].toPar)})`;
  }
  return item.players
    .map((player, index) => {
      const gross = player.grossTotal ?? totals[index]?.gross;
      if (typeof player.netTotal === "number") {
        return `${gross}/${player.netTotal}`;
      }
      return String(gross);
    })
    .join(" · ");
}

export function golfPlayerHistoryPath(playerUserId: string): string {
  return `/golf/history?playerUserId=${encodeURIComponent(playerUserId.trim())}`;
}
