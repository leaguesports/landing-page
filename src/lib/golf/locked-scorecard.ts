import type {
  GolfCourseHole,
  GolfLiveStrokes,
  GolfPlayer,
  GolfPlayerSlot,
  GolfRound,
} from "../../types/golf-round.ts";
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
  toPar: number | null;
  rel: GolfScoreRel | null;
};

export type GolfScorecardPlayerRow = {
  slot: GolfPlayerSlot;
  displayName: string;
  cells: GolfScorecardCell[];
  gross: number;
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
      toPar: 0,
      rel: null,
    };
  }
  const par = sumPar(holes, column.holeIndexes);
  return {
    display: String(par),
    strokes: par,
    toPar: 0,
    rel: null,
  };
}

function siCell(column: GolfScorecardColumn): GolfScorecardCell {
  if (column.kind === "hole" && column.hole) {
    return {
      display: String(column.hole.strokeIndex),
      strokes: column.hole.strokeIndex,
      toPar: null,
      rel: null,
    };
  }
  return { display: "", strokes: null, toPar: null, rel: null };
}

function playerCell(
  column: GolfScorecardColumn,
  holes: GolfCourseHole[],
  strokes: GolfLiveStrokes,
  slot: GolfPlayerSlot,
): GolfScorecardCell {
  if (column.kind === "hole" && column.hole) {
    const value = holeStrokes(strokes, column.hole.number, slot);
    if (value == null) {
      return { display: "—", strokes: null, toPar: null, rel: null };
    }
    return {
      display: String(value),
      strokes: value,
      toPar: value - column.hole.par,
      rel: scoreRel(value, column.hole.par),
    };
  }

  const value = sumStrokes(holes, column.holeIndexes, strokes, slot);
  const par = sumPar(holes, column.holeIndexes);
  if (value == null) {
    return { display: "—", strokes: null, toPar: null, rel: null };
  }
  return {
    display: String(value),
    strokes: value,
    toPar: value - par,
    rel: null,
  };
}

export function golfLayoutLabel(
  round: Pick<GolfRound, "holesPlayed" | "startingHole">,
): string {
  if (round.holesPlayed === 18) return "18 holes";
  if (round.startingHole === 10) return "Back 9";
  return "Front 9";
}

export function buildGolfLockedScorecard(
  players: GolfPlayer[],
  strokes: GolfLiveStrokes,
  holes: GolfCourseHole[],
): GolfLockedScorecardModel {
  const columns = golfScorecardColumns(holes);
  const rows: GolfScorecardPlayerRow[] = players.map((player) => ({
    slot: player.slot,
    displayName: player.displayName,
    cells: columns.map((column) =>
      playerCell(column, holes, strokes, player.slot),
    ),
    gross: playerGross(strokes, player.slot),
    toPar: playerToPar(strokes, player.slot, holes),
    isLeader: false,
  }));

  const scored = rows.filter((row) =>
    row.cells.some((cell) => cell.strokes != null),
  );
  if (scored.length > 1) {
    const low = Math.min(...scored.map((row) => row.gross));
    for (const row of rows) {
      if (row.gross === low && row.cells.some((cell) => cell.strokes != null)) {
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
