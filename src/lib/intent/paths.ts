export type IntentKind = "watch" | "play";

/** Canonical SEO path for an intent landing. */
export function intentPath(
  intent: IntentKind,
  activitySlug?: string | null,
  locationSlug?: string | null,
): string {
  const activity = activitySlug?.trim();
  const location = locationSlug?.trim();
  if (!activity) return `/${intent}`;
  if (!location) return `/${intent}/${activity}`;
  return `/${intent}/${activity}/${location}`;
}

/**
 * Prefer clean SEO landings when intent + activity are known.
 * Location-only filters stay on the venues directory.
 */
export function intentOrDirectoryHref(next: {
  intent?: string | null;
  sport?: string | null;
  location?: string | null;
}): string {
  const intent =
    next.intent === "play" || next.intent === "watch" ? next.intent : null;
  const sport = next.sport?.trim() || null;
  const location = next.location?.trim() || null;

  if (intent && sport) {
    return intentPath(intent, sport, location);
  }

  if (intent && !sport && !location) {
    return intentPath(intent);
  }

  const params = new URLSearchParams();
  if (intent) params.set("intent", intent);
  if (sport) params.set("sport", sport);
  if (location) params.set("location", location);
  const qs = params.toString();
  return qs ? `/venues?${qs}` : "/venues";
}
