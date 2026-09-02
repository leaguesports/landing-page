import type {
  GameScore,
  PadelMatch,
  PadelPointAction,
  PadelPointValue,
  PadelTeamId,
  SetScore,
} from "@/types/padel-match";

const POINT_LADDER: PadelPointValue[] = [0, 15, 30, 40];

function nextPoint(current: PadelPointValue): PadelPointValue | "game" {
  const idx = POINT_LADDER.indexOf(current);
  if (idx < 0 || idx >= POINT_LADDER.length - 1) return "game";
  return POINT_LADDER[idx + 1]!;
}

function emptyGame(isTieBreak = false): GameScore {
  return {
    pointsA: 0,
    pointsB: 0,
    advantage: null,
    isTieBreak,
    tieBreakPointsA: 0,
    tieBreakPointsB: 0,
  };
}

function emptySet(): SetScore {
  return { gamesA: 0, gamesB: 0, tieBreak: null, winner: null };
}

function opponent(team: PadelTeamId): PadelTeamId {
  return team === "A" ? "B" : "A";
}

function bumpGames(set: SetScore, team: PadelTeamId): SetScore {
  if (team === "A") return { ...set, gamesA: set.gamesA + 1 };
  return { ...set, gamesB: set.gamesB + 1 };
}

function stamp(match: PadelMatch, patch: Partial<PadelMatch>): PadelMatch {
  return {
    ...match,
    ...patch,
    updatedAt: new Date().toISOString(),
    version: match.version + 1,
  };
}

function finalizeSet(
  match: PadelMatch,
  set: SetScore,
  winner: PadelTeamId,
): PadelMatch {
  const completed: SetScore = { ...set, winner };
  const sets = match.sets.map((s, i) =>
    i === match.currentSetIndex ? completed : s,
  );

  const teamASets = sets.filter((s) => s.winner === "A").length;
  const teamBSets = sets.filter((s) => s.winner === "B").length;

  if (teamASets >= match.setsToWin || teamBSets >= match.setsToWin) {
    return stamp(match, {
      sets,
      game: emptyGame(),
      status: "finalized",
      servingTeam: opponent(match.servingTeam),
    });
  }

  return stamp(match, {
    sets: [...sets, emptySet()],
    currentSetIndex: match.currentSetIndex + 1,
    game: emptyGame(),
    servingTeam: opponent(match.servingTeam),
  });
}

function winGame(match: PadelMatch, team: PadelTeamId): PadelMatch {
  const set = match.sets[match.currentSetIndex] ?? emptySet();
  const updated = bumpGames(set, team);
  const { gamesA, gamesB } = updated;

  // 6–6 → enter tie-break (first to 7 points, win by 2)
  if (gamesA === 6 && gamesB === 6) {
    return stamp(match, {
      sets: match.sets.map((s, i) =>
        i === match.currentSetIndex ? updated : s,
      ),
      game: emptyGame(true),
      servingTeam: opponent(match.servingTeam),
    });
  }

  // Set complete: 6–0 … 6–4, or 7–5
  if (gamesA >= 6 && gamesA - gamesB >= 2) {
    return finalizeSet(match, updated, "A");
  }
  if (gamesB >= 6 && gamesB - gamesA >= 2) {
    return finalizeSet(match, updated, "B");
  }

  return stamp(match, {
    sets: match.sets.map((s, i) =>
      i === match.currentSetIndex ? updated : s,
    ),
    game: emptyGame(),
    servingTeam: opponent(match.servingTeam),
  });
}

function applyTieBreakPoint(
  match: PadelMatch,
  team: PadelTeamId,
): PadelMatch {
  const game = { ...match.game };
  if (team === "A") game.tieBreakPointsA += 1;
  else game.tieBreakPointsB += 1;

  const a = game.tieBreakPointsA;
  const b = game.tieBreakPointsB;

  if ((a >= 7 || b >= 7) && Math.abs(a - b) >= 2) {
    const winner: PadelTeamId = a > b ? "A" : "B";
    const set = match.sets[match.currentSetIndex] ?? emptySet();
    const withGames = bumpGames(set, winner);
    const completed: SetScore = {
      ...withGames,
      tieBreak: { pointsA: a, pointsB: b },
    };
    return finalizeSet(match, completed, winner);
  }

  // Serve alternates every odd total point after the first in classic TB
  const total = a + b;
  const servingTeam =
    total === 0
      ? match.servingTeam
      : total % 2 === 1
        ? opponent(match.servingTeam)
        : match.servingTeam;

  return stamp(match, { game, servingTeam });
}

function applyRegularPoint(match: PadelMatch, team: PadelTeamId): PadelMatch {
  const { ruleset, game } = match;
  const teamPts = team === "A" ? game.pointsA : game.pointsB;
  const otherPts = team === "A" ? game.pointsB : game.pointsA;

  // Both at 40 — deuce / advantage / golden point
  if (teamPts === 40 && otherPts === 40) {
    if (ruleset === "golden_point") {
      return winGame(match, team);
    }

    // Advantage ruleset
    if (game.advantage === null) {
      return stamp(match, {
        game: { ...game, advantage: team },
      });
    }
    if (game.advantage === team) {
      return winGame(match, team);
    }
    // Opponent had ADV → back to deuce
    return stamp(match, {
      game: { ...game, advantage: null },
    });
  }

  // Scoring team already at 40, opponent below → game
  if (teamPts === 40 && otherPts < 40) {
    return winGame(match, team);
  }

  // Normal ladder
  const advanced = nextPoint(teamPts);
  if (advanced === "game") {
    return winGame(match, team);
  }

  const nextGame: GameScore = {
    ...game,
    pointsA: team === "A" ? advanced : game.pointsA,
    pointsB: team === "B" ? advanced : game.pointsB,
    advantage: null,
  };

  return stamp(match, { game: nextGame });
}

/**
 * Pure Padel scoring engine.
 * Pass the current match snapshot + a point/undo action → next snapshot.
 * No I/O, no mutation of the input object graph beyond returned clones.
 */
export function evaluatePadelPoint(
  currentState: PadelMatch,
  action: PadelPointAction,
): PadelMatch {
  if (action.type === "UNDO") {
    return {
      ...action.previous,
      updatedAt: new Date().toISOString(),
      version: currentState.version + 1,
    };
  }

  if (currentState.status === "finalized") {
    return currentState;
  }

  const live: PadelMatch =
    currentState.status === "ready"
      ? { ...currentState, status: "live" }
      : currentState;

  if (live.game.isTieBreak) {
    return applyTieBreakPoint(live, action.team);
  }

  return applyRegularPoint(live, action.team);
}

/** Human-readable game score for Team A / B display. */
export function formatGamePoint(
  match: PadelMatch,
  team: PadelTeamId,
): string {
  const { game, ruleset } = match;

  if (game.isTieBreak) {
    return String(
      team === "A" ? game.tieBreakPointsA : game.tieBreakPointsB,
    );
  }

  const pts = team === "A" ? game.pointsA : game.pointsB;
  const other = team === "A" ? game.pointsB : game.pointsA;

  if (pts === 40 && other === 40) {
    if (ruleset === "golden_point") return "GP";
    if (game.advantage === team) return "ADV";
    if (game.advantage === opponent(team)) return "40";
    return "40";
  }

  return String(pts);
}

export function formatSetHistory(match: PadelMatch): string {
  return match.sets
    .map((set, i) => {
      const label = `Set ${i + 1}: ${set.gamesA}-${set.gamesB}`;
      if (set.tieBreak) {
        return `${label} (${set.tieBreak.pointsA}-${set.tieBreak.pointsB})`;
      }
      return label;
    })
    .join(" | ");
}

export function createInitialPadelMatch(
  input: Omit<
    PadelMatch,
    | "status"
    | "sets"
    | "currentSetIndex"
    | "game"
    | "servingTeam"
    | "setsToWin"
    | "createdAt"
    | "updatedAt"
    | "version"
    | "sport"
  > & {
    servingTeam?: PadelTeamId;
    setsToWin?: number;
  },
): PadelMatch {
  const now = new Date().toISOString();
  return {
    id: input.id,
    sport: "padel",
    status: "ready",
    ruleset: input.ruleset,
    venue: input.venue,
    venueCmsId: input.venueCmsId ?? input.venue?.id ?? null,
    startsAt: input.startsAt ?? now,
    pairings: input.pairings,
    servingTeam: input.servingTeam ?? "A",
    sets: [emptySet()],
    currentSetIndex: 0,
    game: emptyGame(),
    setsToWin: input.setsToWin ?? 2,
    createdAt: now,
    updatedAt: now,
    createdByUserId: input.createdByUserId ?? null,
    version: 1,
  };
}

/** Detect side-effects for Ably event typing after a point. */
export function classifyTransition(
  before: PadelMatch,
  after: PadelMatch,
): "POINT_SCORED" | "SET_COMPLETED" | "MATCH_FINALIZED" {
  if (after.status === "finalized" && before.status !== "finalized") {
    return "MATCH_FINALIZED";
  }
  if (after.currentSetIndex > before.currentSetIndex) {
    return "SET_COMPLETED";
  }
  if (
    after.sets.some((s, i) => s.winner && !before.sets[i]?.winner) &&
    after.status === "finalized"
  ) {
    return "MATCH_FINALIZED";
  }
  if (after.sets.some((s, i) => s.winner && !before.sets[i]?.winner)) {
    return "SET_COMPLETED";
  }
  return "POINT_SCORED";
}

export function getActiveSet(match: PadelMatch): SetScore {
  return match.sets[match.currentSetIndex] ?? emptySet();
}

export function getTeamLabel(
  match: Pick<PadelMatch, "pairings">,
  team: PadelTeamId,
): string {
  const pair =
    team === "A" ? match.pairings.teamA : match.pairings.teamB;
  return pair.map((p) => p.displayName.split(" ")[0] ?? p.displayName).join(" / ");
}
