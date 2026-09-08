/**
 * GA4 conversion helper. Client-only — never fires during SSR so events
 * are not double-counted. Uses existing `gtag` from `@next/third-parties`
 * when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set.
 *
 * No PII: emails, names, phones, tokens, and free-text identity fields
 * are stripped before the event is sent.
 */

export const CONVERSION_EVENTS = [
  "cta_click",
  "game_start",
  "game_lock",
  "share_click",
  "deep_link_land",
  "auth_soft_wall",
  "generate_lead",
  "roadmap_vote",
  "conversion_fallback",
  "lobby_looking_on",
  "lobby_post_open",
  "lobby_join",
  "lobby_propose_shown",
  "lobby_propose_accept",
] as const;

export type ConversionEvent = (typeof CONVERSION_EVENTS)[number];

export const PAGE_TYPES = [
  "play_city_sport",
  "watch_city_sport",
  "guide",
  "event",
  "venue",
  "scorecard",
  "organise",
  "lobby",
  "team",
  "roadmap",
  "other",
] as const;

export type PageType = (typeof PAGE_TYPES)[number];

export const CTA_SLOTS = ["hero", "sticky", "inline", "empty"] as const;
export type CtaSlot = (typeof CTA_SLOTS)[number];

/** Mark these as GA4 conversions in the Admin UI. */
export const GA4_CONVERSION_EVENTS = [
  "game_start",
  "game_lock",
  "generate_lead",
  "share_click",
] as const;

export type TrackParamValue = string | number | boolean | undefined;
export type TrackParams = Record<string, TrackParamValue>;

const PII_KEY =
  /^(email|e-mail|name|display_name|displayName|full_name|fullName|first_name|last_name|phone|tel|mobile|token|user_email|userEmail|user_name|userName)$/i;

const SAFE_SLUG = /^[a-z0-9][a-z0-9_-]{0,63}$/;

const SPORT_ENUMS = new Set([
  "padel",
  "golf",
  "darts",
  "rugby",
  "soccer",
  "football",
  "cricket",
  "tennis",
  "squash",
  "karting",
  "pool",
  "bowling",
  "sim-racing",
  "motorsport",
  "f1",
  "f2",
  "motogp",
]);

declare global {
  interface Window {
    gtag?: (
      command: "event",
      eventName: string,
      params?: Record<string, TrackParamValue>,
    ) => void;
    dataLayer?: unknown[];
  }
}

export function isConversionEvent(value: string): value is ConversionEvent {
  return (CONVERSION_EVENTS as readonly string[]).includes(value);
}

export function isPageType(value: string): value is PageType {
  return (PAGE_TYPES as readonly string[]).includes(value);
}

export function isCtaSlot(value: string): value is CtaSlot {
  return (CTA_SLOTS as readonly string[]).includes(value);
}

/** Slug-shaped ids only — drop free-text that could carry PII. */
export function toSafeEnum(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const slug = value.trim().toLowerCase().replace(/\s+/g, "-");
  if (!SAFE_SLUG.test(slug)) return undefined;
  return slug;
}

export function sanitizeTrackParams(params: TrackParams = {}): TrackParams {
  const next: TrackParams = {};
  for (const [key, raw] of Object.entries(params)) {
    if (PII_KEY.test(key)) continue;
    if (raw === undefined) continue;
    if (typeof raw === "string") {
      const lower = raw.toLowerCase();
      if (lower.includes("@") && lower.includes(".")) continue;
      if (key === "page_type" && !isPageType(raw)) {
        next[key] = "other";
        continue;
      }
      if (key === "cta_slot" && !isCtaSlot(raw)) continue;
      if (key === "sport" && typeof raw === "string") {
        const safe = toSafeEnum(raw);
        if (!safe || !SPORT_ENUMS.has(safe)) continue;
        next[key] = safe;
        continue;
      }
      if (
        (key === "city" || key === "slug" || key.endsWith("_slug")) &&
        typeof raw === "string"
      ) {
        const safe = toSafeEnum(raw);
        if (!safe) continue;
        next[key] = safe;
        continue;
      }
    }
    next[key] = raw;
  }
  return next;
}

/**
 * Fire a named GA4 event. No-ops on the server and when gtag is absent.
 * Never throws — analytics must not break play.
 */
export function track(event: ConversionEvent, params: TrackParams = {}): void {
  if (typeof window === "undefined") return;
  if (!isConversionEvent(event)) return;
  const safe = sanitizeTrackParams(params);
  try {
    window.gtag?.("event", event, safe);
  } catch {
    // Analytics must never break play.
  }
}
