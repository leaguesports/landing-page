import { hasPlayableGolfCourse } from "../golf/course.ts";
import type { GolfCourseCms } from "../../types/golf-round.ts";
import {
  isPadelVenue,
  type VenueOption,
} from "../padel/venue-options.ts";

export type VenueQuickStartActivity = {
  id: string;
  sportSlug: string;
  name: string;
  href: string;
  cta: string;
  description: string;
};

/** Deep link into `/padel/new` with an optional court preselected. */
export function padelNewHref(venueSlug?: string | null): string {
  const slug = venueSlug?.trim();
  if (!slug) return "/padel/new";
  return `/padel/new?venue=${encodeURIComponent(slug)}`;
}

/** Deep link into `/golf/new` with an optional course preselected. */
export function golfNewHref(venueSlug?: string | null): string {
  const slug = venueSlug?.trim();
  if (!slug) return "/golf/new";
  return `/golf/new?venue=${encodeURIComponent(slug)}`;
}

export type VenueQuickStartInput = Pick<VenueOption, "slug" | "sports"> & {
  golfCourse?: GolfCourseCms | null;
};

/**
 * Match/round-start actions for Play sports this venue actually hosts.
 * Uses the same padel predicate as `/padel/new` court locking, and
 * playable CMS golfCourse for golf rounds. Watch-only broadcasts are ignored.
 */
export function venueQuickStartActivities(
  venue: VenueQuickStartInput,
): VenueQuickStartActivity[] {
  const slug = venue.slug.trim();
  if (!slug) return [];

  const activities: VenueQuickStartActivity[] = [];

  if (isPadelVenue(venue)) {
    activities.push({
      id: "padel",
      sportSlug: "padel",
      name: "Padel",
      href: padelNewHref(slug),
      cta: "Start padel match",
      description: "Open a live scorecard at this court.",
    });
  }

  if (hasPlayableGolfCourse(venue.golfCourse)) {
    activities.push({
      id: "golf",
      sportSlug: "golf",
      name: "Golf",
      href: golfNewHref(slug),
      cta: "Start golf round",
      description: "Open a hole-by-hole scorecard at this course.",
    });
  }

  return activities;
}
