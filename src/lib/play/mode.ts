/**
 * Sport mode for /play. Social, Golf, and Padel swap the whole screen.
 * Darts stays on /play/darts. Sheet lines are static until session stats exist.
 */

export const PLAY_MODES = ["social", "golf", "padel"] as const;
export type PlayMode = (typeof PLAY_MODES)[number];

export const DEFAULT_PLAY_MODE: PlayMode = "social";
export const PLAY_MODE_STORAGE_KEY = "leaguesports.play.mode";

/** Live session stats are not wired. Account stays on the site header. */
export const PLAY_MODE_SESSION_LIVE = false;

export const PLAY_MODE_COPY: Record<
  PlayMode,
  { label: string; detail: string; color: string }
> = {
  social: {
    label: "Social",
    detail: "Activity from everyone you follow",
    color: "#5b21b6",
  },
  golf: {
    label: "Golf",
    detail: "Rounds, scores and handicap",
    color: "#006045",
  },
  padel: {
    label: "Padel",
    detail: "Matches and open games",
    color: "#0e7490",
  },
};

export const ADD_SPORT_COPY = {
  id: "add" as const,
  label: "Add a sport",
  detail: "Tennis, squash, pickleball and more",
};

export type ModeSheetRow = {
  id: PlayMode | "add";
  label: string;
  detail: string;
  disabled: boolean;
  current: boolean;
};

export type ModeSheetState = {
  open: boolean;
  mode: PlayMode;
  cursor: number;
};

type ModeStore = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

export function parsePlayMode(value: string | null | undefined): PlayMode | null {
  const token = value?.trim().toLowerCase() ?? "";
  return (PLAY_MODES as readonly string[]).includes(token) ? (token as PlayMode) : null;
}

/** Exact /play app. Directory pages (/play/golf, /play/padel, /play/darts) stay put. */
export function isPlayModeAppPath(pathname: string): boolean {
  return pathname === "/play" || pathname === "/play/";
}

export function playModeHref(mode: PlayMode): string {
  return `/play?mode=${mode}`;
}

export function playModeFromSearch(search: string): {
  present: boolean;
  value: string | null;
} {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  if (!params.has("mode")) return { present: false, value: null };
  return { present: true, value: params.get("mode") };
}

/** URL wins. A missing param may use storage. An invalid param falls back to Social. */
export function resolvePlayMode(input: {
  urlMode: string | null | undefined;
  storedMode?: string | null;
  urlPresent: boolean;
}): PlayMode {
  if (input.urlPresent) return parsePlayMode(input.urlMode) ?? DEFAULT_PLAY_MODE;
  return parsePlayMode(input.storedMode) ?? DEFAULT_PLAY_MODE;
}

/** `href` is set only when the address bar should change. `null` leaves it alone. */
export function playModeUrlDecision(input: {
  urlMode: string | null | undefined;
  storedMode?: string | null;
  urlPresent: boolean;
}): { mode: PlayMode; href: string | null } {
  const mode = resolvePlayMode(input);
  const href = playModeHref(mode);
  if (input.urlPresent) {
    return { mode, href: input.urlMode === mode ? null : href };
  }
  return { mode, href: mode === DEFAULT_PLAY_MODE ? null : href };
}

export function readStoredPlayMode(storage: Pick<ModeStore, "getItem"> | null): string | null {
  if (!storage) return null;
  try {
    return storage.getItem(PLAY_MODE_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function writeStoredPlayMode(
  storage: Pick<ModeStore, "setItem"> | null,
  mode: PlayMode,
): void {
  try {
    storage?.setItem(PLAY_MODE_STORAGE_KEY, mode);
  } catch {
    /* private mode */
  }
}

export function modeSheetRows(mode: PlayMode): ModeSheetRow[] {
  const modes = PLAY_MODES.map((id) => ({
    id,
    label: PLAY_MODE_COPY[id].label,
    detail: PLAY_MODE_COPY[id].detail,
    disabled: false,
    current: id === mode,
  }));
  return [
    ...modes,
    { ...ADD_SPORT_COPY, disabled: true, current: false },
  ];
}

export function nextFocusIndex(count: number, index: number, shift: boolean): number {
  if (count <= 0) return 0;
  const current = index < 0 ? (shift ? 0 : -1) : index;
  const next = shift ? current - 1 : current + 1;
  return (next + count) % count;
}

function modeIndex(mode: PlayMode): number {
  return PLAY_MODES.indexOf(mode);
}

export function initialModeSheet(mode: PlayMode): ModeSheetState {
  return { open: false, mode, cursor: modeIndex(mode) };
}

export type ModeSheetAction =
  | { type: "open" }
  | { type: "close" }
  | { type: "hydrate"; mode: PlayMode }
  | { type: "select"; id: string }
  | { type: "key"; key: string };

export function reduceModeSheet(state: ModeSheetState, action: ModeSheetAction): ModeSheetState {
  if (action.type === "hydrate") {
    return { ...state, mode: action.mode, cursor: modeIndex(action.mode) };
  }
  if (action.type === "open") {
    return { ...state, open: true, cursor: modeIndex(state.mode) };
  }
  if (action.type === "close") return { ...state, open: false };
  if (action.type === "select") {
    const mode = parsePlayMode(action.id);
    if (!mode) return state;
    return { open: false, mode, cursor: modeIndex(mode) };
  }
  if (!state.open) return state;
  if (action.key === "Escape") return { ...state, open: false };
  if (action.key === "ArrowDown" || action.key === "ArrowUp") {
    const cursor = nextFocusIndex(PLAY_MODES.length, state.cursor, action.key === "ArrowUp");
    return { ...state, cursor };
  }
  if (action.key === "Enter" || action.key === " ") {
    const mode = PLAY_MODES[state.cursor] ?? state.mode;
    return { open: false, mode, cursor: modeIndex(mode) };
  }
  return state;
}
