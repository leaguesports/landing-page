/**
 * Padel home for /play?mode=padel.
 *
 * PLAY_MODE_SESSION_LIVE is the session API plug-in. While it is false this
 * screen stays empty, and Record a match / Find a game / Join with code only
 * raise a notice. Do not fetch or navigate from here until a later PR
 * replaces beginPadelSession.
 */

import { createElement, type ReactElement, type ReactNode } from "react";
import { PLAY_MODE_SESSION_LIVE } from "./mode.ts";

export const PADEL_HOME_COPY = {
  title: "Game on",
  record: "Record a match",
  recordDetail: "Scores, sets and who played",
  find: "Find a game",
  join: "Join with code",
  levelLabel: "Your level",
  levelMark: "—",
  levelHint: "Record 3 matches to see your level.",
  recentLabel: "Recent matches",
  recentEmpty: "No matches yet. Record one and it shows here.",
  notice: "Coming soon",
} as const;

/** Open games stay off this home. No venues, spots, or sample matches. */
export const PADEL_HOME_OPEN_GAMES = "omitted" as const;

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as const;
const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"] as const;

export type PadelHomeAction = "record" | "find" | "join";

export type PadelHomePress =
  | { live: false; notice: typeof PADEL_HOME_COPY.notice }
  | { live: true; action: PadelHomeAction };

/** Local calendar date: `PADEL · MON 19 OCT`. Missing date stays `PADEL`. */
export function padelEyebrow(date: Date | null): string {
  if (!date || Number.isNaN(date.getTime())) return "PADEL";
  const weekday = WEEKDAYS[date.getDay()];
  const month = MONTHS[date.getMonth()];
  if (!weekday || !month) return "PADEL";
  return `PADEL · ${weekday} ${date.getDate()} ${month}`;
}

/** First word of the session display name. Emails use the local part. */
export function padelFirstName(displayName: string): string | null {
  const token = displayName.trim().split(/\s+/)[0] ?? "";
  if (!token) return null;
  const local = token.replace(/^@+/, "").split("@")[0]?.trim() ?? "";
  if (!local || !/[\p{L}\p{N}]/u.test(local)) return null;
  return local;
}

/**
 * Signed out, or signed in without a usable name: "Game on".
 * Signed in: "Game on, Brandon".
 */
export function padelTitle(input: { signedIn: boolean; displayName: string }): string {
  if (!input.signedIn) return PADEL_HOME_COPY.title;
  const name = padelFirstName(input.displayName);
  return name ? `${PADEL_HOME_COPY.title}, ${name}` : PADEL_HOME_COPY.title;
}

/** `live` defaults to the shared flag. Tests can pass true to exercise the plug-in. */
export function padelHomePress(
  action: PadelHomeAction,
  live: boolean = PLAY_MODE_SESSION_LIVE,
): PadelHomePress {
  if (!live) return { live: false, notice: PADEL_HOME_COPY.notice };
  return { live: true, action };
}

/**
 * Wiring point for the session API. Returns the action when live, otherwise
 * null. No request and no route.
 */
export function beginPadelSession(
  action: PadelHomeAction,
  live: boolean = PLAY_MODE_SESSION_LIVE,
): PadelHomeAction | null {
  if (!live) return null;
  return action;
}

export function reducePadelNotice(
  notice: string | null,
  action: PadelHomeAction,
  live: boolean = PLAY_MODE_SESSION_LIVE,
): string | null {
  const result = padelHomePress(action, live);
  if (!result.live) return result.notice;
  beginPadelSession(result.action, live);
  return notice;
}

function icon(
  size: number,
  stroke: string,
  strokeWidth: number,
  children: ReactNode,
): ReactElement {
  return createElement(
    "svg",
    {
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke,
      strokeWidth,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": true,
    },
    children,
  );
}

/** H4 record-score tile glyph, drawn in mint on the black primary. */
function recordIcon(): ReactElement {
  return icon(
    24,
    "#3dff8a",
    2.2,
    [
      createElement("rect", { key: "card", x: "3", y: "4", width: "18", height: "16", rx: "2" }),
      createElement("path", { key: "marks", d: "M12 4v16M7 10v4M15.5 10h2v4h-2z" }),
    ],
  );
}

function arrowIcon(): ReactElement {
  return icon(
    24,
    "#3dff8a",
    2.5,
    createElement("path", { d: "M5 12h14M13 6l6 6-6 6" }),
  );
}

function searchIcon(): ReactElement {
  return icon(
    19,
    "#09090b",
    2.2,
    [
      createElement("circle", { key: "lens", cx: "11", cy: "11", r: "7" }),
      createElement("path", { key: "handle", d: "M20 20l-4-4" }),
    ],
  );
}

function qrIcon(): ReactElement {
  return icon(
    19,
    "#09090b",
    2,
    [
      createElement("rect", { key: "a", x: "3", y: "3", width: "7", height: "7", rx: "1" }),
      createElement("rect", { key: "b", x: "14", y: "3", width: "7", height: "7", rx: "1" }),
      createElement("rect", { key: "c", x: "3", y: "14", width: "7", height: "7", rx: "1" }),
      createElement("path", {
        key: "d",
        d: "M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4v-3",
      }),
    ],
  );
}

export function PadelHomeView({
  eyebrow,
  title,
  notice,
  onAction,
}: {
  eyebrow: string;
  title: string;
  notice: string | null;
  onAction: (action: PadelHomeAction) => void;
}): ReactElement {
  const describedBy = notice ? "padel-coming-soon" : undefined;
  return createElement(
    "section",
    { className: "padel-home", "aria-label": "Padel" },
    createElement("p", { className: "hello" }, eyebrow),
    createElement("h1", null, title),
    createElement(
      "button",
      {
        type: "button",
        className: "cta",
        "data-padel-action": "record",
        "aria-describedby": describedBy,
        onClick: () => onAction("record"),
      },
      createElement("span", { className: "ci" }, recordIcon()),
      createElement(
        "span",
        { className: "cta-copy" },
        createElement("b", null, PADEL_HOME_COPY.record),
        createElement("span", { className: "sub" }, PADEL_HOME_COPY.recordDetail),
      ),
      createElement("span", { className: "go" }, arrowIcon()),
    ),
    createElement(
      "button",
      {
        type: "button",
        className: "sec",
        "data-padel-action": "find",
        "aria-describedby": describedBy,
        onClick: () => onAction("find"),
      },
      searchIcon(),
      PADEL_HOME_COPY.find,
    ),
    createElement(
      "button",
      {
        type: "button",
        className: "sec",
        "data-padel-action": "join",
        "aria-describedby": describedBy,
        onClick: () => onAction("join"),
      },
      qrIcon(),
      PADEL_HOME_COPY.join,
    ),
    notice
      ? createElement(
          "p",
          { className: "note", id: "padel-coming-soon", role: "status" },
          createElement("span", { className: "dot", "aria-hidden": true }),
          notice,
        )
      : null,
    createElement(
      "section",
      { className: "card", "aria-labelledby": "padel-level-label" },
      createElement("p", { className: "lbl", id: "padel-level-label" }, PADEL_HOME_COPY.levelLabel),
      createElement(
        "p",
        { className: "big", "aria-hidden": true },
        createElement("span", { className: "dash" }),
      ),
      createElement("p", { className: "hint" }, PADEL_HOME_COPY.levelHint),
    ),
    createElement(
      "section",
      { "aria-labelledby": "padel-recent-label" },
      createElement("h2", { id: "padel-recent-label" }, PADEL_HOME_COPY.recentLabel),
      createElement("p", { className: "rounds-empty" }, PADEL_HOME_COPY.recentEmpty),
    ),
  );
}
