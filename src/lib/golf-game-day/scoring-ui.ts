import { courseParTotal, selectHoles } from "../golf/course.ts";
import { strokesReceivedOnHole, teeRatingsFromCms } from "../golf/handicap.ts";
import type { GolfCourseCms } from "../../types/golf-round.ts";
import type {
  BoardTab,
  GameDayCard,
  GameDayLeaderboard,
  QueuedHolePut,
  RankingRow,
} from "../../types/golf-game-day.ts";

/** Minimum +/− hit target on the game day score screen. */
export const GAME_DAY_STEPPER_PX = 64;
export const STROKE_MIN = 1;
export const STROKE_MAX = 15;

export type HoleSyncState = "saved" | "saving" | "offline";

export function stepStroke(value: number, delta: number): number {
  return Math.min(STROKE_MAX, Math.max(STROKE_MIN, value + delta));
}

/** A hole opens on par until a saved or queued score replaces it. */
export function initialHoleStrokes(
  players: readonly { slot: number }[],
  par: number,
  saved?: Record<string, number> | null,
): Record<string, number> {
  const strokes: Record<string, number> = {};
  for (const player of players) {
    const key = String(player.slot);
    const existing = saved?.[key];
    strokes[key] =
      typeof existing === "number" &&
      Number.isInteger(existing) &&
      existing >= STROKE_MIN &&
      existing <= STROKE_MAX
        ? existing
        : par;
  }
  return strokes;
}

export function strokeDotsForPlayer(
  playingHandicap: number | null | undefined,
  holes: readonly { number: number; strokeIndex: number }[],
  holeNumber: number,
): number {
  return strokesReceivedOnHole(playingHandicap, holes, holeNumber);
}

export function holeSyncState(input: {
  holeNumber: number;
  queued: readonly Pick<QueuedHolePut, "holeNumber" | "state">[];
  serverSynced: boolean;
}): HoleSyncState {
  const pending = input.queued.find((item) => item.holeNumber === input.holeNumber);
  if (!pending) return input.serverSynced ? "saved" : "offline";
  if (pending.state === "offline") return "offline";
  return "saving";
}

export function holeSyncLabel(state: HoleSyncState): string {
  if (state === "saved") return "Saved";
  if (state === "saving") return "Saving…";
  return "Offline";
}

export function scoreRelation(strokes: number, par: number): string {
  const diff = strokes - par;
  if (diff <= -3) return "ALBATROSS";
  if (diff === -2) return "EAGLE";
  if (diff === -1) return "BIRDIE";
  if (diff === 0) return "PAR";
  if (diff === 1) return "BOGEY";
  if (diff === 2) return "DOUBLE";
  if (diff === 3) return "TRIPLE";
  return `+${diff}`;
}

export function shotChipLabel(dots: number): string | null {
  if (!Number.isFinite(dots) || dots <= 0) return null;
  return dots === 1 ? "+1 shot" : `+${dots} shots`;
}

/** The strip calls out the latest saved hole and any hole still waiting. */
export function holeStatusLines(
  holes: readonly { number: number; sync: string }[],
): string[] {
  const saved = holes.filter((hole) => hole.sync === "saved");
  const waiting = holes.filter((hole) => hole.sync === "offline" || hole.sync === "saving");
  const lines: string[] = [];
  const lastSaved = saved[saved.length - 1];
  if (lastSaved) lines.push(`Hole ${lastSaved.number} synced`);
  for (const hole of waiting) {
    lines.push(
      hole.sync === "offline"
        ? `Hole ${hole.number} waiting · weak signal`
        : `Hole ${hole.number} waiting`,
    );
  }
  return lines;
}

export function overallSyncLabel(states: readonly HoleSyncState[]): string {
  if (states.some((state) => state === "offline")) return "Offline — will sync";
  if (states.some((state) => state === "saving")) return "Saving…";
  return "Saved";
}

export function formatToPar(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "–";
  if (value === 0) return "E";
  if (value > 0) return `+${value}`;
  return String(value);
}

export function formatHandicap(value: number | null | undefined): string | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return `hcp ${value}`;
}

export function formatBoardScore(
  tab: BoardTab,
  row: Pick<RankingRow, "gross" | "toPar" | "net" | "stableford">,
): { primary: string; suffix: string } {
  if (tab === "stableford") {
    return {
      primary: row.stableford == null ? "–" : String(row.stableford),
      suffix: "pts",
    };
  }
  if (tab === "net") {
    return { primary: row.net == null ? "–" : String(row.net), suffix: "net" };
  }
  return { primary: formatToPar(row.toPar), suffix: row.gross == null ? "" : String(row.gross) };
}

export function winnerHero(
  tab: BoardTab,
  row: Pick<RankingRow, "gross" | "toPar" | "net" | "stableford">,
  holesPlayed: number,
): { score: string; line: string; caption: string } {
  if (tab === "stableford") {
    return {
      score: row.stableford == null ? "–" : String(row.stableford),
      line: "pts",
      caption: `Stableford · ${holesPlayed} holes`,
    };
  }
  if (tab === "net") {
    return {
      score: row.net == null ? "–" : String(row.net),
      line: "net",
      caption: `Net · ${holesPlayed} holes`,
    };
  }
  return {
    score: row.gross == null ? "–" : String(row.gross),
    line: formatToPar(row.toPar),
    caption: `Gross · ${holesPlayed} holes`,
  };
}

export function boardBadge(status: string, access: string): "Live" | "Watching" | "Final" {
  if (status === "final") return "Final";
  if (access === "watch") return "Watching";
  return "Live";
}

export function defaultBoardTab(board: Pick<GameDayLeaderboard, "rankings" | "status">): BoardTab {
  if (board.status === "final") return "gross";
  const hasPoints = board.rankings.stableford.some((row) => row.stableford != null);
  return hasPoints ? "stableford" : "gross";
}

/** Realtime payloads are watch-scoped. Keep the viewer's YOU mark. */
export function mergeLeaderboard(
  current: GameDayLeaderboard | null,
  incoming: GameDayLeaderboard,
  youPlayerId: string | null,
): GameDayLeaderboard {
  if (current && incoming.version < current.version) return current;
  const mark = (rows: RankingRow[]) =>
    rows.map((row) => ({
      ...row,
      you: youPlayerId != null && row.playerId === youPlayerId,
    }));
  const access =
    current && current.access !== "watch" ? current.access : incoming.access;
  return {
    ...incoming,
    access,
    rankings: {
      gross: mark(incoming.rankings.gross),
      net: mark(incoming.rankings.net),
      stableford: mark(incoming.rankings.stableford),
    },
    podium: incoming.podium
      ? {
          gross: mark(incoming.podium.gross),
          net: mark(incoming.podium.net),
          stableford: mark(incoming.podium.stableford),
        }
      : null,
  };
}

export function mergeCard(
  incoming: GameDayCard,
  playerId: string | null,
): GameDayCard {
  return {
    ...incoming,
    scoring: playerId != null && incoming.scorer.playerId === playerId,
    players: incoming.players.map((player) => ({
      ...player,
      you: playerId != null && player.playerId === playerId,
    })),
  };
}

export function movedPlayerIds(before: readonly string[], after: readonly string[]): string[] {
  return after.filter((id, index) => before.includes(id) && before[index] !== id);
}

export function teeChipLabel(tee: { name: string; color?: string | null }): string {
  const color = tee.color?.trim() ?? "";
  if (!color || color.toLowerCase() === tee.name.trim().toLowerCase()) return tee.name;
  return `${tee.name} · ${color}`;
}

export function preferredDefaultTee(
  tees: readonly { name: string; color?: string | null }[],
): string {
  const white = tees.find(
    (tee) =>
      tee.color?.trim().toLowerCase() === "white" ||
      tee.name.trim().toLowerCase() === "white",
  );
  return white?.name ?? tees[0]?.name ?? "White";
}

export function gameDayCardStartBody(input: {
  course: GolfCourseCms;
  teeOptions: readonly string[];
  playerTee: string;
  holesPlayed?: 9 | 18;
  startingHole?: number;
}): {
  holesPlayed: 9 | 18;
  startingHole: number;
  course: {
    name: string | null;
    holes: Array<{ number: number; par: number; strokeIndex: number }>;
  };
  tees: Array<{
    name: string;
    courseRating: number | null;
    slopeRating: number | null;
    teePar: number | null;
  }>;
} | null {
  const holesPlayed = input.holesPlayed ?? 18;
  const startingHole = input.startingHole ?? 1;
  const holes = selectHoles(input.course, holesPlayed, startingHole);
  if (holes.length !== holesPlayed) return null;
  const par = courseParTotal(holes);
  const names = [...input.teeOptions];
  if (!names.some((name) => name.toLowerCase() === input.playerTee.trim().toLowerCase())) {
    names.push(input.playerTee);
  }
  return {
    holesPlayed,
    startingHole,
    course: {
      name: input.course.courseName?.trim() || null,
      holes,
    },
    tees: names.map((name) => {
      const ratings = teeRatingsFromCms(input.course, name, par);
      return {
        name,
        courseRating: ratings.courseRating ?? null,
        slopeRating: ratings.slopeRating ?? null,
        teePar: ratings.teePar ?? par,
      };
    }),
  };
}

export function resultShareText(input: {
  name: string;
  headline: string;
  score: string;
  line: string;
}): string {
  return `${input.name} won ${input.headline} — ${input.score} (${input.line})`;
}

export function holesStillOpen(
  holeNumbers: readonly number[],
  saved: readonly number[],
  queued: readonly number[],
): number[] {
  const done = new Set([...saved, ...queued]);
  return holeNumbers.filter((number) => !done.has(number));
}

export function grossForSlot(
  holes: readonly { strokes: Record<string, number> }[],
  slot: number,
): number {
  const key = String(slot);
  return holes.reduce((sum, hole) => sum + (hole.strokes[key] ?? 0), 0);
}
