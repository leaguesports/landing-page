/**
 * In-loop recovery for shared scorecard / organise / event / venue / team
 * URLs. Never send a visitor back to marketing `/`.
 */

export type DeepLinkKind =
  | "scorecard"
  | "organise"
  | "event"
  | "venue"
  | "team";

export type DeepLinkRecovery = {
  kind: DeepLinkKind;
  title: string;
  body: string;
  primary: { href: string; label: string };
  secondary: { href: string; label: string };
};

export function missingObjectOgTitle(
  kind: DeepLinkKind,
  objectName: string | null | undefined,
): string {
  const name = objectName?.trim();
  if (kind === "scorecard") {
    return name ? `${name} scorecard` : "Scorecard";
  }
  if (kind === "organise") {
    return name ? `Organised game ${name}` : "Organised game";
  }
  if (kind === "event") {
    return name ? name : "Fixture";
  }
  if (kind === "venue") {
    return name ? name : "Venue";
  }
  return name ? name : "Team";
}

export function deepLinkRecovery(input: {
  kind: DeepLinkKind;
  objectName?: string | null;
  startHref?: string | null;
}): DeepLinkRecovery {
  const name = input.objectName?.trim() || null;
  if (input.kind === "scorecard") {
    return {
      kind: "scorecard",
      title: missingObjectOgTitle("scorecard", name),
      body: name
        ? `This ${name} scorecard is missing or the share link expired.`
        : "This scorecard is missing or the share link expired.",
      primary: {
        href: input.startHref || "/padel/new",
        label: "Start a new scorecard",
      },
      secondary: { href: "/play", label: "Find a place to play" },
    };
  }
  if (input.kind === "organise") {
    return {
      kind: "organise",
      title: missingObjectOgTitle("organise", name),
      body: "This game link is invalid, expired, or you were not invited.",
      primary: { href: "/play", label: "Find a game" },
      secondary: { href: "/padel/organise", label: "Organise a game" },
    };
  }
  if (input.kind === "event") {
    return {
      kind: "event",
      title: missingObjectOgTitle("event", name),
      body: name
        ? `${name} is no longer listed. Browse upcoming fixtures instead.`
        : "This fixture is no longer listed. Browse upcoming fixtures instead.",
      primary: { href: "/events", label: "Browse fixtures" },
      secondary: { href: "/watch", label: "Find where to watch" },
    };
  }
  if (input.kind === "venue") {
    return {
      kind: "venue",
      title: missingObjectOgTitle("venue", name),
      body: name
        ? `${name} is not in the directory. Browse venues near you.`
        : "This venue is not in the directory. Browse venues near you.",
      primary: { href: "/venues", label: "Browse venues" },
      secondary: { href: "/play", label: "Find a place to play" },
    };
  }
  return {
    kind: "team",
    title: missingObjectOgTitle("team", name),
    body: name
      ? `${name} may have been removed, or you need to be a member to view it.`
      : "This squad may have been removed, or you need to be a member to view it.",
    primary: { href: "/teams", label: "Back to teams" },
    secondary: { href: "/play", label: "Find a game" },
  };
}

export function rankVenuesByCity<
  T extends { city?: string | null; suburb?: string | null },
>(venues: T[], city: string | null | undefined): T[] {
  const needle = city?.trim().toLowerCase();
  if (!needle) return venues;
  const scored = venues.map((venue, index) => {
    const cityValue = venue.city?.trim().toLowerCase() ?? "";
    const suburb = venue.suburb?.trim().toLowerCase() ?? "";
    const hit =
      cityValue === needle ||
      suburb === needle ||
      cityValue.replace(/\s+/g, "-") === needle ||
      suburb.replace(/\s+/g, "-") === needle;
    return { venue, index, hit };
  });
  scored.sort((a, b) => {
    if (a.hit !== b.hit) return a.hit ? -1 : 1;
    return a.index - b.index;
  });
  return scored.map((row) => row.venue);
}

export function guideConversionIntent(input: {
  slug?: string | null;
  title?: string | null;
  description?: string | null;
  keywords?: string[] | null;
}): "play" | "watch" {
  const haystack = [
    input.slug,
    input.title,
    input.description,
    ...(input.keywords ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const playHit =
    /\b(play|court|course|padel|golf|darts|book a|find a court)\b/.test(
      haystack,
    );
  const watchHit =
    /\b(watch|screening|screenings|fixture|fan zone|broadcast|where to watch)\b/.test(
      haystack,
    );

  if (playHit && !watchHit) return "play";
  if (watchHit && !playHit) return "watch";
  if (playHit) return "play";
  return "watch";
}
