/**
 * Social home for /play?mode=social.
 *
 * Friends is the default feed. Nearby is ?mode=social&feed=nearby.
 * PLAY_MODE_SESSION_LIVE is the session API plug-in. While it is false the
 * feed stays empty, and the compose button only raises a notice. Do not fetch
 * or navigate from here until a later PR replaces beginSocialCompose.
 */

import { createElement, type KeyboardEvent, type ReactElement, type ReactNode } from "react";
import { PLAY_MODE_SESSION_LIVE } from "./mode.ts";

export const SOCIAL_FEEDS = ["friends", "nearby"] as const;
export type SocialFeed = (typeof SOCIAL_FEEDS)[number];
export const DEFAULT_SOCIAL_FEED: SocialFeed = "friends";

export const SOCIAL_HOME_COPY = {
  friends: "Friends",
  nearby: "Nearby",
  friendsTitle: "Your friends' activity shows up here",
  friendsDetail:
    "Rounds, matches and live games from people you follow, plus who's going to a screening.",
  nearbyTitle: "Games and screenings near you show up here",
  nearbyDetail:
    "Rounds, matches and live games near you, plus who's going to a screening.",
  notice: "Coming soon",
  composeLabel: "New post",
} as const;

/** H3L's sample posts stay off this screen. No names, scores, or venues. */
export const SOCIAL_HOME_ACTIVITY = "omitted" as const;

/** Legend only. Darts is out, so it is not listed. */
export const SOCIAL_LEGEND = [
  { id: "golf", label: "Golf" },
  { id: "padel", label: "Padel" },
  { id: "watch", label: "Watch" },
] as const;

export type SocialComposeAction = "compose";

export type SocialComposePress =
  | { live: false; notice: typeof SOCIAL_HOME_COPY.notice }
  | { live: true; action: SocialComposeAction };

export type SocialHomeState = {
  feed: SocialFeed;
  notice: string | null;
};

export type SocialHomeAction =
  | { type: "select"; feed: string }
  | { type: "key"; key: string }
  | { type: "hydrate"; search: string }
  | { type: "compose" };

export function parseSocialFeed(value: string | null | undefined): SocialFeed | null {
  const token = value?.trim().toLowerCase() ?? "";
  return (SOCIAL_FEEDS as readonly string[]).includes(token) ? (token as SocialFeed) : null;
}

export function socialFeedFromSearch(search: string): SocialFeed {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  return parseSocialFeed(params.get("feed")) ?? DEFAULT_SOCIAL_FEED;
}

/** Friends omits the feed param. Nearby is the spec URL. */
export function socialFeedHref(feed: SocialFeed): string {
  if (feed === "nearby") return "/play?mode=social&feed=nearby";
  return "/play?mode=social";
}

export function initialSocialHome(feedParam: string | null): SocialHomeState {
  const feed =
    typeof window === "undefined"
      ? (parseSocialFeed(feedParam) ?? DEFAULT_SOCIAL_FEED)
      : socialFeedFromSearch(window.location.search);
  return { feed, notice: null };
}

/** Arrow keys move the segmented control. Home and End jump to the ends. */
export function nextSocialFeed(feed: SocialFeed, key: string): SocialFeed | null {
  const index = SOCIAL_FEEDS.indexOf(feed);
  if (key === "ArrowRight" || key === "ArrowDown") {
    return SOCIAL_FEEDS[(index + 1) % SOCIAL_FEEDS.length] ?? feed;
  }
  if (key === "ArrowLeft" || key === "ArrowUp") {
    return SOCIAL_FEEDS[(index - 1 + SOCIAL_FEEDS.length) % SOCIAL_FEEDS.length] ?? feed;
  }
  if (key === "Home") return "friends";
  if (key === "End") return "nearby";
  return null;
}

/** `live` defaults to the shared flag. Tests can pass true to exercise the plug-in. */
export function socialComposePress(
  live: boolean = PLAY_MODE_SESSION_LIVE,
): SocialComposePress {
  if (!live) return { live: false, notice: SOCIAL_HOME_COPY.notice };
  return { live: true, action: "compose" };
}

/**
 * Wiring point for the session API. Returns compose when live, otherwise
 * null. No request and no route.
 */
export function beginSocialCompose(
  live: boolean = PLAY_MODE_SESSION_LIVE,
): SocialComposeAction | null {
  if (!live) return null;
  return "compose";
}

export function reduceSocialNotice(
  notice: string | null,
  live: boolean = PLAY_MODE_SESSION_LIVE,
): string | null {
  const result = socialComposePress(live);
  if (!result.live) return result.notice;
  beginSocialCompose(live);
  return notice;
}

export function reduceSocialHome(state: SocialHomeState, action: SocialHomeAction): SocialHomeState {
  if (action.type === "hydrate") {
    const feed = socialFeedFromSearch(action.search);
    return feed === state.feed ? state : { ...state, feed };
  }
  if (action.type === "select") {
    const feed = parseSocialFeed(action.feed);
    if (!feed || feed === state.feed) return state;
    return { ...state, feed };
  }
  if (action.type === "key") {
    const feed = nextSocialFeed(state.feed, action.key);
    if (!feed || feed === state.feed) return state;
    return { ...state, feed };
  }
  if (action.type === "compose") {
    const notice = reduceSocialNotice(state.notice);
    return notice === state.notice ? state : { ...state, notice };
  }
  return state;
}

function icon(size: number, children: ReactNode): ReactElement {
  return createElement(
    "svg",
    {
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 2,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": true,
    },
    children,
  );
}

function legendIcon(id: (typeof SOCIAL_LEGEND)[number]["id"]): ReactElement {
  if (id === "golf") {
    return icon(13, [
      createElement("path", { key: "pole", d: "M7 21V3l10 4-10 4" }),
      createElement("ellipse", { key: "base", cx: "12", cy: "21", rx: "7", ry: "1.5" }),
    ]);
  }
  if (id === "padel") {
    return icon(13, [
      createElement("ellipse", { key: "head", cx: "10", cy: "9", rx: "6", ry: "6.5" }),
      createElement("path", { key: "handle", d: "M14 14l5 6" }),
      createElement("circle", { key: "a", cx: "8", cy: "8", r: ".6", fill: "currentColor" }),
      createElement("circle", { key: "b", cx: "11", cy: "7", r: ".6", fill: "currentColor" }),
      createElement("circle", { key: "c", cx: "10", cy: "11", r: ".6", fill: "currentColor" }),
    ]);
  }
  return icon(13, [
    createElement("rect", { key: "screen", x: "3", y: "5", width: "18", height: "12", rx: "2" }),
    createElement("path", { key: "play", d: "M8 21h8M10.5 9v4l3.5-2z" }),
  ]);
}

function legend(): ReactElement {
  return createElement(
    "ul",
    { className: "chips", "aria-hidden": true },
    SOCIAL_LEGEND.map((chip) =>
      createElement(
        "li",
        { key: chip.id, className: `chip chip-${chip.id}` },
        legendIcon(chip.id),
        chip.label,
      ),
    ),
  );
}

function plusIcon(): ReactElement {
  return createElement(
    "svg",
    {
      width: 28,
      height: 28,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 2.6,
      strokeLinecap: "round",
      "aria-hidden": true,
    },
    createElement("path", { d: "M12 5v14M5 12h14" }),
  );
}

function onTabsKeyDown(
  feed: SocialFeed,
  onFeed: (feed: SocialFeed) => void,
  event: KeyboardEvent<HTMLDivElement>,
) {
  const next = nextSocialFeed(feed, event.key);
  if (!next) return;
  event.preventDefault();
  if (next !== feed) onFeed(next);
  event.currentTarget.querySelector<HTMLButtonElement>(`[data-feed="${next}"]`)?.focus();
}

export function SocialHomeView({
  feed,
  notice,
  onFeed,
  onCompose,
}: {
  feed: SocialFeed;
  notice: string | null;
  onFeed: (feed: SocialFeed) => void;
  onCompose: () => void;
}): ReactElement {
  const describedBy = notice ? "social-coming-soon" : undefined;
  const title = feed === "friends" ? SOCIAL_HOME_COPY.friendsTitle : SOCIAL_HOME_COPY.nearbyTitle;
  const detail = feed === "friends" ? SOCIAL_HOME_COPY.friendsDetail : SOCIAL_HOME_COPY.nearbyDetail;
  return createElement(
    "section",
    { className: "social-home", "aria-label": "Social" },
    createElement(
      "div",
      {
        role: "tablist",
        "aria-label": "Social feed",
        "aria-orientation": "horizontal",
        className: "seg",
        onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => onTabsKeyDown(feed, onFeed, event),
      },
      SOCIAL_FEEDS.map((id) =>
        createElement(
          "button",
          {
            key: id,
            type: "button",
            role: "tab",
            id: `social-tab-${id}`,
            className: feed === id ? "on" : undefined,
            "data-feed": id,
            "aria-selected": feed === id,
            "aria-controls": "social-panel",
            tabIndex: feed === id ? 0 : -1,
            onClick: () => onFeed(id),
          },
          SOCIAL_HOME_COPY[id],
        ),
      ),
    ),
    createElement(
      "div",
      {
        role: "tabpanel",
        id: "social-panel",
        "aria-labelledby": `social-tab-${feed}`,
        className: "feed social-empty",
        "data-empty": "true",
      },
      createElement("h2", { className: "empty-title" }, title),
      createElement("p", { className: "empty-copy" }, detail),
      feed === "friends" ? legend() : null,
    ),
    notice
      ? createElement(
          "p",
          { className: "note", id: "social-coming-soon", role: "status" },
          createElement("span", { className: "dot", "aria-hidden": true }),
          notice,
        )
      : null,
    createElement(
      "button",
      {
        type: "button",
        className: "fab",
        "data-social-action": "compose",
        "aria-label": SOCIAL_HOME_COPY.composeLabel,
        "aria-describedby": describedBy,
        onClick: onCompose,
      },
      plusIcon(),
    ),
  );
}
