/** V1 achievement badges — earn rules only from real athlete activity. */

export type BadgeId =
  | "first_lock"
  | "first_win"
  | "matches_5"
  | "first_golf"
  | "whatsapp_share"
  | "first_friend"
  | "hot_form";

export type BadgeDefinition = {
  id: BadgeId;
  name: string;
  description: string;
  /** Short hint shown when not yet earned. */
  howToEarn: string;
};

export const BADGE_CATALOG: readonly BadgeDefinition[] = [
  {
    id: "first_lock",
    name: "First Lock",
    description: "Locked your first padel scorecard.",
    howToEarn: "Play and lock a padel match",
  },
  {
    id: "first_win",
    name: "First Win",
    description: "Won a locked padel match.",
    howToEarn: "Lock a match you won",
  },
  {
    id: "matches_5",
    name: "Match Ready",
    description: "Locked five padel matches.",
    howToEarn: "Lock 5 padel matches",
  },
  {
    id: "first_golf",
    name: "First Round",
    description: "Locked your first golf round.",
    howToEarn: "Lock a golf round",
  },
  {
    id: "whatsapp_share",
    name: "Shared the Score",
    description: "Shared a padel scorecard.",
    howToEarn: "Share a live or locked scorecard",
  },
  {
    id: "first_friend",
    name: "Doubles Partner",
    description: "Connected with a friend on LeagueSports.",
    howToEarn: "Add or accept a friend",
  },
  {
    id: "hot_form",
    name: "Hot Form",
    description: "Three wins in your recent padel form.",
    howToEarn: "Win 3 of your last decided matches",
  },
] as const;

export function badgeById(id: string): BadgeDefinition | undefined {
  return BADGE_CATALOG.find((badge) => badge.id === id);
}
