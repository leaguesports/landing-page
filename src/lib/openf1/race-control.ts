import type {
  PositionEvent,
  RaceControlEvent,
  ReplayDriver,
  ReplayScrubMark,
} from "./replay.ts";

export type FlagKind =
  | "red"
  | "sc"
  | "vsc"
  | "double-yellow"
  | "yellow"
  | "chequered"
  | "hidden";

export type FlagState = {
  kind: FlagKind;
  label: string;
  sectors: number[];
};

type FlagSim = {
  sectorFlags: Map<number, "yellow" | "double">;
  red: boolean;
  sc: boolean;
  vsc: boolean;
  chequered: boolean;
};

function upper(value: string | null | undefined): string {
  return (value ?? "").trim().toUpperCase();
}

function applyRaceControlEvent(state: FlagSim, event: RaceControlEvent): void {
  const flag = upper(event.flag);
  const message = upper(event.message);
  const category = upper(event.category);
  const scope = upper(event.scope);

  if (flag === "YELLOW" && event.sector != null) {
    if (state.sectorFlags.get(event.sector) !== "double") {
      state.sectorFlags.set(event.sector, "yellow");
    }
  }
  if ((flag === "DOUBLE YELLOW" || flag === "DOUBLE_YELLOW") && event.sector != null) {
    state.sectorFlags.set(event.sector, "double");
  }
  if (flag === "CLEAR" && event.sector != null) {
    state.sectorFlags.delete(event.sector);
  }
  if (flag === "CLEAR" && scope === "TRACK") {
    state.sectorFlags.clear();
    state.vsc = false;
  }

  if (
    flag === "CHEQUERED" ||
    message.includes("CHEQUERED") ||
    message === "SESSION FINISHED"
  ) {
    state.chequered = true;
  }

  if (/\bRED FLAG\b/.test(message) || message.includes("SESSION ABORTED")) {
    state.red = true;
  }

  if (message === "SESSION STARTED") {
    state.red = false;
    state.sc = false;
  }

  if (
    message.includes("SAFETY CAR DEPLOYED") ||
    (category === "SAFETYCAR" && message.includes("SAFETY CAR DEPLOYED"))
  ) {
    state.sc = true;
  }
  if (
    (message.includes("SAFETY CAR IN") && !message.includes("SAFETY CAR IN THIS LAP")) ||
    message.includes("SAFETY CAR ENDING")
  ) {
    state.sc = false;
  }

  if (message.includes("VSC DEPLOYED")) state.vsc = true;
  if (message.includes("VSC ENDING")) state.vsc = false;
}

function sectorsOf(state: FlagSim, kind: "yellow" | "double"): number[] {
  return [...state.sectorFlags.entries()]
    .filter(([, value]) => value === kind)
    .map(([sector]) => sector)
    .sort((a, b) => a - b);
}

function displayOf(state: FlagSim): FlagState {
  if (state.red) {
    return { kind: "red", label: "Red flag", sectors: [] };
  }
  if (state.sc) {
    return { kind: "sc", label: "Safety car", sectors: [] };
  }
  if (state.vsc) {
    return { kind: "vsc", label: "VSC", sectors: [] };
  }
  const doubles = sectorsOf(state, "double");
  if (doubles.length > 0) {
    return {
      kind: "double-yellow",
      label: `Double yellow · S${doubles.join(" / S")}`,
      sectors: doubles,
    };
  }
  const yellows = sectorsOf(state, "yellow");
  if (yellows.length > 0) {
    return {
      kind: "yellow",
      label: `Yellow · S${yellows.join(" / S")}`,
      sectors: yellows,
    };
  }
  if (state.chequered) {
    return { kind: "chequered", label: "Chequered flag", sectors: [] };
  }
  return { kind: "hidden", label: "", sectors: [] };
}

export function flagStateAt(
  events: readonly RaceControlEvent[],
  t: number,
): FlagState {
  const state: FlagSim = {
    sectorFlags: new Map(),
    red: false,
    sc: false,
    vsc: false,
    chequered: false,
  };
  for (const event of events) {
    if (event.t > t) break;
    applyRaceControlEvent(state, event);
  }
  return displayOf(state);
}

export function buildScrubMarks(
  events: readonly RaceControlEvent[],
): ReplayScrubMark[] {
  const marks: ReplayScrubMark[] = [];
  let lastT = -Infinity;
  let lastKind: ReplayScrubMark["kind"] | null = null;

  const push = (t: number, kind: ReplayScrubMark["kind"]) => {
    if (kind === lastKind && t - lastT < 4_000) return;
    marks.push({ t, kind });
    lastT = t;
    lastKind = kind;
  };

  for (const event of events) {
    const flag = upper(event.flag);
    const message = upper(event.message);
    if (/\bRED FLAG\b/.test(message) || message.includes("SESSION ABORTED")) {
      push(event.t, "red");
      continue;
    }
    if (message.includes("SAFETY CAR DEPLOYED")) {
      push(event.t, "sc");
      continue;
    }
    if (message.includes("VSC DEPLOYED")) {
      push(event.t, "vsc");
      continue;
    }
    if (flag === "CHEQUERED" || message.includes("CHEQUERED")) {
      push(event.t, "chequered");
      continue;
    }
    if (flag === "YELLOW" || flag === "DOUBLE YELLOW" || flag === "DOUBLE_YELLOW") {
      push(event.t, "yellow");
    }
  }
  return marks;
}

export function standingsAt(
  events: readonly PositionEvent[],
  t: number,
  drivers: readonly ReplayDriver[],
): Array<ReplayDriver & { position: number }> {
  const latest = new Map<number, number>();
  for (const event of events) {
    if (event.t > t) break;
    latest.set(event.driverNumber, event.position);
  }
  const byNumber = new Map(drivers.map((driver) => [driver.driverNumber, driver]));
  const rows: Array<ReplayDriver & { position: number }> = [];
  for (const [driverNumber, position] of latest) {
    const driver = byNumber.get(driverNumber);
    if (!driver) continue;
    rows.push({ ...driver, position });
  }
  rows.sort((a, b) => a.position - b.position);
  if (rows.length > 0) return rows;
  return drivers.map((driver, index) => ({ ...driver, position: index + 1 }));
}
