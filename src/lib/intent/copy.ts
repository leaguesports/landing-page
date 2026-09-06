import type { IntentKind } from "./paths.ts";
import type { IntentActivity } from "./activity.ts";

export type IntentFaq = {
  question: string;
  answer: string;
};

export function intentDetailTitle(
  intent: IntentKind,
  activityName: string,
  locationTitle: string,
): string {
  if (intent === "watch") {
    return `Watch ${activityName} in ${locationTitle}`;
  }
  return `Play ${activityName} in ${locationTitle}`;
}

/** Visible H1 — keep aligned with the title/search phrase. */
export function intentDetailHeading(
  intent: IntentKind,
  activityName: string,
  locationTitle: string,
): string {
  return intentDetailTitle(intent, activityName, locationTitle);
}

export function intentDetailDescription(
  intent: IntentKind,
  activityName: string,
  locationTitle: string,
  venueCount: number,
  extras?: { amenityHint?: string | null; screeningHint?: string | null },
): string {
  const amenityHint = extras?.amenityHint?.trim();
  const screeningHint = extras?.screeningHint?.trim();

  if (intent === "watch") {
    if (venueCount <= 0) {
      return `Looking for somewhere to watch ${activityName} in ${locationTitle}? Browse nearby sports bars and fan zones on LeagueSports, or try a neighbouring suburb.`;
    }
    const base = `Find ${venueCount} ${venueCount === 1 ? "venue" : "venues"} screening ${activityName} in ${locationTitle}. Compare bars and fan zones, then open a venue page to go.`;
    const bits = [amenityHint, screeningHint].filter(Boolean);
    if (bits.length === 0) return base;
    const enriched = `${base} ${bits.join(" ")}`;
    return enriched.length <= 160 ? enriched : base;
  }

  if (venueCount <= 0) {
    return `Looking for somewhere to play ${activityName} in ${locationTitle}? Browse nearby courts and clubs on LeagueSports, or try a neighbouring suburb.`;
  }
  const base = `Find ${venueCount} ${venueCount === 1 ? "venue" : "venues"} to play ${activityName} in ${locationTitle}. Compare courts and clubs, then start a session.`;
  if (!amenityHint) return base;
  const enriched = `${base} ${amenityHint}`;
  return enriched.length <= 160 ? enriched : base;
}

export function intentBrowseTitle(
  intent: IntentKind,
  activityName: string,
): string {
  return intent === "watch"
    ? `Watch ${activityName} near you`
    : `Play ${activityName} near you`;
}

export function intentBrowseDescription(
  intent: IntentKind,
  activityName: string,
): string {
  return intent === "watch"
    ? `Choose an area to see bars and fan zones screening ${activityName} across South Africa.`
    : `Choose an area to see courts and clubs hosting ${activityName} across South Africa.`;
}

export function intentLandingTitle(intent: IntentKind): string {
  return intent === "watch"
    ? "Watch live sport at a venue"
    : "Play sport at a venue near you";
}

export function intentLandingDescription(intent: IntentKind): string {
  return intent === "watch"
    ? "Find bars and fan zones screening live sport. Pick a sport or series, then choose your suburb."
    : "Find courts, clubs, and pitches near you. Pick a sport, then choose your suburb.";
}

export function intentDetailFaqs(input: {
  intent: IntentKind;
  activity: IntentActivity;
  locationTitle: string;
  venueCount: number;
}): IntentFaq[] {
  const { intent, activity, locationTitle, venueCount } = input;
  const verb = intent === "watch" ? "watch" : "play";
  const placeNoun = intent === "watch" ? "bars and fan zones" : "courts and clubs";

  return [
    {
      question: `Where can I ${verb} ${activity.name} in ${locationTitle}?`,
      answer:
        venueCount > 0
          ? `LeagueSports lists ${venueCount} ${venueCount === 1 ? "venue" : "venues"} in and around ${locationTitle} where you can ${verb} ${activity.name}. Open a venue for address, amenities, and contact details.`
          : `We are still adding ${placeNoun} for ${activity.name} in ${locationTitle}. Browse nearby areas or the full venues directory while coverage grows.`,
    },
    {
      question:
        intent === "watch"
          ? `Do these venues show ${activity.name} live?`
          : `Can I book ${activity.name} at these venues?`,
      answer:
        intent === "watch"
          ? `Listings are tagged for ${activity.name} broadcasts in our CMS. Check each venue page for screens, food, parking, and upcoming screenings.`
          : `Venues on this page host ${activity.name}. Open a venue page for contact details, then book directly with the club or start a LeagueSports scorecard when available.`,
    },
    {
      question: `How do I get alerts for ${activity.name}?`,
      answer:
        intent === "watch"
          ? `Follow fixtures on the Events hub and follow venues you care about so match-day screenings stay easy to find.`
          : `Follow venues you play at and keep your athlete profile up to date so friends and rematches are easier to organise.`,
    },
  ];
}
