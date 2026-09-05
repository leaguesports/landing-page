import { makeGuestPlayer, makeUserPlayer } from "./recent-players.ts";
import type { VenueOption } from "./venue-options.ts";
import type { PadelPlayer } from "../../types/padel-match.ts";

export const LAST_PADEL_VENUE_SLUG_KEY = "leaguesports:last-padel-venue-slug";

export type QuickStartSlotKey = "a1" | "a2" | "b1" | "b2";

/** Serializable signed-in self seeded from RSC `getServerAuthState()`. */
export type QuickStartInitialSelf = {
  id: string;
  displayName: string;
};

export function findVenueBySlug(
  venues: VenueOption[],
  slug: string | null | undefined,
): VenueOption | null {
  const key = slug?.trim().toLowerCase();
  if (!key) return null;
  return venues.find((venue) => venue.slug.toLowerCase() === key) ?? null;
}

/**
 * Prefer locked/initial slug, then last-used (if still in directory), else first court.
 * Returns null when the directory is empty — never invent a venue.
 */
export function selectDefaultPadelVenue(
  venues: VenueOption[],
  opts?: {
    initialVenueSlug?: string | null;
    lastUsedSlug?: string | null;
  },
): VenueOption | null {
  if (venues.length === 0) return null;

  const locked = findVenueBySlug(venues, opts?.initialVenueSlug);
  if (locked) return locked;

  const lastUsed = findVenueBySlug(venues, opts?.lastUsedSlug);
  if (lastUsed) return lastUsed;

  return venues[0] ?? null;
}

export function readLastPadelVenueSlug(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LAST_PADEL_VENUE_SLUG_KEY);
    const slug = raw?.trim() ?? "";
    return slug || null;
  } catch {
    return null;
  }
}

export function writeLastPadelVenueSlug(slug: string): void {
  if (typeof window === "undefined") return;
  const value = slug.trim();
  if (!value) return;
  try {
    localStorage.setItem(LAST_PADEL_VENUE_SLUG_KEY, value);
  } catch {
    // ignore quota / private mode
  }
}

/** Demo guests used by Quick-fill and one-tap defaults (Alex / Sam / Jordan / Riley). */
export function buildDemoGuestSlots(
  selfPlayer: PadelPlayer | null,
): Record<QuickStartSlotKey, PadelPlayer> {
  return {
    a1: selfPlayer ?? makeGuestPlayer("Alex"),
    a2: makeGuestPlayer("Sam"),
    b1: makeGuestPlayer("Jordan"),
    b2: makeGuestPlayer("Riley"),
  };
}

/**
 * Turn a server-seeded self into a padel player, or null when signed out.
 * Used so first paint can seat A1 before client `/api/auth/me` resolves.
 */
export function playerFromInitialSelf(
  initialSelf: QuickStartInitialSelf | null | undefined,
): PadelPlayer | null {
  const id = initialSelf?.id?.trim();
  if (!id) return null;
  const displayName = initialSelf?.displayName?.trim() || "You";
  return makeUserPlayer({
    id,
    displayName,
    userId: id,
  });
}

/** Resolve one-tap default slots from optional server auth self. */
export function resolveInitialQuickStartSlots(
  initialSelf: QuickStartInitialSelf | null | undefined,
): Record<QuickStartSlotKey, PadelPlayer> {
  return buildDemoGuestSlots(playerFromInitialSelf(initialSelf));
}

/**
 * Seat the signed-in user in A1 only when that slot is empty and they are not
 * already elsewhere. Never overwrite an intentional A1 pick.
 */
export function seatSelfInA1IfNeeded(
  slots: Record<QuickStartSlotKey, PadelPlayer | null>,
  selfPlayer: PadelPlayer,
): Record<QuickStartSlotKey, PadelPlayer | null> {
  const alreadySeated = Object.values(slots).some(
    (player) => player?.userId === selfPlayer.userId,
  );
  if (alreadySeated || slots.a1) return slots;
  return { ...slots, a1: selfPlayer };
}
