import type {
  GolfCourseHole,
  GolfHoleScore,
  GolfLiveStrokes,
  GolfPlayer,
  GolfPlayerSlot,
  GolfRound,
} from "../../types/golf-round.ts";
import {
  playerHasPlayingHandicap,
  resolveHoleNet,
} from "./handicap.ts";
import { formatHoleRangeLabel } from "./pre-round.ts";
import { formatToPar, playerGross, playerToPar } from "./scoring.ts";

export type GolfScoreRel = "eagle" | "birdie" | "par" | "bogey" | "double";

export type GolfScorecardColumnKind = "hole" | "out" | "in" | "tot";

export type GolfScorecardColumn = {
  kind: GolfScorecardColumnKind;
  key: string;
  label: string;
  holeIndexes: number[];
  hole?: GolfCourseHole;
};

export type GolfScorecardCell = {
  display: string;
  strokes: number | null;
  net: number | null;
  strokesReceived: number;
  toPar: number | null;
  rel: GolfScoreRel | null;
};

export type GolfScorecardPlayerRow = {
  slot: GolfPlayerSlot;
  displayName: string;
  cells: GolfScorecardCell[];
  gross: number;
  net: number | null;
  courseHandicap: number | null;
  playingHandicap: number | null;
  toPar: number;
  isLeader: boolean;
};

export type GolfLockedScorecardModel = {
  columns: GolfScorecardColumn[];
  parRow: GolfScorecardCell[];
  siRow: GolfScorecardCell[];
  players: GolfScorecardPlayerRow[];
};

function slotKey(slot: GolfPlayerSlot | number): string {
  return String(slot);
}

function holeStrokes(
  strokes: GolfLiveStrokes,
  holeNumber: number,
  slot: GolfPlayerSlot,
): number | null {
  const value = strokes[holeNumber]?.[slotKey(slot)];
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return value;
}

export function scoreRel(strokes: number, par: number): GolfScoreRel {
  const delta = strokes - par;
  if (delta <= -2) return "eagle";
  if (delta === -1) return "birdie";
  if (delta === 0) return "par";
  if (delta === 1) return "bogey";
  return "double";
}

function holeColumn(hole: GolfCourseHole, index: number): GolfScorecardColumn {
  return {
    kind: "hole",
    key: `h-${hole.number}-${index}`,
    label: String(hole.number),
    holeIndexes: [index],
    hole,
  };
}

function summaryColumn(
  kind: "out" | "in" | "tot",
  holeIndexes: number[],
): GolfScorecardColumn {
  return {
    kind,
    key: kind,
    label: kind === "out" ? "Out" : kind === "in" ? "In" : "Tot",
    holeIndexes,
  };
}

/** Traditional scorecard columns: holes plus Out/In/Tot when 18 are played. */
export function golfScorecardColumns(
  holes: GolfCourseHole[],
): GolfScorecardColumn[] {
  if (holes.length === 18) {
    const frontIdx = holes.slice(0, 9).map((_, index) => index);
    const backIdx = holes.slice(9, 18).map((_, index) => index + 9);
    return [
      ...holes.slice(0, 9).map((hole, index) => holeColumn(hole, index)),
      summaryColumn("out", frontIdx),
      ...holes.slice(9, 18).map((hole, index) => holeColumn(hole, index + 9)),
      summaryColumn("in", backIdx),
      summaryColumn("tot", [...frontIdx, ...backIdx]),
    ];
  }

  return [
    ...holes.map((hole, index) => holeColumn(hole, index)),
    summaryColumn(
      "tot",
      holes.map((_, index) => index),
    ),
  ];
}

function sumPar(holes: GolfCourseHole[], indexes: number[]): number {
  let total = 0;
  for (const index of indexes) {
    total += holes[index]?.par ?? 0;
  }
  return total;
}

function sumStrokes(
  holes: GolfCourseHole[],
  indexes: number[],
  strokes: GolfLiveStrokes,
  slot: GolfPlayerSlot,
): number | null {
  let total = 0;
  let counted = 0;
  for (const index of indexes) {
    const hole = holes[index];
    if (!hole) continue;
    const value = holeStrokes(strokes, hole.number, slot);
    if (value == null) continue;
    total += value;
    counted += 1;
  }
  return counted > 0 ? total : null;
}

function parCell(
  column: GolfScorecardColumn,
  holes: GolfCourseHole[],
): GolfScorecardCell {
  if (column.kind === "hole" && column.hole) {
    return {
      display: String(column.hole.par),
      strokes: column.hole.par,
      net: null,
      strokesReceived: 0,
      toPar: 0,
      rel: null,
    };
  }
  const par = sumPar(holes, column.holeIndexes);
  return {
    display: String(par),
    strokes: par,
    net: null,
    strokesReceived: 0,
    toPar: 0,
    rel: null,
  };
}

function siCell(column: GolfScorecardColumn): GolfScorecardCell {
  if (column.kind === "hole" && column.hole) {
    return {
      display: String(column.hole.strokeIndex),
      strokes: column.hole.strokeIndex,
      net: null,
      strokesReceived: 0,
      toPar: null,
      rel: null,
    };
  }
  return {
    display: "",
    strokes: null,
    net: null,
    strokesReceived: 0,
    toPar: null,
    rel: null,
  };
}

function playerCell(
  column: GolfScorecardColumn,
  holes: GolfCourseHole[],
  strokes: GolfLiveStrokes,
  player: GolfPlayer,
  scoreHoles?: GolfHoleScore[] | null,
): GolfScorecardCell {
  const slot = player.slot;
  if (column.kind === "hole" && column.hole) {
    const value = holeStrokes(strokes, column.hole.number, slot);
    if (value == null) {
      return {
        display: "—",
        strokes: null,
        net: null,
        strokesReceived: 0,
        toPar: null,
        rel: null,
      };
    }
    const apiNet = scoreHoles?.find(
      (hole) => hole.number === column.hole?.number,
    )?.netStrokes?.[slotKey(slot)];
    const resolved = resolveHoleNet({
      gross: value,
      playingHandicap: player.playingHandicap,
      holeNumber: column.hole.number,
      holes,
      apiNetStrokes: typeof apiNet === "number" ? apiNet : null,
    });
    return {
      display: String(value),
      strokes: value,
      net: resolved.net,
      strokesReceived: resolved.strokesReceived,
      toPar: value - column.hole.par,
      rel: scoreRel(value, column.hole.par),
    };
  }

  const value = sumStrokes(holes, column.holeIndexes, strokes, slot);
  const par = sumPar(holes, column.holeIndexes);
  if (value == null) {
    return {
      display: "—",
      strokes: null,
      net: null,
      strokesReceived: 0,
      toPar: null,
      rel: null,
    };
  }
  let net: number | null = null;
  if (playerHasPlayingHandicap(player)) {
    let holeNetSum = 0;
    let counted = 0;
    for (const index of column.holeIndexes) {
      const hole = holes[index];
      if (!hole) continue;
      const gross = holeStrokes(strokes, hole.number, slot);
      if (gross == null) continue;
      const apiNet = scoreHoles?.find((row) => row.number === hole.number)
        ?.netStrokes?.[slotKey(slot)];
      const resolved = resolveHoleNet({
        gross,
        playingHandicap: player.playingHandicap,
        holeNumber: hole.number,
        holes,
        apiNetStrokes: typeof apiNet === "number" ? apiNet : null,
      });
      if (resolved.net == null) {
        holeNetSum = 0;
        counted = 0;
        break;
      }
      holeNetSum += resolved.net;
      counted += 1;
    }
    if (counted > 0) net = holeNetSum;
  }
  return {
    display: String(value),
    strokes: value,
    net,
    strokesReceived: 0,
    toPar: value - par,
    rel: null,
  };
}

export function golfLayoutLabel(
  round: Pick<GolfRound, "holesPlayed" | "startingHole">,
): string {
  if (round.holesPlayed === 18 && round.startingHole === 1) return "18 holes";
  if (round.holesPlayed === 9 && round.startingHole === 10) return "Back 9";
  if (round.holesPlayed === 9 && round.startingHole === 1) return "Front 9";
  return (
    formatHoleRangeLabel(round.holesPlayed, round.startingHole) ||
    `${round.holesPlayed} holes`
  );
}

export function buildGolfLockedScorecard(
  players: GolfPlayer[],
  strokes: GolfLiveStrokes,
  holes: GolfCourseHole[],
  scoreHoles?: GolfHoleScore[] | null,
): GolfLockedScorecardModel {
  const columns = golfScorecardColumns(holes);
  const rows: GolfScorecardPlayerRow[] = players.map((player) => {
    const gross =
      typeof player.grossTotal === "number"
        ? player.grossTotal
        : playerGross(strokes, player.slot);
    const net =
      typeof player.netTotal === "number" ? player.netTotal : null;
    return {
      slot: player.slot,
      displayName: player.displayName,
      cells: columns.map((column) =>
        playerCell(column, holes, strokes, player, scoreHoles),
      ),
      gross,
      net,
      courseHandicap:
        typeof player.courseHandicap === "number" ? player.courseHandicap : null,
      playingHandicap:
        typeof player.playingHandicap === "number"
          ? player.playingHandicap
          : null,
      toPar: playerToPar(strokes, player.slot, holes),
      isLeader: false,
    };
  });

  const scored = rows.filter((row) =>
    row.cells.some((cell) => cell.strokes != null),
  );
  if (scored.length > 1) {
    const useNet = scored.every((row) => row.net != null);
    const low = Math.min(
      ...scored.map((row) => (useNet ? (row.net as number) : row.gross)),
    );
    for (const row of rows) {
      const value = useNet ? row.net : row.gross;
      if (value === low && row.cells.some((cell) => cell.strokes != null)) {
        row.isLeader = true;
      }
    }
  }

  return {
    columns,
    parRow: columns.map((column) => parCell(column, holes)),
    siRow: columns.map((column) => siCell(column)),
    players: rows,
  };
}

export { formatToPar };
