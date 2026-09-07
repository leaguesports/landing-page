import { fixturePlainText } from "./index-bar.ts";
import { FIXTURE_TIMEZONE } from "../sports/events-feed.ts";

export type FixtureMetaInput = {
  title: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoIntro?: string | null;
  competition?: string | null;
  teams?: Array<{ name: string }>;
  startsAt?: string | null;
  venueCount?: number;
};

function formatMetaDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: FIXTURE_TIMEZONE,
  });
}

function teamLine(input: FixtureMetaInput): string {
  const names = (input.teams ?? [])
    .map((team) => team.name.trim())
    .filter(Boolean);
  if (names.length >= 2) return names.join(" vs ");
  if (names.length === 1) return names[0] ?? input.title;
  return input.title.trim();
}

/** Document title / H1: seoTitle, else competition / teams / date. */
export function fixtureSeoTitle(input: FixtureMetaInput): string {
  const override = input.seoTitle?.trim();
  if (override) return override;

  const bits = [teamLine(input)];
  const competition = input.competition?.trim();
  if (competition) bits.push(competition);
  const date = formatMetaDate(input.startsAt);
  if (date) bits.push(date);
  return bits.join(" · ");
}

export function fixtureSeoDescription(input: FixtureMetaInput): string {
  const override = input.seoDescription?.trim();
  if (override) return override;

  const intro = fixturePlainText(input.seoIntro ?? "");
  if (intro) {
    if (intro.length <= 160) return intro;
    const clipped = intro.slice(0, 157).replace(/\s+\S*$/, "");
    return `${clipped}…`;
  }

  const title = teamLine(input);
  const venueCount = input.venueCount ?? 0;
  if (venueCount > 0) {
    return `Live updates for ${title} plus ${venueCount} venue${venueCount === 1 ? "" : "s"} screening nearby.`;
  }
  return `Live feed and watch options for ${title} on LeagueSports.`;
}
