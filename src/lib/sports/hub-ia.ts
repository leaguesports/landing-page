/**
 * Signed-in hub information architecture
 * (#145 / #150 / #153 / #155 / #157 / #192 / #212).
 * 4-tab bottom nav — Home / People / You stay in-hub; Play is a route.
 * Play tab always opens the `/play` sport grid (not a modal, not last-sport).
 * Sport dashboards live at `/play/[sport]`; Change sport returns to `/play`.
 */

import {
  activitySupportsIntent,
  buildIntentActivity,
} from "../intent/activity.ts";
import { intentPath } from "../intent/paths.ts";
import { parseVenueSearch } from "../search/venueSearch.ts";
import { ALL_SPORTS_SLUG, type SportDefinition } from "./catalog.ts";
import { HUB_QUICK_START_HREF } from "../play/quick-start.ts";
import { HUB_PLAY_DEEP_LINK_REDIRECTS } from "./hub-redirects.ts";

export { HUB_PLAY_DEEP_LINK_REDIRECTS };

export { HUB_QUICK_START_HREF };

export const HUB_START_MATCH_HREF = "/padel/new" as const;
export const HUB_START_GOLF_HREF = "/golf/new" as const;
export const HUB_START_DARTS_HREF = "/darts/new" as const;
export const HUB_CAPTURE_PADEL_HREF = "/padel/capture" as const;
export const HUB_CAPTURE_GOLF_HREF = "/golf/capture" as const;
export const HUB_CAPTURE_DARTS_HREF = "/darts/capture" as const;
export const HUB_ORGANISE_PADEL_HREF = "/padel/organise" as const;
export const HUB_ORGANISE_GOLF_HREF = "/golf/organise" as const;
export const HUB_BROWSE_FIXTURES_HREF = "/events" as const;
export const HUB_FIND_VENUES_HREF = "/venues" as const;
export const HUB_PLAY_HREF = "/play" as const;
/** Play tab and Change sport always land on the sport grid. */
export const HUB_PLAY_TAB_HREF = HUB_PLAY_HREF;
export const HUB_CHANGE_SPORT_HREF = HUB_PLAY_HREF;
export const HUB_CHANGE_SPORT_LABEL = "Change sport" as const;
/**
 * Former global Organise hub. Redirects to `/play` so the user picks a sport
 * first; sport-scoped organise lives under `/play/[sport]` and `/{sport}/organise`.
 */
export const HUB_ORGANISE_HUB_HREF = HUB_PLAY_HREF;
/** Short alias — redirects to `/play`. */
export const HUB_ORGANISE_ALIAS_HREF = "/organise" as const;
export const HUB_ORGANISE_HUB_TITLE = "Organise" as const;
export const HUB_ORGANISE_HUB_SUBTITLE =
  "Find players, team fixtures, tournaments." as const;
/** Profile HI editor — existing You-tab entry. */
export const HUB_GOLF_HANDICAP_HREF = "/?tab=you" as const;
export const HUB_LOBBY_HREF = "/lobby" as const;
export const HUB_WATCH_HREF = "/watch" as const;
export const HUB_GUIDES_HREF = "/guides" as const;
export const HUB_TRAINING_HREF = "/training" as const;
export const HUB_INTEGRATIONS_HREF = "/integrations" as const;
export const HUB_PADEL_HISTORY_HREF = "/padel/history" as const;
export const HUB_GOLF_HISTORY_HREF = "/golf/history" as const;
export const HUB_DARTS_HISTORY_HREF = "/darts/history" as const;

export const HUB_RECENT_LOCK_LIMIT = 8;
export const HUB_BADGE_STRIP_LIMIT = 3;
export const HUB_PEOPLE_PREVIEW_LIMIT = 5;
export const HUB_TEAMS_HREF = "/teams" as const;
export const HUB_TEAMS_NEW_HREF = "/teams/new" as const;
export const HUB_TEAM_MATCHES_HREF = "/team-matches" as const;
export const HUB_TEAM_MATCHES_NEW_HREF = "/team-matches/new" as const;
export const HUB_TOURNAMENTS_HREF = "/tournaments" as const;
export const HUB_TOURNAMENTS_NEW_HREF = "/tournaments/new" as const;
export const HUB_GOLF_TOURS_HREF = "/golf-tours" as const;
export const HUB_GOLF_TOURS_NEW_HREF = "/golf-tours/new" as const;
/** People tab block order — Teams is third under Friends + Communities. */
export const HUB_PEOPLE_BLOCKS = ["communities", "friends", "teams"] as const;
/** Hosted/invited strip on the sport dashboard — keep it short. */
export const HUB_ORGANISED_PREVIEW_LIMIT = 4;

export const HUB_SPORT_CONTROL = "dropdown" as const;
/** Start match/round live inside Play only — never a sticky bar above the nav. */
export const HUB_STICKY_START_ACTIONS = false;

export const HUB_TAB_IDS = ["home", "play", "people", "you"] as const;

export type HubTabId = (typeof HUB_TAB_IDS)[number];

export const HUB_DEFAULT_TAB: HubTabId = "home";

export const HUB_TABS: { id: HubTabId; label: string; href?: string }[] = [
  { id: "home", label: "Home" },
  { id: "play", label: "Play", href: HUB_PLAY_TAB_HREF },
  { id: "people", label: "People" },
  { id: "you", label: "You" },
];

/** Sport dropdown stays on Home only — Play is a dedicated route now. */
export const HUB_SPORT_SCOPED_TABS: HubTabId[] = ["home"];

export const HUB_START_ACTION_TABS: HubTabId[] = ["play"];

export const HUB_HISTORY_OWNER_TAB: HubTabId = "you";

export const HUB_FOR_YOU_EMPTY_CTAS = [
  { href: HUB_BROWSE_FIXTURES_HREF, label: "Browse fixtures" },
  { href: HUB_FIND_VENUES_HREF, label: "Find venues" },
] as const;

export type HubPlayStartSpec = {
  href: string;
  label: string;
  description: string;
};

export const HUB_PLAY_VERB_IDS = ["start", "capture", "organise"] as const;

export type HubPlayVerbId = (typeof HUB_PLAY_VERB_IDS)[number];

export type HubPlayVerbOption = {
  id: HubPlayVerbId;
  label: string;
  description: string;
  /**
   * Optional direct href. Play tab never uses these — sport is picked
   * on `/play`, then the sport dashboard lists Start / Capture / Organise.
   */
  href?: string;
};

/**
 * Play tab is a full page (`/play` grid), not a modal and not last-sport skip.
 * Quick start stays a separate location → venue + sport + friends entry
 * (`HUB_QUICK_START_HREF`). Organise is sport-scoped on `/play/[sport]`.
 */
export const HUB_PLAY_SPORT_PICK = "page" as const;

export const HUB_PLAY_VERBS: readonly HubPlayVerbOption[] = [
  {
    id: "start",
    label: "Start game",
    description: "Open a live scorecard for a playable sport.",
  },
  {
    id: "capture",
    label: "Capture results",
    description: "Record a finished game without a live scorecard.",
  },
  {
    id: "organise",
    label: "Organise",
    description: "Find players, team fixtures, and tournaments.",
    href: HUB_ORGANISE_HUB_HREF,
  },
];

export const HUB_ORGANISE_ROW_IDS = [
  "game",
  "lobby",
  "team-matches",
  "tournaments",
  "golf-tours",
] as const;

export type HubOrganiseRowId = (typeof HUB_ORGANISE_ROW_IDS)[number];

export type HubOrganiseRow = {
  id: HubOrganiseRowId;
  title: string;
  description: string;
  /** Destination page. Sport-scoped organise-a-game hrefs come from `hubPlayOrganiseHref`. */
  href: string | null;
};

export const HUB_PLAY_DASHBOARD_ACTION_IDS = [
  "start",
  "capture",
  "organise",
  "lobby",
  "team-matches",
  "tournaments",
  "golf-tours",
  "handicap",
] as const;

export type HubPlayDashboardActionId =
  (typeof HUB_PLAY_DASHBOARD_ACTION_IDS)[number];

export type HubPlayDashboardGroup = "play" | "with-others" | "golf";

export type HubPlayDashboardAction = {
  id: HubPlayDashboardActionId;
  title: string;
  description: string;
  href: string;
  group: HubPlayDashboardGroup;
};

export type HubPlayGridItem = {
  slug: string;
  name: string;
  href: string;
  description: string;
};

export const HUB_ORGANISE_ROWS: readonly HubOrganiseRow[] = [
  {
    id: "game",
    title: "Organise a game",
    description: "Set a venue and time, then invite friends.",
    href: null,
  },
  {
    id: "lobby",
    title: "Lobby",
    description: "Looking for a game, open games, and proposes.",
    href: HUB_LOBBY_HREF,
  },
  {
    id: "team-matches",
    title: "Team matches",
    description: "Challenge another squad and start a live scorecard.",
    href: HUB_TEAM_MATCHES_HREF,
  },
  {
    id: "tournaments",
    title: "Tournaments",
    description: "Run a single-elim draw and start fixtures as team matches.",
    href: HUB_TOURNAMENTS_HREF,
  },
  {
    id: "golf-tours",
    title: "Golf tours",
    description: "Multi-day camp events across courses, with fourballs and a leaderboard.",
    href: HUB_GOLF_TOURS_HREF,
  },
];

export type HubOrganiseBadgeCounts = {
  lobby?: number;
  teamMatches?: number;
  tournaments?: number;
};

/** Location-based who / what / where entry from the Play tab. */
export const HUB_QUICK_START = {
  href: HUB_QUICK_START_HREF,
  label: "Quick start",
  description:
    "Use your location to pick the nearest venue, sport, and friends.",
} as const;

/**
 * Playable live create-flow map. Later sports (pool) plug in here —
 * catalog `play` capability alone is not enough (watch-only stays out).
 */
export const HUB_PLAY_START_BY_SLUG: Readonly<
  Record<string, HubPlayStartSpec>
> = {
  padel: {
    href: HUB_START_MATCH_HREF,
    label: "Start a match",
    description: "Live scorecard for a four-ball.",
  },
  golf: {
    href: HUB_START_GOLF_HREF,
    label: "Start a round",
    description: "Hole-by-hole scorecard for your group.",
  },
  darts: {
    href: HUB_START_DARTS_HREF,
    label: "Start a game",
    description: "501 double-out live scorecard.",
  },
};

/**
 * Finished-score capture map. Same playable sports as live start for now.
 */
export const HUB_PLAY_CAPTURE_BY_SLUG: Readonly<
  Record<string, HubPlayStartSpec>
> = {
  padel: {
    href: HUB_CAPTURE_PADEL_HREF,
    label: "Capture padel",
    description: "Enter a finished four-ball score.",
  },
  golf: {
    href: HUB_CAPTURE_GOLF_HREF,
    label: "Capture golf",
    description: "Enter a finished round score.",
  },
  darts: {
    href: HUB_CAPTURE_DARTS_HREF,
    label: "Capture darts",
    description: "Enter a finished 501 game.",
  },
};

/**
 * Organise-ahead map. Same playable sports as live start for v1.
 */
export const HUB_PLAY_ORGANISE_BY_SLUG: Readonly<
  Record<string, HubPlayStartSpec>
> = {
  padel: {
    href: HUB_ORGANISE_PADEL_HREF,
    label: "Organise padel",
    description: "Court, time, and optional friend invites.",
  },
  golf: {
    href: HUB_ORGANISE_GOLF_HREF,
    label: "Organise golf",
    description: "Course, time, and optional friend invites.",
  },
};

export type HubPlaySportOption = {
  slug: string;
  name: string;
  verb: HubPlayVerbId;
  href: string;
  label: string;
  description: string;
  /** @deprecated Use `href` — kept so start-verb callers stay readable. */
  startHref: string;
  startLabel: string;
  /** Live/unlocked scorecard href when a clean signal exists; otherwise omitted. */
  continueHref: string | null;
};

export function isHubTabId(value: string): value is HubTabId {
  return (HUB_TAB_IDS as readonly string[]).includes(value);
}

/** Play tab always opens the sport grid — never last-sport or a modal. */
export function hubPlayTabHref(): string {
  return HUB_PLAY_TAB_HREF;
}

export function hubPlayTabOpensModal(): boolean {
  return false;
}

export function hubTabHref(id: HubTabId): string {
  if (id === "play") return HUB_PLAY_TAB_HREF;
  if (id === "home") return "/";
  return `/?tab=${id}`;
}

/** Ignore `?tab=play` — Play is a route, not an in-hub panel. */
export function parseHubTabParam(value: string | null | undefined): HubTabId {
  const trimmed = value?.trim().toLowerCase() ?? "";
  if (trimmed === "play" || !isHubTabId(trimmed)) return HUB_DEFAULT_TAB;
  return trimmed;
}

export function hubChangeSportHref(): string {
  return HUB_CHANGE_SPORT_HREF;
}

export function hubPlaySportHref(slug: string): string {
  const trimmed = slug.trim().toLowerCase();
  return trimmed ? `${HUB_PLAY_HREF}/${encodeURIComponent(trimmed)}` : HUB_PLAY_HREF;
}

export function isHubPlayDashboardSport(slug: string): boolean {
  return hubPlayStartHref(slug) !== null;
}

export function hubPlayGridSports(
  sports: readonly SportDefinition[],
): SportDefinition[] {
  return hubPlayableSports(sports);
}

export function hubPlayGridItems(
  sports: readonly SportDefinition[],
): HubPlayGridItem[] {
  return hubPlayGridSports(sports).map((sport) => ({
    slug: sport.slug,
    name: sport.name,
    href: hubPlaySportHref(sport.slug),
    description:
      HUB_PLAY_START_BY_SLUG[sport.slug]?.description ??
      `Play ${sport.name.toLowerCase()}.`,
  }));
}

export function hubLobbyHrefForSport(slug: string): string {
  const trimmed = slug.trim().toLowerCase();
  return trimmed
    ? `${HUB_LOBBY_HREF}?sport=${encodeURIComponent(trimmed)}`
    : HUB_LOBBY_HREF;
}

export function hubPlayDashboardActions(
  slug: string,
): HubPlayDashboardAction[] {
  const actions: HubPlayDashboardAction[] = [];
  const start = HUB_PLAY_START_BY_SLUG[slug];
  if (start) {
    actions.push({
      id: "start",
      title: start.label,
      description: start.description,
      href: start.href,
      group: "play",
    });
  }
  const capture = HUB_PLAY_CAPTURE_BY_SLUG[slug];
  if (capture) {
    actions.push({
      id: "capture",
      title: capture.label,
      description: capture.description,
      href: capture.href,
      group: "play",
    });
  }
  const organise = HUB_PLAY_ORGANISE_BY_SLUG[slug];
  if (organise) {
    actions.push({
      id: "organise",
      title: "Organise a game",
      description: organise.description,
      href: organise.href,
      group: "with-others",
    });
  }
  if (isHubPlayDashboardSport(slug)) {
    actions.push({
      id: "lobby",
      title: "Lobby",
      description: "Looking for a game, open games, and proposes.",
      href: hubLobbyHrefForSport(slug),
      group: "with-others",
    });
    actions.push({
      id: "team-matches",
      title: "Team matches",
      description: "Challenge another squad and start a live scorecard.",
      href: HUB_TEAM_MATCHES_HREF,
      group: "with-others",
    });
    actions.push({
      id: "tournaments",
      title: "Tournaments",
      description: "Run a single-elim draw and start fixtures as team matches.",
      href: HUB_TOURNAMENTS_HREF,
      group: "with-others",
    });
  }
  if (slug === "golf") {
    actions.push({
      id: "golf-tours",
      title: "Golf tours",
      description:
        "Multi-day camp events across courses, with fourballs and a leaderboard.",
      href: HUB_GOLF_TOURS_HREF,
      group: "golf",
    });
    actions.push({
      id: "handicap",
      title: "Handicap",
      description: "Profile handicap index for net scoring.",
      href: HUB_GOLF_HANDICAP_HREF,
      group: "golf",
    });
  }
  return actions;
}

export function hubShowsSportControl(tab: HubTabId): boolean {
  return HUB_SPORT_SCOPED_TABS.includes(tab);
}

export function hubShowsStartActions(tab: HubTabId): boolean {
  return HUB_START_ACTION_TABS.includes(tab);
}

export function hubOwnsRecentLocks(tab: HubTabId): boolean {
  return tab === HUB_HISTORY_OWNER_TAB;
}

export function hubPlayShowsPadel(active: string): boolean {
  return active === ALL_SPORTS_SLUG || active === "padel";
}

export function hubPlayShowsGolf(active: string): boolean {
  return active === ALL_SPORTS_SLUG || active === "golf";
}

export function hubPlayShowsDarts(active: string): boolean {
  return active === ALL_SPORTS_SLUG || active === "darts";
}

export function hubPlayHref(active: string): string {
  if (active === ALL_SPORTS_SLUG) return HUB_PLAY_HREF;
  const activity = buildIntentActivity({ slug: active });
  if (!activitySupportsIntent(activity, "play")) return HUB_PLAY_HREF;
  return intentPath("play", active);
}

export function hubWatchHref(active: string): string {
  if (active === ALL_SPORTS_SLUG) return HUB_WATCH_HREF;
  const activity = buildIntentActivity({ slug: active });
  if (!activitySupportsIntent(activity, "watch")) return HUB_WATCH_HREF;
  return intentPath("watch", active);
}

export function isHubPlayVerbId(value: string): value is HubPlayVerbId {
  return (HUB_PLAY_VERB_IDS as readonly string[]).includes(value);
}

export function hubPlayStartHref(slug: string): string | null {
  return HUB_PLAY_START_BY_SLUG[slug]?.href ?? null;
}

export function hubPlayCaptureHref(slug: string): string | null {
  return HUB_PLAY_CAPTURE_BY_SLUG[slug]?.href ?? null;
}

export function hubPlayOrganiseHref(slug: string): string | null {
  return HUB_PLAY_ORGANISE_BY_SLUG[slug]?.href ?? null;
}

export function hubPlayHrefForVerb(
  slug: string,
  verb: HubPlayVerbId,
): string | null {
  if (verb === "capture") return hubPlayCaptureHref(slug);
  if (verb === "organise") return hubPlayOrganiseHref(slug);
  return hubPlayStartHref(slug);
}

export function hubPlaySpecForVerb(
  slug: string,
  verb: HubPlayVerbId,
): HubPlayStartSpec | null {
  if (verb === "capture") return HUB_PLAY_CAPTURE_BY_SLUG[slug] ?? null;
  if (verb === "organise") return HUB_PLAY_ORGANISE_BY_SLUG[slug] ?? null;
  return HUB_PLAY_START_BY_SLUG[slug] ?? null;
}

/** Detail for a hosted or invited organised game. */
export function hubOrganisedGameHref(id: string): string {
  const trimmed = id.trim();
  return trimmed ? `/play/organised/${encodeURIComponent(trimmed)}` : HUB_PLAY_HREF;
}

/** Join-via-link page. FE builds this from host `inviteToken`. */
export function hubOrganisedGameJoinHref(token: string): string {
  const trimmed = token.trim();
  return trimmed ? `/play/join/${encodeURIComponent(trimmed)}` : HUB_PLAY_HREF;
}

/** Find players — Looking + open games. */
export function hubLobbyHref(): string {
  return HUB_LOBBY_HREF;
}

export function hubOrganiseHubHref(): string {
  return HUB_ORGANISE_HUB_HREF;
}

export function hubPlayVerbHref(verb: HubPlayVerbOption): string | null {
  return verb.href ?? null;
}

export function hubPlayVerbOpensModal(_verb: HubPlayVerbOption): boolean {
  return false;
}

export function pendingLobbyProposalCount(
  proposals: ReadonlyArray<{ status: string }>,
): number {
  return proposals.filter((proposal) => proposal.status === "pending").length;
}

export function hubOrganiseRowBadge(
  id: HubOrganiseRowId,
  counts: HubOrganiseBadgeCounts = {},
): string | null {
  if (id === "lobby") {
    const n = counts.lobby ?? 0;
    if (n <= 0) return null;
    return n === 1 ? "1 propose" : `${n} proposes`;
  }
  if (id === "team-matches") {
    const n = counts.teamMatches ?? 0;
    if (n <= 0) return null;
    return n === 1 ? "1 upcoming" : `${n} upcoming`;
  }
  if (id === "tournaments") {
    const n = counts.tournaments ?? 0;
    if (n <= 0) return null;
    return n === 1 ? "1 upcoming" : `${n} upcoming`;
  }
  return null;
}

export function isHubPlayableSport(sport: SportDefinition): boolean {
  return (
    sport.capabilities.includes("play") &&
    hubPlayStartHref(sport.slug) !== null
  );
}

export function hubPlayableSports(
  sports: readonly SportDefinition[],
): SportDefinition[] {
  return sports.filter(isHubPlayableSport);
}

/**
 * Continue only when a caller passes a real live/unlocked href for that sport.
 * Hub history is locked results — do not invent a continue from it.
 */
export function hubPlayContinueHref(
  slug: string,
  continueBySlug?: Readonly<Record<string, string>> | null,
): string | null {
  if (!hubPlayStartHref(slug)) return null;
  const href = continueBySlug?.[slug]?.trim();
  return href ? href : null;
}

export function hubPlaySportOptions(
  sports: readonly SportDefinition[],
  active: string,
  continueBySlug?: Readonly<Record<string, string>> | null,
  verb: HubPlayVerbId = "start",
): HubPlaySportOption[] {
  const playable = hubPlayableSports(sports);
  const scoped =
    active === ALL_SPORTS_SLUG
      ? playable
      : playable.filter((sport) => sport.slug === active);

  return scoped.flatMap((sport) => {
    const spec = hubPlaySpecForVerb(sport.slug, verb);
    if (!spec) return [];
    return [
      {
        slug: sport.slug,
        name: sport.name,
        verb,
        href: spec.href,
        label: spec.label,
        description: spec.description,
        startHref: spec.href,
        startLabel: spec.label,
        continueHref:
          verb === "start"
            ? hubPlayContinueHref(sport.slug, continueBySlug)
            : null,
      },
    ];
  });
}

/**
 * Modal sport list is every playable sport — hub focus only filters the feed.
 */
export function hubPlayModalSportOptions(
  sports: readonly SportDefinition[],
  verb: HubPlayVerbId,
): HubPlaySportOption[] {
  return hubPlaySportOptions(sports, ALL_SPORTS_SLUG, null, verb);
}

export function hubPlayModalTitle(verb: HubPlayVerbId): string {
  if (verb === "capture") return "Capture results";
  if (verb === "organise") return "Organise a game";
  return "Start game";
}

export function hubPlayModalDescription(verb: HubPlayVerbId): string {
  if (verb === "capture") return "Pick a sport to record a finished score.";
  if (verb === "organise") {
    return "Pick a sport to set a venue, time, and optional invites.";
  }
  return "Pick a sport to open a live scorecard.";
}

export function hubPlayNearbyHref(active: string): string {
  return hubPlayHref(active);
}

/**
 * Empty-state nearby link. Never emit `/play/{sport}` for sports that
 * do not support play (watch-only like motorsport).
 */
export function hubPlayEmptyNearbyHref(
  active: string,
  sports: readonly SportDefinition[],
): string {
  if (active === ALL_SPORTS_SLUG) return HUB_PLAY_HREF;
  const sport = sports.find((item) => item.slug === active);
  if (sport?.capabilities.includes("play")) return hubPlayHref(active);
  return HUB_FIND_VENUES_HREF;
}

/**
 * Hub search → existing venues / play / watch entry points.
 * Uses `/venues?q=` (same as site SearchAction); the directory already
 * parses `q` into sport/place/intent and redirects to SEO landings.
 */
export function hubSearchHref(query: string, activeSport: string): string {
  const trimmed = query.trim().replace(/\s+/g, " ");
  if (!trimmed) {
    return activeSport === ALL_SPORTS_SLUG
      ? HUB_FIND_VENUES_HREF
      : hubPlayHref(activeSport);
  }

  let scoped = trimmed;
  if (activeSport !== ALL_SPORTS_SLUG) {
    const parsed = parseVenueSearch(trimmed, "play");
    if (!parsed.sportSlug) {
      scoped = `${activeSport.replace(/-/g, " ")} ${trimmed}`;
    }
  }

  return `${HUB_FIND_VENUES_HREF}?q=${encodeURIComponent(scoped)}`;
}

export function takeHubPreview<T>(items: readonly T[], limit: number): T[] {
  return items.slice(0, Math.max(0, limit));
}

export function hubConnectedCount(
  providers: ReadonlyArray<{ status: string }>,
): number {
  return providers.filter((provider) => provider.status === "connected")
    .length;
}
