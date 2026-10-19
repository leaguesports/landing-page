/**
 * Golf home for /play?mode=golf.
 *
 * PLAY_MODE_SESSION_LIVE is the session API plug-in. While it is false this
 * screen stays empty, and Start a round / Join with code only raise a notice.
 * Do not fetch or navigate from here until a later PR replaces beginGolfSession.
 */

import { createElement, type ReactElement, type ReactNode } from "react";
import { PLAY_MODE_SESSION_LIVE } from "./mode.ts";

export const GOLF_HOME_COPY = {
  title: "Ready for 18?",
  start: "Start a round",
  startDetail: "Scorecard · Stableford · friends",
  join: "Join with code",
  handicapLabel: "Handicap index",
  handicapMark: "—",
  handicapHint: "Play 3 rounds to get your index.",
  recentLabel: "Recent rounds",
  recentEmpty: "No rounds yet. Start one and it shows here.",
  notice: "Coming soon",
} as const;

/** Directory stays at /play/golf. This home does not invent a nearby-courses list. */
export const GOLF_HOME_COURSES = "omitted" as const;

export type GolfDayPart = "morning" | "afternoon" | "evening";
export type GolfHomeAction = "start" | "join";

export type GolfHomePress =
  | { live: false; notice: typeof GOLF_HOME_COPY.notice }
  | { live: true; action: GolfHomeAction };

const DAY_PART_LABEL: Record<GolfDayPart, string> = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
};

/** Local hour: morning before 12:00, afternoon before 17:00, otherwise evening. */
export function golfDayPart(hour: number): GolfDayPart {
  if (!Number.isFinite(hour)) return "morning";
  const whole = Math.floor(hour);
  if (whole < 12) return "morning";
  if (whole < 17) return "afternoon";
  return "evening";
}

/** First word of the session display name. Emails use the local part. */
export function golfFirstName(displayName: string): string | null {
  const token = displayName.trim().split(/\s+/)[0] ?? "";
  if (!token) return null;
  const local = token.replace(/^@+/, "").split("@")[0]?.trim() ?? "";
  if (!local || !/[\p{L}\p{N}]/u.test(local)) return null;
  return local;
}

/**
 * Signed out, or before local time is known: "Golf".
 * Signed in: "Morning, Brandon", or just the time word when the name is missing.
 */
export function golfGreeting(input: {
  signedIn: boolean;
  displayName: string;
  hour: number | null;
}): string {
  if (!input.signedIn || input.hour === null) return "Golf";
  const label = DAY_PART_LABEL[golfDayPart(input.hour)];
  const name = golfFirstName(input.displayName);
  return name ? `${label}, ${name}` : label;
}

/** `live` defaults to the shared flag. Tests can pass true to exercise the plug-in. */
export function golfHomePress(
  action: GolfHomeAction,
  live: boolean = PLAY_MODE_SESSION_LIVE,
): GolfHomePress {
  if (!live) return { live: false, notice: GOLF_HOME_COPY.notice };
  return { live: true, action };
}

/**
 * Wiring point for the session API. Returns the action when live, otherwise
 * null. No request and no route.
 */
export function beginGolfSession(
  action: GolfHomeAction,
  live: boolean = PLAY_MODE_SESSION_LIVE,
): GolfHomeAction | null {
  if (!live) return null;
  return action;
}

export function reduceGolfNotice(
  notice: string | null,
  action: GolfHomeAction,
  live: boolean = PLAY_MODE_SESSION_LIVE,
): string | null {
  const result = golfHomePress(action, live);
  if (!result.live) return result.notice;
  beginGolfSession(result.action, live);
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

function flagIcon(): ReactElement {
  return icon(
    26,
    "#3dff8a",
    2,
    [
      createElement("path", { key: "pole", d: "M7 21V3l10 4-10 4" }),
      createElement("ellipse", { key: "base", cx: "12", cy: "21", rx: "7", ry: "1.5" }),
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

export function GolfHomeView({
  greeting,
  notice,
  onAction,
}: {
  greeting: string;
  notice: string | null;
  onAction: (action: GolfHomeAction) => void;
}): ReactElement {
  const describedBy = notice ? "golf-coming-soon" : undefined;
  return createElement(
    "section",
    { className: "golf-home", "aria-label": "Golf" },
    createElement("p", { className: "hello" }, greeting),
    createElement("h1", null, GOLF_HOME_COPY.title),
    createElement(
      "button",
      {
        type: "button",
        className: "cta",
        "data-golf-action": "start",
        "aria-describedby": describedBy,
        onClick: () => onAction("start"),
      },
      createElement("span", { className: "ci" }, flagIcon()),
      createElement(
        "span",
        { className: "cta-copy" },
        createElement("b", null, GOLF_HOME_COPY.start),
        createElement("span", { className: "sub" }, GOLF_HOME_COPY.startDetail),
      ),
      createElement("span", { className: "go" }, arrowIcon()),
    ),
    createElement(
      "button",
      {
        type: "button",
        className: "sec",
        "data-golf-action": "join",
        "aria-describedby": describedBy,
        onClick: () => onAction("join"),
      },
      qrIcon(),
      GOLF_HOME_COPY.join,
    ),
    notice
      ? createElement(
          "p",
          { className: "note", id: "golf-coming-soon", role: "status" },
          createElement("span", { className: "dot", "aria-hidden": true }),
          notice,
        )
      : null,
    createElement(
      "section",
      { className: "card", "aria-labelledby": "golf-handicap-label" },
      createElement(
        "p",
        { className: "lbl", id: "golf-handicap-label" },
        GOLF_HOME_COPY.handicapLabel,
      ),
      createElement(
        "p",
        { className: "big", "aria-hidden": true },
        createElement("span", { className: "dash" }),
      ),
      createElement("p", { className: "hint" }, GOLF_HOME_COPY.handicapHint),
    ),
    createElement(
      "section",
      { "aria-labelledby": "golf-recent-label" },
      createElement("h2", { id: "golf-recent-label" }, GOLF_HOME_COPY.recentLabel),
      createElement("p", { className: "rounds-empty" }, GOLF_HOME_COPY.recentEmpty),
    ),
  );
}
