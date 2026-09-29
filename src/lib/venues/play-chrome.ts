/**
 * Venue-detail Play chrome (issue #257).
 *
 * Match history, leaderboards, and friends-played shells are the padel /
 * golf / darts product. Climbing, karting, and other play sports keep their
 * sport chips, but not locked padel/golf/darts boards or fixture CTAs.
 * No new CMS flags — same signals as quick start and the sport catalog.
 */

import { isDartsSportLabel } from "../darts/venue-options.ts";
import { hasPlayableGolfCourse } from "../golf/course.ts";
import { isGolfSportLabel } from "../golf/venue-options.ts";
import { isPadelSportLabel } from "../padel/venue-options.ts";
import {
  resolveSportSlug,
  SPORT_CATALOG,
  toHubSportSlug,
} from "../sports/catalog.ts";
import type { GolfCourseCms } from "../../types/golf-round.ts";

/** Hub sports whose locked results feed match history and venue leaderboards. */
export const PLAY_RESULTS_SPORT_SLUGS = ["padel", "golf", "darts"] as const;

export type PlayResultsSportSlug = (typeof PLAY_RESULTS_SPORT_SLUGS)[number];

const PLAY_RESULTS_HUB_SLUGS = new Set<string>(PLAY_RESULTS_SPORT_SLUGS);

/**
 * Events-list sports (watch or calendar). Padel is excluded: a play court
 * gets a scorecard, not "Find fixtures", unless the venue actually screens.
 */
const FIXTURE_HUB_SLUGS = new Set(
  SPORT_CATALOG.filter(
    (sport) =>
      (sport.capabilities.includes("watch") ||
        sport.capabilities.includes("calendar")) &&
      !PLAY_RESULTS_HUB_SLUGS.has(sport.slug),
  ).map((sport) => sport.slug),
);

export type VenuePlaySportRef = {
  _id?: string | null;
  name?: string | null;
  slug?: string | null;
};

export type VenuePlayChromeInput = {
  /** Play sports hosted at the venue (`sports`, not `broadcasts`). */
  sports?: readonly (VenuePlaySportRef | string)[] | null;
  broadcasts?: readonly (VenuePlaySportRef | string)[] | null;
  /** CMS golf scorecard. A playable course counts as golf even without a tag. */
  golfCourse?: GolfCourseCms | null;
};

function hasText(value: string | null | undefined): boolean {
  return Boolean(value?.trim());
}

function labelsOf(
  sport: VenuePlaySportRef | string | null | undefined,
): string[] {
  if (!sport) return [];
  if (typeof sport === "string") return hasText(sport) ? [sport.trim()] : [];
  const labels: string[] = [];
  if (hasText(sport.name)) labels.push(sport.name!.trim());
  if (hasText(sport.slug)) labels.push(sport.slug!.trim());
  return labels;
}

/** Name and slug labels on linked Play sports. */
export function venuePlaySportLabels(
  venue: Pick<VenuePlayChromeInput, "sports">,
): string[] {
  return (venue.sports ?? []).flatMap((sport) => labelsOf(sport));
}

/**
 * Padel, golf, or darts — including the same aliases as court/board locking
 * (`paddle`, `dart`, `autodarts`). Indoor-golf and driving-range tags are not
 * golf unless the venue also has a playable course.
 */
export function isPlayResultsSportLabel(value: string): boolean {
  return (
    isPadelSportLabel(value) ||
    isGolfSportLabel(value) ||
    isDartsSportLabel(value)
  );
}

/**
 * True when this venue hosts a sport with match-history and leaderboard
 * support: a linked padel, golf, or darts Play sport, or a playable CMS
 * golf course (the same signal as starting a round).
 */
export function venueSupportsPlayResults(
  venue: VenuePlayChromeInput,
): boolean {
  if (venuePlaySportLabels(venue).some(isPlayResultsSportLabel)) return true;
  return hasPlayableGolfCourse(venue.golfCourse);
}

export function venueShowsMatchHistory(venue: VenuePlayChromeInput): boolean {
  return venueSupportsPlayResults(venue);
}

export function venueShowsLeaderboards(venue: VenuePlayChromeInput): boolean {
  return venueSupportsPlayResults(venue);
}

/** At least one linked Play sport with a name or slug — the sport chips. */
export function venueShowsPlaySports(
  venue: Pick<VenuePlayChromeInput, "sports">,
): boolean {
  return venuePlaySportLabels(venue).length > 0;
}

/**
 * Linked Watch sport. Same id / name / slug signal as `venueHasBroadcasts`.
 */
function venueHasLinkedBroadcasts(
  venue: Pick<VenuePlayChromeInput, "broadcasts">,
): boolean {
  return (venue.broadcasts ?? []).some((item) => {
    if (!item) return false;
    if (typeof item === "string") return hasText(item);
    return hasText(item._id) || hasText(item.name) || hasText(item.slug);
  });
}

/**
 * Sports section, including the Play card. Hidden when there is nothing to
 * list — no empty "Sports at this venue / Play" shell.
 */
export function venueShowsSportsSection(venue: VenuePlayChromeInput): boolean {
  return venueShowsPlaySports(venue) || venueHasLinkedBroadcasts(venue);
}

/** Rugby, soccer, cricket, motorsport, and other events-list sports. */
export function isFixtureSportLabel(value: string): boolean {
  const resolved = resolveSportSlug(value);
  if (!resolved) return false;
  const hub = toHubSportSlug(resolved) ?? resolved;
  return FIXTURE_HUB_SLUGS.has(hub);
}

/**
 * "Find fixtures" is an events-list CTA.
 * Show it when the venue screens sport (`supportsWatch` from
 * `venueSupportsWatch`) or a linked sport owns the events list.
 * Climbing, karting, padel, golf, and darts do not, unless they also screen.
 */
export function venueShowsFindFixtures(
  venue: VenuePlayChromeInput,
  supportsWatch: boolean,
): boolean {
  if (supportsWatch) return true;
  const labels = [
    ...venuePlaySportLabels(venue),
    ...(venue.broadcasts ?? []).flatMap((item) => labelsOf(item)),
  ];
  return labels.some(isFixtureSportLabel);
}
