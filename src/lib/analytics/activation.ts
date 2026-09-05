/**
 * Activation funnel events for the athlete loop:
 * create → share → lock.
 *
 * Prefer these named events in GA before expanding into new sports or owner tools.
 */

export type ActivationEvent =
  | "padel_match_create"
  | "padel_scorecard_share"
  | "padel_match_lock"
  | "badge_earned";

type EventParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (
      command: "event",
      eventName: string,
      params?: EventParams,
    ) => void;
  }
}

export function trackActivation(
  event: ActivationEvent,
  params: EventParams = {},
): void {
  if (typeof window === "undefined") return;
  try {
    window.gtag?.("event", event, {
      ...params,
      engagement_loop: "padel_create_share_lock",
    });
  } catch {
    // Analytics must never break play.
  }
}
