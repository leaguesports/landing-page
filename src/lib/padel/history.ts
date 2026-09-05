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

function playerOnTeam(
  players: HistoryPlayer[] | undefined,
  userId: string,
): boolean {
  const id = userId.trim();
  if (!id || !players?.length) return false;
  return players.some((player) => player.userId === id);
}

/** Which pair the named account played on, if they were bound into the match. */
export function playerTeam(
  item: PadelHistoryItem,
  playerUserId: string,
): "A" | "B" | null {
  if (playerOnTeam(item.pairings.teamA, playerUserId)) return "A";
  if (playerOnTeam(item.pairings.teamB, playerUserId)) return "B";
  return null;
}

export function didPlayerWin(
  item: PadelHistoryItem,
  playerUserId: string,
): boolean | null {
  const side = playerTeam(item, playerUserId);
  if (!side || (item.winner !== "A" && item.winner !== "B")) return null;
  return item.winner === side;
}

export type FormResult = "W" | "L";

export type PlayerHistoryStats = {
  locked: number;
  wins: number;
  losses: number;
  winRate: number;
  /** Newest-first decided results, capped (default 5). */
  recentForm: FormResult[];
};

/** Newest-first W/L from locked matches where the account’s result is known. */
export function playerRecentForm(
  items: PadelHistoryItem[],
  playerUserId: string,
  limit = 5,
): FormResult[] {
  const form: FormResult[] = [];
  for (const item of items) {
    if (form.length >= limit) break;
    const won = didPlayerWin(item, playerUserId);
    if (won === true) form.push("W");
    else if (won === false) form.push("L");
  }
  return form;
}

export function summarisePlayerHistory(
  items: PadelHistoryItem[],
  playerUserId: string,
  formLimit = 5,
): PlayerHistoryStats {
  let wins = 0;
  let losses = 0;
  for (const item of items) {
    const won = didPlayerWin(item, playerUserId);
    if (won === true) wins += 1;
    else if (won === false) losses += 1;
  }
  const decided = wins + losses;
  return {
    locked: items.length,
    wins,
    losses,
    winRate: decided === 0 ? 0 : Math.round((wins / decided) * 100),
    recentForm: playerRecentForm(items, playerUserId, formLimit),
  };
}
