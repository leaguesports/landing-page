import { getLoginPageHref } from "../auth-return-to.ts";
import { BADGE_CATALOG } from "../badges/catalog.ts";
import { formatProviderStatus } from "../integrations/integrations.ts";

type AthleteUserName = {
  displayName?: string;
  name?: string;
  handle?: string;
};

/** Post-login resume path for every `/athletes` login CTA. */
export const ATHLETES_RETURN_TO = "/athletes";

export const ATHLETES_LOGIN_HREF = getLoginPageHref(ATHLETES_RETURN_TO);

export const ATHLETE_LIVE_HREFS = {
  hub: "/",
  padelNew: "/padel/new",
  golfNew: "/golf/new",
  padelHistory: "/padel/history",
  golfHistory: "/golf/history",
  communities: "/communities",
  training: "/training",
  integrations: "/integrations",
  login: ATHLETES_LOGIN_HREF,
} as const;

/** Honest integrations copy — connectable Import session only. */
export const ATHLETE_INTEGRATION_COPY = {
  eyebrow: "Smart Integrations",
  title: "Connect Import session",
  body: "Import a session so last sync and imported counts on your hub are real. Only connectable providers are listed.",
} as const;

export function athleteDisplayName(user: AthleteUserName): string {
  const display = user.displayName?.trim();
  if (display) return display;
  const name = user.name?.trim();
  if (name) return name;
  const handle = user.handle?.trim();
  if (handle) return handle.startsWith("@") ? handle : `@${handle}`;
  return "Athlete";
}

export function athleteHandle(user: Pick<AthleteUserName, "handle">): string | null {
  const handle = user.handle?.trim();
  if (!handle) return null;
  return handle.startsWith("@") ? handle : `@${handle}`;
}

export type AthleteOverviewCounts = {
  padelLocked: number | null;
  golfLocked: number | null;
  badgeCount: number | null;
  friendCount: number;
  communityCount: number;
  trainingActiveTitle: string | null;
  connectedIntegrations: number;
  connectableIntegrations: number;
};

export type AthletePathId =
  | "games"
  | "progress"
  | "badges"
  | "communities"
  | "training"
  | "integrations";

export type AthletePath = {
  id: AthletePathId;
  title: string;
  description: string;
  href: string;
  stat: string;
};

function formatLockedPair(
  padelLocked: number | null,
  golfLocked: number | null,
): string {
  if (padelLocked === null && golfLocked === null) return "Unavailable";
  const padel = padelLocked ?? 0;
  const golf = golfLocked ?? 0;
  if (padel === 0 && golf === 0) return "None locked yet";
  const parts: string[] = [];
  if (padelLocked !== null) {
    parts.push(`${padel} padel`);
  }
  if (golfLocked !== null) {
    parts.push(`${golf} golf`);
  }
  return parts.join(" · ");
}

export function athletePaths(counts: AthleteOverviewCounts): AthletePath[] {
  return [
    {
      id: "games",
      title: "Games",
      description: "Locked padel matches and golf rounds on your record.",
      href: ATHLETE_LIVE_HREFS.hub,
      stat: formatLockedPair(counts.padelLocked, counts.golfLocked),
    },
    {
      id: "progress",
      title: "Progress",
      description: "Form from locked results — open Progress on your hub.",
      href: ATHLETE_LIVE_HREFS.hub,
      stat: formatLockedPair(counts.padelLocked, counts.golfLocked),
    },
    {
      id: "badges",
      title: "Badges",
      description: `Real milestones from the catalog — ${BADGE_CATALOG.length} you can earn.`,
      href: ATHLETE_LIVE_HREFS.hub,
      stat:
        counts.badgeCount === null
          ? "On your hub"
          : counts.badgeCount === 0
            ? "None yet"
            : `${counts.badgeCount} earned`,
    },
    {
      id: "communities",
      title: "Communities",
      description:
        counts.friendCount > 0
          ? `${counts.friendCount} friend${counts.friendCount === 1 ? "" : "s"} on your hub — plus groups you join.`
          : "Groups you joined or created — city crews and regular hit-arounds.",
      href: ATHLETE_LIVE_HREFS.communities,
      stat:
        counts.communityCount === 0
          ? counts.friendCount > 0
            ? `${counts.friendCount} friends on hub`
            : "None yet"
          : `${counts.communityCount} joined`,
    },
    {
      id: "training",
      title: "Training",
      description: "Curated padel plans — start Accuracy Focus and finish the session.",
      href: ATHLETE_LIVE_HREFS.training,
      stat: counts.trainingActiveTitle ?? "Start a plan",
    },
    {
      id: "integrations",
      title: "Integrations",
      description: ATHLETE_INTEGRATION_COPY.body,
      href: ATHLETE_LIVE_HREFS.integrations,
      stat:
        counts.connectableIntegrations === 0
          ? "Import session"
          : counts.connectedIntegrations === 0
            ? formatProviderStatus("disconnected")
            : `${counts.connectedIntegrations} connected`,
    },
  ];
}
