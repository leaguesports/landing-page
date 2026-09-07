import type {
  DartsHistoryItem,
  DartsMatch,
  DartsPlayer,
} from "../../types/darts-match.ts";

function firstName(player: Pick<DartsPlayer, "displayName">): string {
  return player.displayName.split(" ")[0] || player.displayName;
}

export function formatDartsHistoryPlayers(
  players: readonly Pick<DartsPlayer, "displayName">[],
): string {
  return players.map(firstName).filter(Boolean).join(" · ") || "—";
}

export function formatDartsHistoryDate(startsAt: string): string {
  if (!startsAt) return "—";
  const parsed = new Date(startsAt);
  if (Number.isNaN(parsed.getTime())) return startsAt;
  return parsed.toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function dartsWinnerName(
  item: Pick<DartsHistoryItem, "players" | "winnerSlot" | "winnerUserId">,
): string | null {
  if (item.winnerSlot) {
    const bySlot = item.players.find((player) => player.slot === item.winnerSlot);
    if (bySlot) return bySlot.displayName;
  }
  if (item.winnerUserId) {
    const byUser = item.players.find(
      (player) => player.userId === item.winnerUserId,
    );
    if (byUser) return byUser.displayName;
  }
  return null;
}

export function formatDartsHistoryScore(
  item: Pick<DartsHistoryItem, "players" | "winnerSlot" | "winnerUserId">,
): string {
  const winner = dartsWinnerName(item);
  return winner ? `${winner} won` : "501";
}

export function dartsPlayerHistoryPath(playerUserId: string): string {
  return `/darts/history?playerUserId=${encodeURIComponent(playerUserId.trim())}`;
}

export function dartsMatchHref(id: string): string {
  return `/darts/${encodeURIComponent(id.trim())}`;
}

export function dartsMatchWinnerName(match: DartsMatch): string | null {
  return dartsWinnerName(match);
}
